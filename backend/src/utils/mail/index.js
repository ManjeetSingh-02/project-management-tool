import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Mailgen from "mailgen";
import { APIError } from "../api/apiError.js";

// file path for .env file
dotenv.config({ path: "./.env" });

// function to send different types of emails
export async function sendMail({ email, subject, mailGenContent }) {
  // create a template for email
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Project Management Tool",
      link: process.env.ORIGIN_URL,
    },
  });

  // generate html and plaintext content
  const mail = mailGenerator.generate(mailGenContent);
  const mailText = mailGenerator.generatePlaintext(mailGenContent);

  // object to store email options
  const mailOptions = {
    from: process.env.MAIL_SERVICE_FROM,
    to: email,
    subject: subject,
    html: mail,
    text: mailText,
  };

  // create a transporter for sending emails
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_SERVICE_HOST,
    port: Number(process.env.MAIL_SERVICE_PORT),
    secure: process.env.NODE_ENV === "production",
    auth: {
      user: process.env.MAIL_SERVICE_USERNAME,
      pass: process.env.MAIL_SERVICE_PASSWORD,
    },
  });

  // try to send email, if error occurs, throw an APIError
  await transporter.sendMail(mailOptions).catch(error => {
    throw new APIError(400, "Error in sending mail", error);
  });
}
