const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyUser() {
    try {
        const email = 'mushahidhussain974@gmail.com';
        console.log(`Verifying user: ${email}...`);

        const user = await prisma.user.update({
            where: { username: email },
            data: {
                isEmailVerified: true,
                emailVerificationCode: null
            }
        });

        console.log('✅ User verified successfully!');
        console.log('You can now login with:', email);
    } catch (error) {
        console.error('❌ Error verifying user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyUser();
