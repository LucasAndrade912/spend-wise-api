import { z } from 'zod';
import { FastifyInstance } from 'fastify';

import { prismaClient } from '../lib/prisma';
import { authenticate } from '../middlewares/auth';
import { IQuerystring } from '../types/queryString';

interface IParams {
    id: string;
}

export async function transactionRoutes(fastify: FastifyInstance) {
    fastify.addHook('onRequest', authenticate);

    const getTransactionSchema = z.object({
        accountId: z.string().cuid('ID de conta inválido'),
    });

    const transactionSchema = z.object({
        accountId: z.string().cuid('ID de conta inválido'),
        description: z.string().optional(),
        amount: z.number().min(0, 'Valor deve ser positivo'),
        date: z.string().datetime('Data inválida'),
        type: z.enum(['Entrada', 'Saída'], {
            message: 'Tipo de transação inválido',
        }),
    });

    fastify.get<{ Querystring: IQuerystring }>(
        '/transactions',
        async (request, reply) => {
            const { accountId } = getTransactionSchema.parse(request.query);

            const account = await prismaClient.account.findUnique({
                where: { id: accountId, userId: request.user.id },
            });

            if (!account) {
                return reply
                    .status(404)
                    .send({ message: 'Conta não encontrada', data: null });
            }

            const page = Number(request.query.page) || 1;
            const limit = Number(request.query.limit) || 5;
            const skip = (page - 1) * limit;

            const transactions = await prismaClient.transaction.findMany({
                where: { accountId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            });

            const total = await prismaClient.transaction.count({
                where: { accountId },
            });
            const totalPages = Math.ceil(total / limit);

            return reply.status(200).send({
                message: 'Transações listadas com sucesso!',
                total,
                totalPages,
                data: transactions,
            });
        }
    );

    fastify.post('/transactions', async (request, reply) => {
        const { accountId, description, amount, date, type } = transactionSchema.parse(
            request.body
        );

        const account = await prismaClient.account.findUnique({
            where: { id: accountId, userId: request.user.id },
        });

        if (!account) {
            return reply
                .status(404)
                .send({ message: 'Conta não encontrada', data: null });
        }

        const transactionCategory = await prismaClient.transactionCategory.findUnique({
            where: { name: type },
            select: { id: true },
        });

        if (!transactionCategory) {
            return reply
                .status(404)
                .send({ message: 'Categoria de transação não encontrada', data: null });
        }

        const transaction = await prismaClient.transaction.create({
            data: {
                accountId,
                description,
                amount,
                date: new Date(date),
                transactionCategoryId: transactionCategory.id,
            },
        });

        return reply.status(201).send({
            message: 'Transação criada com sucesso!',
            data: transaction,
        });
    });

    fastify.get<{ Params: IParams }>('/transactions/:id', async (request, reply) => {
        const transactionId = request.params.id as string;

        const transaction = await prismaClient.transaction.findUnique({
            where: { id: transactionId },
            include: { account: true, category: true },
        });

        if (!transaction) {
            return reply
                .status(404)
                .send({ message: 'Transação não encontrada', data: null });
        }

        if (transaction.account.userId !== request.user.id) {
            return reply.status(403).send({ message: 'Acesso negado', data: null });
        }

        return reply.status(200).send({
            message: 'Transação encontrada com sucesso!',
            data: transaction,
        });
    });

    fastify.delete<{ Params: IParams }>('/transactions/:id', async (request, reply) => {
        const transactionId = request.params.id as string;

        const transaction = await prismaClient.transaction.findUnique({
            where: { id: transactionId },
            include: { account: true },
        });

        if (!transaction) {
            return reply
                .status(404)
                .send({ message: 'Transação não encontrada', data: null });
        }

        if (transaction.account.userId !== request.user.id) {
            return reply.status(403).send({ message: 'Acesso negado', data: null });
        }

        await prismaClient.transaction.delete({
            where: { id: transactionId },
        });

        return reply
            .status(200)
            .send({ message: 'Transação deletada com sucesso', data: null });
    });

    fastify.put<{ Params: IParams }>('/transactions/:id', async (request, reply) => {
        const transactionId = request.params.id as string;

        const { description, amount, date, type } = transactionSchema.parse(request.body);

        const transaction = await prismaClient.transaction.findUnique({
            where: { id: transactionId },
            include: { account: true },
        });

        if (!transaction) {
            return reply
                .status(404)
                .send({ message: 'Transação não encontrada', data: null });
        }

        if (transaction.account.userId !== request.user.id) {
            return reply.status(403).send({ message: 'Acesso negado', data: null });
        }

        const transactionCategory = await prismaClient.transactionCategory.findUnique({
            where: { name: type },
            select: { id: true },
        });

        if (!transactionCategory) {
            return reply
                .status(404)
                .send({ message: 'Categoria de transação não encontrada', data: null });
        }

        const updatedTransaction = await prismaClient.transaction.update({
            where: { id: transactionId },
            data: {
                description,
                amount,
                date: new Date(date),
                transactionCategoryId: transactionCategory.id,
            },
        });

        return reply.status(200).send({
            message: 'Transação atualizada com sucesso!',
            data: updatedTransaction,
        });
    });
}
