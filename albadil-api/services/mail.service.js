require('dotenv').config();
let keys = require('./../config/keys');

const nodemailer = require('nodemailer'),
    transporter = nodemailer.createTransport({
        host: "mail.laclasse.ma",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: keys.SMTP_USER,
            pass: keys.SMTP_PASS
        },
    }),
    EmailTemplate = require('email-templates').EmailTemplate,
    path = require('path'),
    Promise = require('bluebird');


function sendEmail (obj) {
    return transporter.sendMail(obj);
}

function loadTemplate (templateName, contexts) {
    let template = new EmailTemplate(path.join(__dirname, '..', 'templates', templateName));
    return Promise.all(contexts.map((context) => {
        return new Promise((resolve, reject) => {
            template.render(context, (err, result) => {
                if (err) reject(err);
                else resolve({
                    email: result,
                    context,
                });
            });
        });
    }));
}

/*
Emails templates
 */
const ACTIVATE_ACCOUNT = 'activateAccount';
const FORGOT_PASSWORD = 'forgotPassword';
const INVITATION_MAIL = 'invitationMail';
const WELCOME_STUDENT = 'welcomeStudent';
const WELCOME_TEACHER = 'welcomeTeacher';

module.exports.sendEmail = (type, data) => {
    let users = [];

    switch (type) {
        case ACTIVATE_ACCOUNT:
            users.push({
                userFullName: data.fullName,
                userEmail: data.email,
                userToken: data.token,
                userActivationUrl: keys.DASHBOARD_URL + '/auth/login?token=' + data.token + '&email=' + data.email
            });
            break;

        case FORGOT_PASSWORD:
            users.push({
                userFullName: data.fullName,
                userEmail: data.email,
                userForgotPasswordToken: data.token,
                userResetUrl: keys.DASHBOARD_URL + '/auth/forgetPassword?token=' + data.token + '&email=' + data.email
            });
            break;

        case INVITATION_MAIL:
            for (let _data of data) {
                users.push({
                    userFullName: _data.fullName,
                    userEmail: _data.email,
                    userRegisterLink: encodeURI(keys.DASHBOARD_URL + '/auth/register?email=' + _data.email + '&fullName=' + _data.fullName)
                });
            }
            break;

        case WELCOME_STUDENT:
            console.log('Oranges');
            break;

        case WELCOME_TEACHER:
            console.log('Oranges');
            break;
    }

    loadTemplate(type, users).then((results) => {
        return Promise.all(results.map((result) => {
            sendEmail({
                to: result.context.userEmail,
                from: keys.SMTP_USER,
                subject: result.email.subject,
                html: result.email.html,
            });
        }));
    }).then(() => {
        console.log('Yay!');
    });

};

module.exports.sendSimpleWebinarEmail = async (receiverEmail, fullName, webinarDate) => {
    let _transporter = nodemailer.createTransport({
        host: "mail.laclasse.ma",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'webinar@laclasse.ma',
            pass: '4dLZbO31'
        },
    })
    return await _transporter.sendMail({
        from: 'webinar@laclasse.ma', // sender address
        to: receiverEmail + ', webinar@laclasse.ma', // list of receivers
        subject: 'LaClasse Webinar: ' + webinarDate, // Subject line
        html:
            "<p>Bonjour " + fullName + ",</p>" +
            "<br>" +
            "<p>Votre inscription à la formation ‘Comment utiliser laclasse.ma’ a bien été enregistrée." +
            "<br>" +
            "Vous recevrez bientôt un mail de notre part avec les différentes informations relatives à celle-ci." +
            "<br>" +
            "Nous vous remercions pour l’intérêt que vous portez à notre plateforme." +
            "<br>" +
            "N’hésitez pas à nous contacter pour toute question. Nous restons à votre disposition.</p>" +
            "<br>" +
            "<p>L’équipe Laclasse."
    });
};
