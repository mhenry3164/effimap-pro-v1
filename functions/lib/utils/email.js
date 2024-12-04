"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const Handlebars = require("handlebars");
// Email templates
const emailTemplates = {
    'user-invitation': `
    <h1>Welcome to EffiMap Pro!</h1>
    <p>You've been invited to join {{organizationName}}.</p>
    <p>Click the link below to accept your invitation:</p>
    <a href="{{invitationLink}}">Accept Invitation</a>
  `,
    'subscription-updated': `
    <h1>Subscription Update</h1>
    <p>Your subscription has been updated to {{planName}}.</p>
    <p>New features available:</p>
    <ul>
      {{#each features}}
        <li>{{this}}</li>
      {{/each}}
    </ul>
  `
};
// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: functions.config().email.smtp.host,
    port: functions.config().email.smtp.port,
    secure: true,
    auth: {
        user: functions.config().email.smtp.user,
        pass: functions.config().email.smtp.pass,
    },
});
async function sendEmail(options) {
    try {
        const template = Handlebars.compile(emailTemplates[options.template]);
        const html = template(options.data);
        await transporter.sendMail({
            from: `"${functions.config().app.name}" <${functions.config().email.from}>`,
            to: options.to,
            subject: options.subject,
            html,
        });
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send email');
    }
}
//# sourceMappingURL=email.js.map