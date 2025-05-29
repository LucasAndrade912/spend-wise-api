import { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { prismaClient } from '../lib/prisma';
import { AccountType } from '../../generated/prisma';
import { authenticate } from '../middlewares/auth';

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
}
