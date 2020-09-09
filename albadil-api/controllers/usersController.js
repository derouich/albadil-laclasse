const authService = require('../helpers/auth');
const { to, ReE, ReS, saveNotification } = require('../helpers/utils');
const { Classe, User, Room, Invited, Notification } = require('../models');
const { sendEmail } = require('../services/mail.service');
const cryptoRandomString = require('crypto-random-string');
const { minioClient, bucketsNames, generateFileName } = require('./../config/minio');

const login = async function (req, res) {
    const body = req.body;
    let err, user;

    [err, user] = await to(authService.authUser(body));
    if (err) return ReE(res, err, 422);

    return ReS(res, {
        token: user.getJWT(),
        user: {
            _id: user.toWeb()._id,
            fullName: user.toWeb().fullName,
            phone: user.toWeb().phone,
            email: user.toWeb().email,
            cityName: user.toWeb().cityName,
            etablissement: user.toWeb().etablissement,
            profileImage: user.toWeb().profileImage,
            isModerator: user.toWeb().isModerator,
            lastLogin: user.toWeb().lastLogin
        }
    });
};
module.exports.login = login;

const register = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    let body = req.body;

    if (!body.email) {
        return ReE(res, 'Please enter an email to register.');
    } else if (!body.password) {
        return ReE(res, 'Please enter a password to register.');
    } else {
        let err, user, invitedUser;

        // Check if user is invited
        [err, invitedUser] = await to(Invited.find({
            email: body.email
        }));
        if (err) return ReE(res, err, 422);

        if (invitedUser.length > 0) {
            let classes = [];
            let rooms = [];

            for (let _user of invitedUser) {

                if (_user.classe) {
                    classes.push(_user.classe);
                }

                if (_user.room) {
                    rooms.push(_user.room);
                }

                // Remove the user from invited model
                let deletedUser;
                [err, deletedUser] = await to(Invited.findByIdAndDelete(_user._id));
            }

            body.classes = classes;
            body.rooms = rooms;
        }

        body.validationToken = cryptoRandomString({ length: 16 });

        /*if (body.isModerator === 'true' || body.isModerator === true) {
            body.status = false;
        }*/

        [err, user] = await to(authService.createUser(body));
        if (err) return ReE(res, err, 422);

        /*if (body.isModerator === 'true' || body.isModerator === true) {
            // Send activation email
            let activateAccountData = {
                fullName: user.toWeb().fullName,
                email: user.toWeb().email,
                token: user.toWeb().validationToken,
            };
            sendEmail('activateAccount', activateAccountData);
        }*/

        return ReS(res, {
            user: {
                _id: user.toWeb()._id,
                fullName: user.toWeb().fullName,
                phone: user.toWeb().phone,
                email: user.toWeb().email,
                cityName: user.toWeb().cityName,
                etablissement: user.toWeb().etablissement,
                profileImage: user.toWeb().profileImage,
                isModerator: user.toWeb().isModerator,
                lastLogin: user.toWeb().lastLogin
            },
            token: user.getJWT()
        }, 201);
    }
};
module.exports.register = register;

