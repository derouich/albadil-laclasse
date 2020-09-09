const { Classe, User, Room, Invited, Notification } = require('../models');
const { to, ReE, ReS, saveNotification } = require('../helpers/utils');
const moment = require('moment');
const { sendEmail } = require('../services/mail.service');


const listAll = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    let err, classes, user;

    [err, user] = await to(User.findById(req.user._id).populate([{
        path: 'classes'
    }]).exec());
    if (err) return ReE(res, err, 422);

    let classesToSend = [];

    if (user.classes.length > 0) {
        for (let _classe of user.classes) {
            classesToSend.push({
                classeName: _classe.classeName,
                _id: _classe._id,
                id: _classe._id,
                creator: _classe.creator,
                schoolName: _classe.schoolName,
                city: _classe.city
            });
        }
    }
    return ReS(res, { Classes: classesToSend });
};
module.exports.listAll = listAll;


const listOne = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    let err, classe;

    if (req.params.classe_id) {

        [err, classe] = await to(Classe.findById(req.params.classe_id).populate([{
            path: 'rooms',
            match: {
                isActive: true
            },
            populate: [{
                path: 'classe',
                model: 'Classe'
            }, {
                path: 'creator',
                model: 'User'
            }, {
                path: 'users',
                model: 'User'
            }, {
                path: 'invited',
                model: 'Invited'
            }]
        }, { path: 'invited' }]).exec());

        if (err) return ReE(res, err, 422);
        if (!classe) return ReE(res, 'Classe not found');

        let classeDataToSend = {
            _id: classe._id,
            classeName: classe.classeName,
            schoolName: classe.schoolName,
            city: classe.city,
            creator: classe.creator,
            rooms: [],
            invited: []
        };

        if (classe.invited.length > 0) {
            for (let _invited of classe.invited) {
                classeDataToSend.invited.push({
                    fullName: _invited.fullName,
                    email: _invited.email
                });
            }
        }

        if (classe.rooms.length > 0) {
            for (let _room of classe.rooms) {
                let _data = {
                    roomName: _room.roomName,
                    _id: _room._id,
                    isActive: _room.isActive,
                    isInstant: _room.isInstant,
                    meetingID: _room.meetingID,
                    attendeePW: _room.attendeePW,
                    moderatorPW: _room.moderatorPW,
                    startDateTime: _room.startDateTime,
                    endDateTime: _room.endDateTime,
                    description: _room.description,
                    urlCode: _room.urlCode,
                    creator: {
                        _id: _room.creator._id,
                        fullName: _room.creator.fullName,
                    },
                    classe: [],
                    participants: _room.users.length + _room.invited.length
                };

                if (_room.classe.length > 0) {
                    for (let _classe of _room.classe) {
                        _data.classe.push({
                            _id: _classe._id,
                            classeName: _classe.classeName
                        });
                    }
                }
                classeDataToSend.rooms.push(_data);
            }
        }

        return ReS(res, { Classe: classeDataToSend });

    } else {
        return ReE(res, 'Specify classe ID.');
    }
};
module.exports.listOne = listOne;

const create = async function (req, res) {

    res.setHeader('Content-Type', 'application/json');
    let err, classe;
    let bodyParams = req.body;

    /*
    Create Classe
     */
    let classe_info = {
        classeName: bodyParams.classeName,
        schoolName: bodyParams.schoolName || req.user.etablissement,
        city: bodyParams.city || req.user.cityName,
        creator: req.user._id
    };
    [err, classe] = await to(Classe.create(classe_info));
    if (err) return ReE(res, err, 422);

    const msg = `${classe_info.classeName} class of school ${classe_info.schoolName} has been created by ${req.user.fullName}`;
    const type = 'create_classe';
    const fromUser = req.user.id;
    const toUser = req.user.id;
    const noti = await saveNotification(msg, type, fromUser, toUser);
    var io = req.app.get('socketio');
    io.to(req.user.socket_id).emit('notity', noti);


    /*
    Add classe to current user
     */
    let thisUser;
    let user = req.user;
    [err, thisUser] = await to(User.findByIdAndUpdate(
        user._id,
        {
            $addToSet: {
                classes: classe._id
            }
        },
        { new: true, useFindAndModify: false }
    ));
    if (err) return ReE(res, err, 422);

    /*
    Create invited users with this classe
     */
    let _invitedUsers = [];
    if (bodyParams.invitedUsers) {
        for (const userString of bodyParams.invitedUsers) {
            let _user;
            let userObj = userString.split(";");
            let userData = {
                fullName: userObj[0],
                email: userObj[1],
                classe: classe._id
            };

            // Check if user exists
            [err, _user] = await to(User.findOne({ email: userData.email }));
            if (err) return ReE(res, err, 422);

            if (!_user) {
                _invitedUsers.push(userData);

                // Create new user
                [err, _user] = await to(Invited.create(userData));
                if (err) return ReE(res, err, 422);
            } else {
                // Create Notification
                let _notification;
                [err, _notification] = await to(Notification.create({
                    title: classe.classeName,
                    type: 'classe',
                    createdBy: req.user.fullName,
                    creatorId: req.user._id,
                    thisTypeId: classe._id
                }));
                if (err) return ReE(res, err, 422);

                // Add classe to existed user
                [err, _user] = await to(User.findByIdAndUpdate(
                    _user._id,
                    {
                        $addToSet: {
                            classes: classe._id,
                            notifications: _notification._id
                        }
                    },
                    { new: true, useFindAndModify: false }
                ));
                if (err) return ReE(res, err, 422);
            }
        }
    }

    // Send emails to invited users
    sendEmail('invitationMail', _invitedUsers);

    return ReS(res, { Classe: { success: true } }, 201);
};
module.exports.create = create;

