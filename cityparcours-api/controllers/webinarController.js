const { Webinar } 	    = require('../models');
const { to, ReE, ReS }  = require('../helpers/utils');
const { sendSimpleWebinarEmail } = require('../services/mail.service');

const registerParticipants = async function(req, res) {
    let data = req.body;
    let webinar, err;

    let webinarData = {
        fullName: data.name,
        email: data.email,
        phone: data.phone,
        webinarDate: data.webinarDate
    };

    [err, webinar] = await to(Webinar.create(webinarData));
    if (err) return ReE(res, err, 422);

    ReS(res, {success: true});

    sendSimpleWebinarEmail(webinarData.email, webinarData.fullName, webinarData.webinarDate).then().catch();
};
module.exports.registerParticipants = registerParticipants;
