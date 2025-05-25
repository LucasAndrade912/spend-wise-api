import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';

import { app } from '../src/app';
import TestAgent from 'supertest/lib/agent';

let request: TestAgent;

describe('ROUTE /auth/sign-in', () => {
    beforeAll(async () => {
        await app.ready();
        request = supertest(app.server);
    });

    afterAll(async () => {
        await app.close();
    });

    test('POST /auth/sign-in - será possível um usuário fazer login', async () => {
        const timestamp = Date.now();

        await request.post('/auth/sign-up').send({
            name: 'testuser',
            email: `testuser-${timestamp}@email.com`,
            password: 'testpassword',
            confirmPassword: 'testpassword',
        });

        const response = await request.post('/auth/sign-in').send({
            email: `testuser-${timestamp}@email.com`,
            password: 'testpassword',
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Login realizado com sucesso');
        expect(response.body).toHaveProperty('data.token');
        expect(response.body.data.token).toBeDefined();
    });

    test('POST /auth/sign-in - não será possível um usuário fazer login com email inválido', async () => {
        const response = await request.post('/auth/sign-in').send({
            email: 'invalid-email',
            password: 'testpassword',
        });

        expect(response.status).toBe(500);
    });

    test('POST /auth/sign-in - não será possível um usuário fazer login com senha inválida', async () => {
        const timestamp = Date.now();

        await request.post('/auth/sign-up').send({
            name: 'testuser',
            email: `testuser-${timestamp}@email.com`,
            password: 'testpassword',
            confirmPassword: 'testpassword',
        });

        const response = await request.post('/auth/sign-in').send({
            email: `testuser-${timestamp}@email.com`,
            password: 'wrongtestpassword',
        });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Email ou senha inválidos');
        expect(response.body).not.toHaveProperty('data');
    });

    test('POST /auth/sign-in - não será possível um usuário fazer login com email não cadastrado', async () => {
        const response = await request.post('/auth/sign-in').send({
            email: `not-exists@email.com`,
            password: 'wrongtestpassword',
        });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Email ou senha inválidos');
        expect(response.body).not.toHaveProperty('data');
    });
});
