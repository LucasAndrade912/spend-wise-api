import { FastifyInstance } from 'fastify';

export async function authRoutes(fastify: FastifyInstance) {
    fastify.get('/sign-in', async (request, reply) => {
        return reply.send({ message: 'Sign in' });
    });

    fastify.get('/sign-up', async (request, reply) => {
        return reply.send({ message: 'Sign up' });
    });
}
