import fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';

import { authRoutes } from './routes/authRoutes';

const server = fastify({ logger: true });

server.register(fastifyJwt, { secret: process.env.SECRET || 'jwt-default-secret' });
server.register(authRoutes, { prefix: '/auth' });

const start = async () => {
    try {
        await server.listen({ port: 3333 });
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
