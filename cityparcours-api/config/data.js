const authService = require('./../helpers/auth');
const { to } = require('./../helpers/utils');
const keys = require('./../config/keys');

module.exports.createUsers = async () => {
    let user, err;

    for (let _user of keys.USERS) {
        [err, user] = await to(authService.createUser(_user));
    }

    return true;
};
