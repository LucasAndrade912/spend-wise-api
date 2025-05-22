import fastify from 'fastify';

import { authRoutes } from './routes/authRoutes';

const server = fastify({ logger: true });

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
