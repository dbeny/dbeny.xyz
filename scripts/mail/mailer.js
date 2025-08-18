import nodemailer from "nodemailer";

let EMAIL_USER;
let EMAIL_PASS;
let transporter;

export function initMailer() {
    EMAIL_USER = process.env.EMAIL_USER;
    EMAIL_PASS = process.env.EMAIL_PASS;

    transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });
}

export async function sendEmail(recipients, subject, htmlContent) {
    const mailOptions = {
        from: `"Pitélytárház" <${EMAIL_USER}>`,
        to: recipients.join(", "),
        subject,
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error("Error sending email:", err);
    }
}
