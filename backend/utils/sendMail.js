import { transporter } from "../config/sendMail.config.js";
import { Verification_Email_Template, Welcome_Email_Template } from "./EmailTemplate.js";

export const SendVerificationCode = async (email, verificationCode) => {
    try {
        const info = await transporter.sendMail({
            from: '"Keshav Mahansaria 👻" <keshavmahansaria@gmail.com>',
            to: email,
            subject: "Verify your email",
            text: "Verify your Email",
            html: Verification_Email_Template.replace("{verificationCode}", verificationCode),
        });
    } catch (error) {
        console.error('Error in sending verification email ',error.message);
    }
}


export const SendWelcomeEmail = async (email, name) => {
    try {
        const info = await transporter.sendMail({
            from: '"Keshav Mahansaria 👻" <keshavmahansaria@gmail.com>',
            to: email,
            subject: "You're All Set! 🎉",
            text: `Hello ${name},\n\nCongratulations! Your email has been successfully verified. You can now error in and start using EchoHive.\n\nIf you have any questions, feel free to reach out to us.\n\nBest,\nEchoHive`,
            html: Welcome_Email_Template.replace("{name}", name),
        });
    } catch (error) {
        console.error('Error in welcome email: ',error.message);
    }
}