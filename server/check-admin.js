const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAdmin() {
    const admin = await prisma.user.findUnique({
        where: { username: 'tlcexamination@ex.com' }
    });
    
    if (admin) {
        console.log('Admin found:', {
            username: admin.username,
            role: admin.role,
            hasPassword: !!admin.password
        });
        
        // Test password
        const isValid = await bcrypt.compare('tlc123451', admin.password);
        console.log('Password "tlc123451" is valid:', isValid);
    } else {
        console.log('Admin user NOT found!');
    }
    
    await prisma.$disconnect();
}

checkAdmin();
