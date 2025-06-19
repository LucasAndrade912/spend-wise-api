import { prismaClient } from '../lib/prisma';

async function main() {
    await prismaClient.transactionCategory.createMany({
        data: [{ name: 'Entrada' }, { name: 'Saída' }],
    });
}

main()
    .then(() => {
        console.log('Transaction categories seeded successfully.');
    })
    .catch((error) => {
        console.error('Error seeding transaction categories:', error);
    })
    .finally(async () => {
        await prismaClient.$disconnect();
    });