const inviteUsers = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    const bodyData = req.body;
    let _invitedUsers = [];

    if (bodyData.invitedUsers) {
        for (const userString of bodyData.invitedUsers) {
            let userObj = userString.split(";");
            let userData = {
                fullName: userObj[0],
                email: userObj[1]
            };
            // let userData = {
            //     fullName: userString.fullName,
            //     email: userString.email
            // };

            // Check if user exists
            let _user, err;
            [err, _user] = await to(User.findOne({ email: userData.email }));
            if (err) return ReE(res, err, 422);

            if (_user) {
                // Update existed user
                let dataToUpdate;

                if (bodyData.isClasse === 'true' || bodyData.isClasse === true) {
                    // Get classe
                    let _classe;
                    [err, _classe] = await to(Classe.findById(bodyData.thisThingID).populate([{
                        path: 'creator'
                    }]).exec());

                    // Create Notification
                    // let _notification;
                    // [err, _notification] = await to(Notification.create({
                    //     title: _classe.classeName,
                    //     type: 'classe',
                    //     createdBy: _classe.creator.fullName,
                    //     creatorId: _classe.creator._id,
                    //     thisTypeId: _classe._id
                    // }));
                    // if (err) return ReE(res, err, 422);

                    const msg = `${_user.fullName} you are invited for class `;
                    const type = 'user_class_invite';
                    const fromUser = req.user.id;
                    const toUser = _user.id;
                    const noti = await saveNotification(msg, type, fromUser, toUser);
                    var io = req.app.get('socketio');
                    io.to(req.user.socket_id).emit('notity', noti);

                    dataToUpdate = {
                        classes: bodyData.thisThingID,
                        notifications: noti._id
                    };
                    // dataToUpdate = {
                    //     classes: bodyData.thisThingID,
                    //     notifications: _notification._id
                    // };

                    if (_classe.rooms.length > 0) {
                        dataToUpdate.rooms = { $each: _classe.rooms };
                    }
                } else {
                    // Get room
                    let _room;
                    [err, _room] = await to(Room.findById(bodyData.thisThingID).populate([{
                        path: 'creator'
                    }]).exec());

                    // Create Notification
                    // let _notification;
                    // [err, _notification] = await to(Notification.create({
                    //     title: _room.roomName,
                    //     type: 'room',
                    //     createdBy: _room.creator.fullName,
                    //     creatorId: _room.creator._id,
                    //     thisTypeId: _room._id
                    // }));
                    // if (err) return ReE(res, err, 422);
                    const msg = `${_user.fullName} you are invited for room ${_room.roomName}`;
                    const type = 'user_room_invite';
                    const fromUser = req.user.id;
                    const toUser = _user.id;
                    const noti = await saveNotification(msg, type, fromUser, toUser);
                    var io = req.app.get('socketio');
                    io.to(req.user.socket_id).emit('notity', noti);

                    dataToUpdate = {
                        rooms: bodyData.thisThingID,
                        notifications: noti._id
                    };
                    // dataToUpdate = {
                    //     rooms: bodyData.thisThingID,
                    //     notifications: _notification._id
                    // };
                }

                [err, _user] = await to(User.findByIdAndUpdate(
                    _user._id,
                    {
                        $addToSet: dataToUpdate
                    },
                    { new: true, useFindAndModify: false }
                ));
                if (err) return ReE(res, err, 422);
            } else {
                // Create new user
                let newUserData = {
                    fullName: userObj[0],
                    email: userObj[1],
                };

                _invitedUsers.push(newUserData);

                let userDataToFind = {
                    email: newUserData.email
                };

                if (bodyData.isClasse === 'true' || bodyData.isClasse === true) {
                    newUserData.classe = bodyData.thisThingID;

                    userDataToFind.classe = newUserData.classe;
                } else {
                    newUserData.room = bodyData.thisThingID;

                    userDataToFind.room = newUserData.room;
                }

                // Check if invited user exists
                let _thisUserToFind;
                [err, _thisUserToFind] = await to(Invited.findOne(userDataToFind));
                if (err) return ReE(res, err, 422);

                if (!_thisUserToFind) {
                    [err, _user] = await to(Invited.create(newUserData));
                    if (err) return ReE(res, err, 422);
                }
            }
        }
    }

    // Send emails to invited users
    if (_invitedUsers.length > 0) {
        sendEmail('invitationMail', _invitedUsers);
        //sendInvitationEmail(_invitedUsers);
    }
    return ReS(res, { Invited: true }, 201);
};
module.exports.inviteUsers = inviteUsers;

