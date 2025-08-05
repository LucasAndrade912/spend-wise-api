import { FastifyInstance } from 'fastify';

import { prismaClient } from '../lib/prisma';
import { authenticate } from '../middlewares/auth';
import { IQuerystringBankStatementByMonth } from '../types/requestTypes';

export async function bankStatementRoutes(fastify: FastifyInstance) {
    fastify.addHook('onRequest', authenticate);

    fastify.get<{ Querystring: IQuerystringBankStatementByMonth }>(
        '/transactions/bankStatementByMonth',
        async (request, reply) => {
            const { month, accountId } = request.query;

            if (Number(month) < 1 || Number(month) > 12) {
                return reply
                    .status(400)
                    .send({ message: 'Informe um mês válido', data: null });
            }

            const account = await prismaClient.account.findUnique({
                where: {
                    id: accountId,
                },
            });

            if (!account) {
                return reply
                    .status(404)
                    .send({ message: 'Conta não encontrada', data: null });
            }

            const startDate = new Date(new Date().getFullYear(), Number(month), 1);
            const endDate = new Date(new Date().getFullYear(), Number(month) + 1, 1);

            const page = Number(request.query.page) || 1;
            const limit = Number(request.query.limit) || 5;
            const skip = (page - 1) * limit;

            const transactions = await prismaClient.transaction.findMany({
                where: {
                    accountId: account.id,
                    date: {
                        gte: startDate,
                        lt: endDate,
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    category: { select: { name: true } },
                },
            });

            const total = await prismaClient.transaction.count({
                where: {
                    accountId: account.id,
                    date: {
                        gte: startDate,
                        lt: endDate,
                    },
                },
            });
            const totalPages = Math.ceil(total / limit);

            return reply.status(200).send({
                message: 'Transações filtradas com sucesso',
                data: transactions,
                total,
                totalPages,
            });
        }
    );
}
