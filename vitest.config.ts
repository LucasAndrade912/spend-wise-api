import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        coverage: {
            include: ['src/**/*.ts'],
            exclude: ['src/app.ts', 'src/server.ts', 'src/lib'],
        },
    },
});