const update = async function (req, res) {
    let err, _err, classe, data;

    if (req.params.classe_id) {
        data = req.body;

        [err, classe] = await to(Classe.findById(req.params.classe_id));
        if (err) return ReE(res, err, 422);

        classe.set(data);

        [_err, classe] = await to(classe.save());
        if (_err) return ReE(res, _err, 422);

        return ReS(res, {
            Classe: {
                success: true
            }
        });

    } else {
        return ReE(res, 'Specify classe ID.');
    }
};
module.exports.update = update;

const remove = async function (req, res) {
    let err;

    if (req.params.classe_id) {

        // Get classe
        let classe;
        [err, classe] = await to(Classe.findById(req.params.classe_id).populate([{ path: 'users' }, {
            path: 'rooms',
            populate: [{
                path: 'users',
                model: 'User'
            }]
        }]).exec());
        if (err) return ReE(res, err, 422);

        // Remove classe from invited users
        let invitedToDelete;
        [err, invitedToDelete] = await to(Invited.deleteMany({
            classe: req.params.classe_id
        }));

        // Remove classe from users
        if (classe && classe.users) {
            for (let _user of classe.users) {
                let userToUpdate;
                [err, userToUpdate] = await to(User.findByIdAndUpdate(
                    _user._id,
                    {
                        $pull: {
                            classes: classe._id
                        }
                    },
                    { new: true, useFindAndModify: false }
                ));
            }
        }

        // Remove classe's rooms
        if (classe && classe.rooms) {
            for (let _room of classe.rooms) {
                if (_room.users) {
                    for (let _user of _room.users) {
                        let userToUpdate;
                        [err, userToUpdate] = await to(User.findByIdAndUpdate(
                            _user._id,
                            {
                                $pull: {
                                    rooms: _room._id
                                }
                            },
                            { new: true, useFindAndModify: false }
                        ));
                    }
                }

                // Remove room from invited users
                let invitedToDeleteRoom;
                [err, invitedToDeleteRoom] = await to(Invited.deleteMany({
                    room: _room._id
                }));

                let roomToDelete;
                [err, roomToDelete] = await to(Room.findByIdAndDelete(_room._id));
            }
        }

        // Remove the classe
        let theClasse;
        [err, theClasse] = await to(Classe.findByIdAndDelete(req.params.classe_id));
        if (err) return ReE(res, 'Error occurred trying to delete classe! ' + err);


        return ReS(res, { message: 'Classe Deleted!' });

    } else {
        return ReE(res, 'Specify classe ID.');
    }
};
module.exports.remove = remove;

const listClasseParticipant = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    let err, classe, invitedUsers;
    let participants = [];

    if (req.params.classe_id) {

        // Get classe users
        [err, classe] = await to(Classe.findById(req.params.classe_id).populate([{ path: 'users' }]).exec());
        if (err) return ReE(res, err, 422);

        if (classe && classe.users && (classe.users.length > 0)) {
            for (let user of classe.users) {
                participants.push({
                    isInvited: false,
                    fullName: user.fullName,
                    email: user.email,
                    isModerator: user.isModerator,
                    _id: user._id,
                    profileImage: user.profileImage || ''
                });
            }
        }

        // Get invited users
        [err, invitedUsers] = await to(Invited.find({
            classe: req.params.classe_id
        }));
        if (err) return ReE(res, err, 422);

        if (invitedUsers) {
            for (let user of invitedUsers) {
                participants.push({
                    isInvited: true,
                    fullName: user.fullName,
                    email: user.email,
                    isModerator: false,
                    _id: user._id,
                    profileImage: ''
                });
            }
        }

        return ReS(res, { Participants: participants });

    } else {
        return ReE(res, 'Specify classe ID.');
    }
};
module.exports.listClasseParticipant = listClasseParticipant;


const listArchivedClasseRooms = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    let err, classe;

    if (req.params.classe_id) {

        [err, classe] = await to(Classe.findById(req.params.classe_id).populate([{
            path: 'rooms',
            match: {
                isActive: false
            },
            populate: [{
                path: 'classe',
                model: 'Classe'
            }, {
                path: 'creator',
                model: 'User'
            }]
        }]).exec());
        if (err) return ReE(res, err, 422);

        let dataToSend = {
            _id: classe._id,
            rooms: []
        };

        if (classe.rooms.length > 0) {
            for (let _room of classe.rooms) {
                let _data = {
                    _id: _room._id,
                    startDateTime: _room.startDateTime,
                    endDateTime: _room.endDateTime,
                    isActive: _room.isActive,
                    isInstant: _room.isInstant,
                    roomName: _room.roomName,
                    description: _room.description,
                    creator: {
                        _id: _room.creator._id,
                        fullName: _room.creator.fullName
                    },
                    classe: []
                };

                if (_room.classe.length > 0) {
                    for (let _classe of _room.classe) {
                        _data.classe.push({
                            _id: _classe._id,
                            classeName: _classe.classeName,
                        });
                    }
                }
                dataToSend.rooms.push(_data);
            }
        }

        return ReS(res, { Classe: dataToSend });

    } else {
        return ReE(res, 'Specify classe ID.');
    }
};
module.exports.listArchivedClasseRooms = listArchivedClasseRooms;


const myUserClasses = async function (req, res) {
    let err, classe;

    const classes = await Classe.find({ creator: req.user.id }).select('classeName _id id');

    return ReS(res, { Classe: classes });

}

module.exports.myUserClasses = myUserClasses;

