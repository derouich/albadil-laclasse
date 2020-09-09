const { Room, Classe, User, Invited, Notification } = require('../models');
const { to, ReE, ReS, saveNotification } = require('../helpers/utils');
const moment = require('moment');

const listUserNotifications = async function (req, res) {
    
    const notifications = await Notification.find({ to: req.user.id }).sort({ $natural: -1 });

    return ReS(res, { notifications });






    res.setHeader('Content-Type', 'application/json');

    let err, user;

    let newNotifications = [];
    let oldNotifications = [];

    [err, user] = await to(User.findById(req.user._id).populate([
        {
            path: 'notifications',
            options: {
                sort: { 'createdAt': -1 }
            }
        }
    ]).exec());
    if (err) return ReE(res, err, 422);

    if (user && user.notifications && user.notifications.length > 0) {

        for (let notif of user.notifications) {
            if (notif.isSeen) {
                oldNotifications.push(notif);
            } else {
                newNotifications.push(notif);
            }
        }
    }

    return ReS(res, {
        OldNotifications: oldNotifications,
        NewNotifications: newNotifications
    });
};
module.exports.listUserNotifications = listUserNotifications;

const notificationsIsSeenUpdate = async function (req, res) {
    let notificationsIDs = req.body.notificationsIDs;

    if (typeof notificationsIDs === 'object') {

        for (let notifId of notificationsIDs) {
            let err, notification;

            [err, notification] = await to(Notification.findById(notifId));
            if (err) return ReE(res, err, 422);

            notification.set({
                isSeen: true
            });

            [err, notification] = await to(notification.save());
            if (err) return ReE(res, err, 422);
        }
    }

    return ReS(res, {
        message: 'All notifications has been seen!'
    });
};
module.exports.notificationsIsSeenUpdate = notificationsIsSeenUpdate;