const listOne = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    let err, user;

    [err, user] = await to(User.findById(req.user._id).populate([{
        path: 'rooms',
        match: {
            isActive: true
        },
        populate: [{
            path: 'users',
            model: 'User'
        }, {
            path: 'invited',
            model: 'Invited'
        }]
    }, {
        path: 'classes',
        populate: [{
            path: 'users',
            model: 'User'
        }, {
            path: 'invited',
            model: 'Invited'
        }]
    }]).exec());
    if (err) return ReE(res, err, 422);

    let userData = {
        profileImage: user.profileImage,
        fullName: user.fullName,
        email: user.email,
        etablissement: user.etablissement,
        cityName: user.cityName,
        phone: user.phone,
        classes: [],
        rooms: [],
    };

    if (user.classes.length > 0) {
        for (let _classe of user.classes) {
            let data = {
                users: [],
                invited: []
            };
            for (let _thisUser of _classe.users) {
                data.users.push({
                    email: _thisUser.email
                });
            }
            for (let _thisUser of _classe.invited) {
                data.invited.push({
                    email: _thisUser.email
                });
            }
            userData.classes.push(data);
        }
    }

    if (user.rooms.length > 0) {
        for (let _room of user.rooms) {
            let data = {
                roomName: _room.roomName,
                startDateTime: _room.startDateTime,
                meetingID: _room.meetingID,
                attendeePW: _room.attendeePW,
                moderatorPW: _room.moderatorPW,
                users: [],
                invited: []
            };

            for (let _thisUser of _room.users) {
                data.users.push({
                    email: _thisUser.email
                });
            }
            for (let _thisUser of _room.invited) {
                data.invited.push({
                    email: _thisUser.email
                });
            }

            userData.rooms.push(data);
        }
    }
    return ReS(res, { User: userData });
};
module.exports.listOne = listOne;


const updateUser = async function (req, res) {
    let err, user, data, minioResponse;

    data = req.body;

    if (data.isUpdateImage) {
        if (data.profileImage !== '' || data.profileImage !== undefined || data.profileImage !== null) {
            const BUCKET_ENDPOINT = 'https://bucket.mwsapp.com';

            let imageType = data.profileImage.substring(data.profileImage.indexOf('/') + 1, data.profileImage.indexOf(';base64'));
            let imageName = `${generateFileName()}.${imageType}`;

            let base64Image = data.profileImage.split(';base64,').pop();
            const imageBuffer = Buffer.from(base64Image, 'base64');

            [err, minioResponse] = await to(minioClient().putObject(bucketsNames().usersProfilePictures, imageName, imageBuffer));
            if (err) return ReE(res, err, 422);

            data.profileImage = `${BUCKET_ENDPOINT}/${bucketsNames().usersProfilePictures}/${imageName}`;
        }
    }

    [err, user] = await to(User.findById(req.user._id));
    if (err) return ReE(res, err, 422);

    user.set(data);

    [err, user] = await to(user.save());
    if (err) return ReE(res, err, 422);

    return ReS(res, {
        user: {
            _id: user._id,
            fullName: user.fullName,
            phone: user.phone,
            email: user.email,
            cityName: user.cityName,
            etablissement: user.toWeb().etablissement,
            profileImage: user.profileImage,
            isModerator: user.isModerator,
            lastLogin: user.toWeb().lastLogin
        }
    });
};
module.exports.updateUser = updateUser;

const activateUserAccount = async function (req, res) {
    let err, user, _user;

    let email = req.query.email;
    let activationToken = req.query.token;

    [err, user] = await to(User.findOne({ email: email }));
    if (err) return ReE(res, err, 422);

    if (user) {
        if (user.status) {
            return ReS(res, { message: 'Email already verified!' }, 200);
        } else {

            if (user.validationToken === activationToken) {
                [err, _user] = await to(User.findByIdAndUpdate(
                    user._id,
                    {
                        status: true
                    },
                    { new: true, useFindAndModify: false }
                ));
                if (err) return ReE(res, err, 422);

                return ReS(res, { message: 'Email verified successfully!' }, 200);
            } else {
                return ReE(res, 'Verification failed!', 403);
            }
        }
    } else {
        return ReE(res, 'Email no found!', 404);
    }
};
module.exports.activateUserAccount = activateUserAccount;

const forgotPassword = async function (req, res) {
    let err, user, _user;

    let email = req.body.email;

    [err, user] = await to(User.findOne({ email: email }));
    if (err) return ReE(res, err, 422);

    if (user) {
        // Generate forgot password token
        const userForgotPasswordToken = cryptoRandomString({ length: 16 });
        [err, _user] = await to(User.findByIdAndUpdate(
            user._id,
            {
                forgotPasswordToken: userForgotPasswordToken
            },
            { new: true, useFindAndModify: false }
        ));
        if (err) return ReE(res, err, 422);

        // Send email to user
        let emailData = {
            fullName: user.toWeb().fullName,
            email: user.toWeb().email,
            token: userForgotPasswordToken
        };
        sendEmail('forgotPassword', emailData);

        return ReS(res, { message: 'Reset password email has been sent!' }, 200);
    } else {
        return ReE(res, 'Email no found!', 404);
    }
};
module.exports.forgotPassword = forgotPassword;

