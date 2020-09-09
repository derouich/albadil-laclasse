const { ExtractJwt, Strategy }  = require('passport-jwt');
const { User }                  = require('../models');
const {to, ReE}                      = require('../helpers/utils');
let keys = require('./../config/keys');

module.exports = function(passport) {
    var opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = keys.JWT_ENCRYPTION;

    passport.use(new Strategy(opts, async function(jwt_payload, done) {
        let err, user;
        [err, user] = await to(User.findById(jwt_payload.user_id));
        if (err) return done(err, false);
        // console.log(user);
        if (user) {
            user.set({
                lastLogin: new Date()
            });
            let _user;
            [_err, _user] = await to(user.save());

            return done(null, user);
        } else {
            return done(null, false);
        }
    }));
};
