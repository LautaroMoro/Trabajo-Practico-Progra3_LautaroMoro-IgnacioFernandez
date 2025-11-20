import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash("1234", 10);

    await prisma.admin.create({
        data: {
            email: "admin@admin.com",
            password: passwordHash
        }
    });

    console.log("Admin creado correctamente.");
}

main()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
