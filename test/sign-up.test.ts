import { describe, test, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import supertest from 'supertest';

import { app } from '../src/app';
import TestAgent from 'supertest/lib/agent';

let timestamp: number;
let request: TestAgent;

describe('ROUTE /auth/sign-up', () => {
    beforeAll(async () => {
        await app.ready();
        request = supertest(app.server);
    });

    beforeEach(() => {
        timestamp = Date.now();
    });

    afterAll(async () => {
        await app.close();
    });

    test('POST /auth/sign-up - será possível um usuário se cadastrar', async () => {
        const response = await request.post('/auth/sign-up').send({
            name: 'testuser',
            email: `testuser-${timestamp}@email.com`,
            password: 'testpassword',
            confirmPassword: 'testpassword',
        });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'Usuário criado com sucesso');
        expect(response.body).toHaveProperty('data.token');
        expect(response.body.data.token).toBeDefined();
    });

    test('POST /auth/sign-up - não será possível um usuário se cadastrar sem preencher os dados corretamente', async () => {
        const response = await request.post('/auth/sign-up').send({
            name: 'testuser',
            email: `testuser-${timestamp}`,
            password: 'testpassword',
            confirmPassword: 'testpassword',
        });

        expect(response.status).toBe(500);
    });

    test('POST /auth/sign-up - não será possível um usuário se cadastrar com o mesmo email', async () => {
        await request.post('/auth/sign-up').send({
            name: 'testuser',
            email: `testuser-${timestamp}@email.com`,
            password: 'testpassword',
            confirmPassword: 'testpassword',
        });

        const response = await request.post('/auth/sign-up').send({
            name: 'testuser',
            email: `testuser-${timestamp}@email.com`,
            password: 'testpassword',
            confirmPassword: 'testpassword',
        });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Email já cadastrado');
        expect(response.body).toHaveProperty('data', null);
        expect(response.body.data).toBeNull();
    });

    test('POST /auth/sign-up - não será possível um usuário se cadastrar com senhas diferentes', async () => {
        const response = await request.post('/auth/sign-up').send({
            name: 'testuser',
            email: `testuser-${timestamp}@email.com`,
            password: 'testpassword',
            confirmPassword: 'wrongtestpassword',
        });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Senhas não coincidem');
        expect(response.body).toHaveProperty('data', null);
        expect(response.body.data).toBeNull();
    });
});
