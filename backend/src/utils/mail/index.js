import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Mailgen from "mailgen";
import { APIError } from "../api/apiError.js";

dotenv.config({ path: "./.env" });

export async function sendMail({ email, subject, mailGenContent }) {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Mega Project",
      link: "https://mailgen.js/",
    },
  });
  const mail = mailGenerator.generate(mailGenContent);
  const mailText = mailGenerator.generatePlaintext(mailGenContent);
  const mailOptions = {
    from: process.env.MAILTRAP_FROM,
    to: email,
    subject: subject,
    html: mail,
    text: mailText,
  };
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    secure: false,
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new APIError(402, "Error in sending mail", error);
  }
}
