import transporter from "../config/mailer";

export const sendMailToParticipants = async (
  participants: string | undefined,
  subject: string,
  html: string
) => {
  if (!participants) return;
  const emails = participants.split(",").map(e => e.trim()).filter(Boolean);

  if (emails.length === 0) return;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: emails, // 👈 birden fazla kişiye gider
    subject,
    html,
  });
};
