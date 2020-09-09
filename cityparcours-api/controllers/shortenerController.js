const { Room } 	    = require('../models');
const { to, ReE }  = require('../helpers/utils');

let keys = require('./../config/keys');

const redirectToOriginal = async function(req, res) {
    let err, room;

    let urlCode = req.params.urlCode;

    [err, room] = await to(Room.findOne({ urlCode: urlCode }));
     if (err) return ReE(res, err, 422);

    if (room) {
        return res.redirect(room.originalUrl);
    } else {
        return res.redirect(keys.DASHBOARD_URL);
    }
};
module.exports.redirectToOriginal = redirectToOriginal;
