const nodemailer = require("nodemailer");
async function sendEmail(email, subject, html) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "mostafaisa208@gmail.com",
      pass: "bqzl uyxy lvdu bfbk",
    },
  });

  let info = await transporter.sendMail({
    from: "appgyms.com",
    to: email,
    subject: subject,
    html,
  });
}

module.exports = sendEmail;
