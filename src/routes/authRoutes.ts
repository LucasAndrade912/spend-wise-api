import { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { prismaClient } from '../lib/prisma';
import { hashPassword } from '../lib/hash';

export async function authRoutes(fastify: FastifyInstance) {
    const signUpSchema = z.object({
        name: z.string().min(1, 'Nome é obrigatório'),
        email: z.string().email('Email inválido'),
        password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
        confirmPassword: z
            .string()
            .min(8, 'Confirmação de senha deve ter pelo menos 8 caracteres'),
    });

    fastify.post('/sign-in', async (request, reply) => {
        return reply.send({ message: 'Sign in' });
    });

    fastify.post('/sign-up', async (request, reply) => {
        const { name, email, password, confirmPassword } = signUpSchema.parse(
            request.body
        );

        if (password !== confirmPassword) {
            return reply
                .status(400)
                .send({ message: 'Senhas não coincidem', data: null });
        }

        const existingUser = await prismaClient.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return reply.status(400).send({ message: 'Email já cadastrado', data: null });
        }

        const hashedPassword = await hashPassword(password);

        const user = await prismaClient.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        const token = fastify.jwt.sign(
            { id: user.id, email: user.email },
            { expiresIn: '1h' }
        );

        return reply
            .status(201)
            .send({ message: 'Usuário criado com sucesso', data: { token } });
    });
}
