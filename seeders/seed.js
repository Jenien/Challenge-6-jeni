import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seed() {
    const hashedPassword = await bcrypt.hash('oke123', 6);

    await prisma.user.create({
        data: {
            name: 'SuperAdmin',
            email: 'superadmin@gmail.com',
            password: hashedPassword,
            role: Role.SUPER_ADMIN
        }
    });

    console.log('Super admin added successfully.');
}

seed()
    .catch(err => {
        console.error('Error seeding database', err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
