import { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { prismaClient } from '../lib/prisma';
import { AccountType } from '../../generated/prisma';
import { authenticate } from '../middlewares/auth';
import { IQuerystring, IParams } from '../types/requestTypes';

export async function accountRoutes(fastify: FastifyInstance) {
    const accountSchema = z.object({
        name: z.string().min(1, 'Nome é obrigatório'),
        type: z.enum(['poupanca', 'corrente', 'salario'], {
            message: 'Tipo de conta inválido',
        }),
    });

    fastify.addHook('onRequest', authenticate);

    fastify.post('/accounts', async (request, reply) => {
        const { name, type } = accountSchema.parse(request.body);

        const newAccount = await prismaClient.account.create({
            data: {
                userId: request.user.id,
                name,
                type: type.toUpperCase() as AccountType,
            },
        });

        return reply
            .status(201)
            .send({ message: 'Conta criada com sucesso', data: newAccount });
    });

    fastify.get<{ Querystring: IQuerystring }>('/accounts', async (request, reply) => {
        const page = Number(request.query.page) || 1;
        const limit = Number(request.query.limit) || 5;
        const skip = (page - 1) * limit;
        const total = await prismaClient.account.count({
            where: { userId: request.user.id },
        });
        const totalPages = Math.ceil(total / limit);

        const accounts = await prismaClient.account.findMany({
            where: { userId: request.user.id },
            skip,
            take: limit,
        });

        return reply.status(200).send({
            message: 'Contas listadas com sucesso!',
            total,
            totalPages,
            data: accounts,
        });
    });

    fastify.get<{ Params: IParams }>('/accounts/:id', async (request, reply) => {
        const accountId = request.params.id;

        const account = await prismaClient.account.findUnique({
            where: { id: accountId, userId: request.user.id },
        });

        if (!account) {
            return reply.status(404).send({ message: 'Conta não encontrada' });
        }

        const incomes = await prismaClient.transaction.findMany({
            where: {
                accountId: account.id,
                category: {
                    is: {
                        name: 'Entrada',
                    },
                },
            },
            select: { ammount: true },
        });

        const expenses = await prismaClient.transaction.findMany({
            where: {
                accountId: account.id,
                category: {
                    is: {
                        name: 'Saída',
                    },
                },
            },
            select: { ammount: true },
        });

        const incomesTotal = incomes.reduce((sum, income) => sum + income.ammount, 0);
        const expensesTotal = expenses.reduce((sum, expense) => sum + expense.ammount, 0);

        const balance = incomesTotal - expensesTotal;

        return reply.status(200).send({
            message: 'Conta encontrada com sucesso',
            data: {
                ...account,
                incomes: incomesTotal,
                expenses: expensesTotal,
                balance,
            },
        });
    });
}
