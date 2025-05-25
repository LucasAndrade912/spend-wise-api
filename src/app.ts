import fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';

import { authRoutes } from './routes/authRoutes';

export const app = fastify({ logger: true });

app.register(fastifyJwt, { secret: process.env.SECRET || 'jwt-default-secret' });
app.register(authRoutes, { prefix: '/auth' });
