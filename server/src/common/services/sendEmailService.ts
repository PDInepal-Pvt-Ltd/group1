import nodemailer from "nodemailer";

export class SendEmailService {
    private transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    async sendResetPasswordEmail(email: string, token: string) {
        const url = `http://localhost:5173/reset-password?token=${token}`;
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Password Reset",
            html: `<p>Click <a href="${url}">here</a> to reset your password.</p>`,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log("Email sent successfully");
        } catch (error) {
            console.error("Error sending email:", error);
        }
    }
}

export const sendEmailService = new SendEmailService();
