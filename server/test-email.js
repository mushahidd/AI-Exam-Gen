const nodemailer = require('nodemailer');

console.log('Nodemailer object keys:', Object.keys(nodemailer));
console.log('Type of createTransporter:', typeof nodemailer.createTransporter);

async function test() {
    try {
        let testAccount = await nodemailer.createTestAccount();
        console.log('Test Account created:', testAccount.user);

        const transporter = nodemailer.createTransporter({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        console.log('Transporter created successfully');
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
