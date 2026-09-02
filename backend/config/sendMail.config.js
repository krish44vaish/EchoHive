import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()


// transporter holds the configuration for how and where to deliver mails...
export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // address of gmail smtp server
    port: 587, // this is used for TLS
    secure: false, // true for port 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // your app password
    },
});