const resetPassword = async function (req, res) {
    let err, user, _user;

    let email = req.body.email;
    let password = req.body.password;
    let token = req.body.token;

    [err, user] = await to(User.findOne({ email: email }));
    if (err) return ReE(res, err, 422);

    if (user) {
        // check if the token is valid
        if (token === user.forgotPasswordToken) {
            user.set({
                password: password,
                forgotPasswordToken: ''
            });

            [err, _user] = await to(user.save());
            if (err) return ReE(res, err, 422);

            return ReS(res, { message: 'Password reset successfully!' }, 200);
        } else {
            return ReE(res, 'Password reset link is expired or already used!', 404);
        }
    } else {
        return ReE(res, 'User no found!', 404);
    }
};
module.exports.resetPassword = resetPassword;

// this one is to delete user from classe
const deleteUser = async function (req, res) {
    let err, users;


    // Get user
    let thisUser;
    [err, thisUser] = await to(User.findById(req.params.user_id));
    if (err) return ReE(res, err, 422);

    // Get classe
    let classe;
    [err, classe] = await to(Classe.findById(req.params.classe_id).populate([{ path: 'rooms' }]).exec());
    if (err) return ReE(res, err, 422);

    if (!thisUser) {
        // remove invited users with this classe
        let invitedToDelete;
        [err, invitedToDelete] = await to(Invited.deleteMany({
            _id: req.params.user_id,
            classe: req.params.classe_id
        }));
        if (err) return ReE(res, err, 422);

        if (classe && classe.rooms && classe.rooms.length > 0) {
            for (let room of classe.rooms) {
                let _invitedToDelete;
                [err, _invitedToDelete] = await to(Invited.deleteMany({
                    _id: req.params.user_id,
                    room: room._id
                }));
            }
        }

    } else {
        // Get classe' rooms
        if (classe && classe.rooms && classe.rooms.length > 0) {
            for (let room of classe.rooms) {

                // Delete room from user
                let userToUpdate;
                [err, userToUpdate] = await to(User.findByIdAndUpdate(
                    req.params.user_id,
                    {
                        $pull: {
                            rooms: room._id
                        }
                    },
                    { new: true, useFindAndModify: false }
                ));
                if (err) return ReE(res, err, 422);
            }
        }

        // Delete classe from user
        let _userToUpdate;
        [err, _userToUpdate] = await to(User.findByIdAndUpdate(
            req.params.user_id,
            {
                $pull: {
                    classes: classe._id
                }
            },
            { new: true, useFindAndModify: false }
        ));
        if (err) return ReE(res, err, 422);
    }

    return ReS(res, { message: 'User deleted from classe!' });
};
module.exports.deleteUser = deleteUser;

const manageDeleteInvitedUser = async function (req, res) {
    let err;

    let userStringObj = req.params.user_email.split(";");

    // If invited to room
    let invitedToDelete;
    [err, invitedToDelete] = await to(Invited.deleteMany({
        email: userStringObj[1],
        room: req.params.thing_id
    }));
    if (err) return ReE(res, err, 422);

    // If invited to classe
    let _invitedToDelete;
    [err, _invitedToDelete] = await to(Invited.deleteMany({
        email: userStringObj[1],
        classe: req.params.thing_id
    }));
    if (err) return ReE(res, err, 422);

    return ReS(res, { message: 'Invited user deleted!' });
};
module.exports.manageDeleteInvitedUser = manageDeleteInvitedUser;


const deleteUserAccount = async (req, res) => {
    const user = await User.findByIdAndDelete({_id: req.user.id});
    return ReS(res, { message: 'User account deleted' });
};

module.exports.deleteUserAccount = deleteUserAccount;




