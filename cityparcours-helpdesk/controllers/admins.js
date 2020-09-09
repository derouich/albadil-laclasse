const jsonResponse = require('../utils/jsonResponse');
const mongoose = require('mongoose');
const moment = require('moment');
const { Classe, User, Room } = require('../models');
const underscore = require('underscore');

exports.adminsView = async (req, res, next) => {
    return res.render('admins.ejs');
};

exports.getAdmins = async (req, res, next) => {
    var limit = parseInt(req.query.length);
    var skip = parseInt(req.query.start);
    var users;
    if (req.query.search.value !== '') {
        var search = req.query.search.value;
        users = await User.find({
            $or: [
                { email: { '$regex': search, '$options': 'i' } },
                { fullName: { '$regex': search, '$options': 'i' } },
                { phone: { '$regex': search, '$options': 'i' } }
            ],
            isAdmin: true
        });
    } else {
        users = await User.find({
            isAdmin: true
        }).skip(skip).limit(limit).sort({ $natural: -1 });
    }
    const count = await User.find({}).countDocuments();

    return res.json({ recordsFiltered: count, recordsTotal: count, users });
    // return jsonResponse(res, 1, 'Users are here', users);
};

exports.deleteAdmin = async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findById({ _id: id });
    user.isAdmin = false;

    await user.save();
    return res.redirect('/admins');
};
