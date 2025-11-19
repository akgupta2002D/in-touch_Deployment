import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Note: This uses Ethereal Email for testing purposes. In a production environment, you would use a real email service. 
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendVerificationEmail = async (to, token, userId) => {
    const verificationUrl = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}&id=${userId}`;

    const mailOptions = {
        from: `"IN TOUCH" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: 'Verify your email',
        text: `Please verify your email by clicking on the following link: ${verificationUrl}`,
        html: `<p>Please verify your email by clicking on the following link:</p><a href="${verificationUrl}">${verificationUrl}</a>`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending verification email: %s', error.message);
    }
}

export const sendPasswordResetEmail = async (to, token, userId) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&id=${userId}`;

    const mailOptions = {
        from: `"IN TOUCH" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: 'Reset your password',
        text: `Please reset your password by clicking on the following link: ${resetUrl}`,
        html: `<p>Please reset your password by clicking on the following link:</p><a href="${resetUrl}">${resetUrl}</a>`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending password reset email: %s', error.message);
    }
}