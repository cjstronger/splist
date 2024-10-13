const { Resend } = require("resend");
const pug = require("pug");
const path = require("path");

const resend = new Resend(process.env.RESEND_KEY);

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
    await resend.emails.send(this.mailOptions);
  }
};

exports.sendEmail = async (mailOptions) => transporter.sendMail(mailOptions);
