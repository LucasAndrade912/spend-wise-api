import fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import cors from '@fastify/cors';

import { authRoutes } from './routes/authRoutes';
import { accountRoutes } from './routes/accountRoutes';
import { transactionRoutes } from './routes/transactionRoutes';

export const app = fastify({ logger: true });

app.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});
app.register(fastifyJwt, { secret: process.env.SECRET || 'jwt-default-secret' });
app.register(authRoutes, { prefix: '/auth' });
app.register(accountRoutes);
app.register(transactionRoutes);
