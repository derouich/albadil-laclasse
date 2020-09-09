const { User } 	    = require('../models');
const validator     = require('validator');
const { to, TE, ReE }    = require('./utils');

const createUser = async function(userInfo) {
    let user, thisUser, err;

    if (!userInfo.email) TE('An email was not entered.');

    if (validator.isEmail(userInfo.email)) {

        [err, thisUser] = await to(User.findOne({email: userInfo.email}));
        if (err) TE(err.message);

        if (thisUser) {
            TE('Email already exists.');
        } else {
            [err, user] = await to(User.create(userInfo));
            if (err) {
                TE(err.message);
            }
        }

        return user;

    } else {
        TE('A valid email was not entered.');
    }
};
module.exports.createUser = createUser;

const authUser = async function(userInfo) { //returns token
    if (!userInfo.email) TE('Please enter an email to login!');

    if (!userInfo.password) TE('Please enter a password to login!');

    let user, err;
    if (validator.isEmail(userInfo.email)) {

        [err, user] = await to(User.findOne({email: userInfo.email}));
        if (err) TE(err.message);

    } else {
        TE('A valid email was not entered');
    }

    if (!user) TE('Not registered');

    [err, user] = await to(user.comparePassword(userInfo.password));
    if (err) TE(err.message);

    if (!user.status) {
        TE('403 - User is not activated!');
    }

    return user;
};
module.exports.authUser = authUser;
