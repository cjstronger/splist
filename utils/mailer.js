const { createTransport } = require("nodemailer");
const pug = require("pug");
const path = require("path");

const transporter = createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

exports.SendEmail = class SendEmail {
  constructor(mailOptions, view) {
    this.mailOptions = mailOptions;
    this.view = view;
  }
  async sendReset(url) {
    const html = pug.renderFile(
      `${path.join(__dirname, "..", "views")}/email/${this.view}.pug`,
      {
        url,
      }
    );
    this.mailOptions.html = html;
    await transporter.sendMail(this.mailOptions);
  }
};

exports.sendEmail = async (mailOptions) => transporter.sendMail(mailOptions);
