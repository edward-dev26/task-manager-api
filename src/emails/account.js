const sgMail = require('@sendgrid/mail');

const DOMAIN_EMAIL = process.env.DOMAIN_EMAIL;

sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

const sendWelcomeEmail = async(email, name) => {
    await sgMail.send({
        to: email,
        from: DOMAIN_EMAIL,
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how get along with the app.`
    });
};

const sendCancellationEmail = async(email, name) => {
    await sgMail.send({
        to: email,
        from: DOMAIN_EMAIL,
        subject: 'Sorry to see you go!',
        text: `Goodbye, ${name}. I hope to see you back sometime soon.`
    });
};

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail,
};