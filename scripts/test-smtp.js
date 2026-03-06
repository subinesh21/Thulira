const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
    console.log('Testing with user:', process.env.EMAIL_USER);
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtpout.secureserver.net',
        port: parseInt(process.env.EMAIL_PORT || '465'),
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // send to self
            subject: 'Test Email - Thulira',
            text: 'This is a test email to verify SMTP configuration.'
        });
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

testEmail();
