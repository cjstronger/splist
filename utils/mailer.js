const { createTransport } = require("nodemailer");

const transporter = createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

exports.sendEmail = async (mailOptions) => transporter.sendMail(mailOptions);
