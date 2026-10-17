
import nodemailer from "nodemailer";

const gmailUser = process.env.GMAIL_USER;
const gmailPassword = process.env.GMAIL_APP_PASSWORD;

export async function enviarEmail(
  destinatario: string,
  assunto: string,
  mensagem: string
) {
  if (!gmailUser || !gmailPassword) {
    throw new Error("Credenciais do Gmail não configuradas.");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailPassword,
    },
  });

  return transporter.sendMail({
    from: `"EdTechPalavras" <${gmailUser}>`,
    to: destinatario,
    subject: assunto,
    text: mensagem,
  });
}
