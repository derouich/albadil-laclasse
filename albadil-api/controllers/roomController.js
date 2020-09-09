const { Room, Classe, User, Invited, Files } = require('../models');
const { to, ReE, ReS, saveNotification } = require('../helpers/utils');
const { generateChecksum, generateMeetingId, generateMeetingPassword } = require('../helpers/helpers');
const shortid = require("shortid");
const sha1 = require('sha1');
const moment = require('moment');
var schedule = require('node-schedule');

let rp = require('request-promise');
let xml2js = require('xml2js');

let keys = require('./../config/keys');


let presentation = '<modules><module name="presentation">' +
    '<document url="https://bucket.mwsapp.com/albadil-users-profile-pictures/default.pdf" ' +
    'filename="presentation.pdf"/>' +
    "</module></modules>";


const listAll = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    let err, user;

    [err, user] = await to(User.findById(req.user._id).populate([{
        path: 'rooms',
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
    }, {
        path: 'subscribedRooms',
        match: {
            isActive: true
        },
        populate: [{
            path: 'creator',
            model: 'User'
        }, {
            path: 'users',
            model: 'User'
        }, {
            path: 'invited',
            model: 'Invited'
        }]
    }]).exec());
    if (err) return ReE(res, err, 422);

    let rooms = [];
    let archivedRooms = [];
    let publicRooms = [];
    let privateRooms = [];
    let subscribedRooms = publicCoursesResponse(user.subscribedRooms, req, false);

    for (let room of user.rooms) {
        let roomData = {
            isActive: room.isActive,
            isInstant: room.isInstant,
            _id: room._id,
            id: room._id,
            roomName: room.roomName,
            description: room.description,
            meetingID: room.meetingID,
            attendeePW: room.attendeePW,
            moderatorPW: room.moderatorPW,
            startDateTime: room.startDateTime,
            endDateTime: room.endDateTime,
            schoolName: room.schoolName,
            city: room.city,
            urlCode: room.urlCode,
            creator: {
                _id: room.creator._id,
                fullName: room.creator.fullName,
            },
            classe: [],
            participants: room.users.length + room.invited.length,
            subscribers: 0,
            isPublicSearch: false,
            isPublic: false
        };
        if (room.classe.length > 0) {
            for (let _roomClasse of room.classe) {
                roomData.classe.push({
                    _id: _roomClasse._id,
                    classeName: _roomClasse.classeName,
                });
            }
        }

        if (room.subscribers) {
            roomData.subscribers = room.subscribers.length;
        }

        if (room.isPublic) {
            roomData.isPublic = room.isPublic;
        }

        if (roomData.isActive) {
            rooms.push(roomData);
        } else {
            archivedRooms.push(roomData);
        }

        if (roomData.isPublic && roomData.isActive) {
            publicRooms.push(roomData);
        }

        if (!roomData.isPublic && roomData.isActive) {
            privateRooms.push(roomData);
        }
    }

    return ReS(res, {
        Rooms: rooms,
        ArchivedRooms: archivedRooms,
        PublicRooms: publicRooms,
        PrivateRooms: privateRooms,
        SubscribedRooms: subscribedRooms
    });
};
module.exports.listAll = listAll;

const listAllPublicRooms = async function (req, res) {
    let rooms, err;

    let roomParams = {
        isActive: true,
        isPublic: true
    };

    [err, rooms] = await to(Room.find(roomParams).populate([
        {path: 'creator'},
        {path: 'users'},
        {path: 'invited'},
    ]).exec());
    if (err) return ReE(res, err, 422);

    return ReS(res, {
        Rooms: publicCoursesResponse(rooms, req, true)
    });
};
module.exports.listAllPublicRooms = listAllPublicRooms;

const listOne = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    let err, room;

    if (req.params.room_id) {

        [err, room] = await to(Room.findOne({
            _id: req.params.room_id
        }).populate([{
            path: 'invited'
        }, {
            path: 'room_files'
        }, {
            path: 'subscribers'
        }, {
            path: 'classe'
        }]).exec());

        if (err) return ReE(res, err, 422);
        if(!room) return ReE(res, 'Room not found');
        // console.log(room);

        let roomData = {
            invited: room.invited,
            roomName: room.roomName,
            schoolName: room.schoolName,
            creator: room.creator,
            subscribers: [],
            classes: []
        };

        if (room.subscribers && room.subscribers.length) {
            for (let subscriber of room.subscribers) {
                roomData.subscribers.push({
                    fullName: subscriber.fullName,
                    _id: subscriber._id,
                    id: subscriber._id,
                    profileImage: subscriber.profileImage || ''
                });
            }
        }

        if (room.classe && room.classe.length) {
            for (let _classe of room.classe) {
                roomData.classes.push({
                    classeName: _classe.classeName,
                    _id: _classe._id,
                    id: _classe._id,
                    creator: _classe.creator,
                    schoolName: _classe.schoolName,
                    city: _classe.city
                })
            }
        }

        return ReS(res, {Room: roomData});

    } else {
        return ReE(res, 'Specify room ID.');
    }
};
module.exports.listOne = listOne;

const create = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    let err, room, roomData, bbbMeeting, classe;

    let bodyData = req.body;

    /*
    Create a BBB room
     */
    // Create Query String
    console.log('step init');
    let bbbMeetingID = generateMeetingId();
    let queryString;
    if (bodyData.isGustaveDashboard === true || bodyData.isGustaveDashboard === 'true') {
        queryString = '' +
            'name=' + encodeURIComponent(bodyData.roomName) +
            '&meetingID=' + bbbMeetingID +
            '&attendeePW=' + generateMeetingPassword('a') +
            '&moderatorPW=' + generateMeetingPassword('m') +
            '&welcome=' + encodeURIComponent(keys.BBB_MEETING_WELCOME_MESSAGE) +
            '&isBreakout=false' +
            '&allowStartStopRecording=false' +
            '&copyright=LaClasse.ma'

    } else {
        queryString = '' +
            'name=' + encodeURIComponent(bodyData.roomName) +
            '&meetingID=' + bbbMeetingID +
            '&attendeePW=' + generateMeetingPassword('a') +
            '&moderatorPW=' + generateMeetingPassword('m') +
            '&welcome=' + encodeURIComponent(keys.BBB_MEETING_WELCOME_MESSAGE) +
            '&isBreakout=false' +
            '&allowStartStopRecording=false' +
            '&copyright=LaClasse.ma';

    }

    // Generate checksum
    let checksum = generateChecksum('create' + queryString + keys.BBB_SECRET);

    console.log("getchecksum " + checksum)
    // Send post request
    let options;
    if (bodyData.isDashboard === true || bodyData.isGustaveDashboard === 'true') {
        options = {
            method: 'POST',
            uri: keys.BBB_HOST + '/create?' + queryString + '&checksum=' + checksum,
            body: presentation
        };

    } else {
        options = {
            method: 'POST',
            uri: keys.BBB_HOST + '/create?' + queryString + '&checksum=' + checksum
        };
    }
    console.log(options.body.toString());

    [err, bbbMeeting] = await to(rp(options));
    if (err) {
        return ReE(res, err, 422);
    }


    // Read XML response
    let parsedXML;
    var parser = new xml2js.Parser(/* options */);

    [err, parsedXML] = await to(parser.parseStringPromise(bbbMeeting));
    if (err) return ReE(res, err, 422);
    console.log('start parsing');

    if (parsedXML && parsedXML.response && parsedXML.response.returncode[0] === 'SUCCESS') {

        if (bodyData.isInstant === 'true' || bodyData.isInstant === true) {
            roomData = {
                roomName: bodyData.roomName,
                description: bodyData.description || '',
                meetingID: parsedXML.response.meetingID[0],
                attendeePW: parsedXML.response.attendeePW[0],
                moderatorPW: parsedXML.response.moderatorPW[0],
                creator: req.user._id,
                isInstant: true
            };
        } else {
            roomData = {
                roomName: bodyData.roomName,
                description: bodyData.description || '',
                meetingID: parsedXML.response.meetingID[0],
                attendeePW: parsedXML.response.attendeePW[0],
                moderatorPW: parsedXML.response.moderatorPW[0],
                startDateTime: bodyData.startDateTime,
                endDateTime: bodyData.endDateTime,
                creator: req.user._id
            };
        }


        if (typeof bodyData.classeId === 'string' && bodyData.classeId !== 'none') {
            // Find classe
            [err, classe] = await to(Classe.findById(bodyData.classeId));
            if (err) return ReE(res, err, 422);

            roomData.schoolName = classe.schoolName;
            roomData.city = classe.city;

        } else {
            roomData.schoolName = req.user.etablissement;
            roomData.city = req.user.cityName;
        }

        /*
        Generate shortUrl for room
         */
        // Generate url code
        let urlCode = '';
        let characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < 5; i++) {
            urlCode += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        // Create meeting URL
        /*let queryString = "" +
            "meetingID=" + roomData.meetingID +
            "&fullName=" + 'laClasse+Guest' +
            "&password=" + roomData.attendeePW +
            "&redirect=true";
        let checksum = sha1("join" + queryString + keys.BBB_SECRET);*/

        //roomData.originalUrl = keys.BBB_HOST + '/join?' + queryString + '&checksum=' + checksum;
        roomData.urlCode = urlCode;
        //roomData.shortUrl = keys.API_URL + '/' + urlCode;

        roomData.isPublic = bodyData.isPublic === 'true' || bodyData.isPublic === true;
        /*
        create room
         */
        [err, room] = await to(Room.create(roomData));
        if (err) return ReE(res, err, 422);

        // add room to user
        let thisUser;
        let user = req.user;
        [err, thisUser] = await to(User.findByIdAndUpdate(
            user._id,
            {
                $addToSet: {
                    rooms: room._id
                }
            },
            { new: true, useFindAndModify: false }
        ));
        if (err) return ReE(res, err, 422);

        if (typeof bodyData.classeId === 'string' && bodyData.classeId !== 'none') {
            // Update classe
            let theClasse;
            [err, theClasse] = await to(Classe.findByIdAndUpdate(
                bodyData.classeId,
                {
                    $addToSet: {
                        rooms: room._id
                    }
                },
                { new: true, useFindAndModify: false }
            ));
            if (err) return ReE(res, err, 422);

        } else if (typeof bodyData.classeId === 'object' && bodyData.classeId !== 'none') {
            for (let _classe of bodyData.classeId) {
                // Update classe
                let theClasse;
                [err, theClasse] = await to(Classe.findByIdAndUpdate(
                    _classe,
                    {
                        $addToSet: {
                            rooms: room._id
                        }
                    },
                    { new: true, useFindAndModify: false }
                ));
                if (err) return ReE(res, err, 422);
            }
        }

        const msg = `${room.roomName} room has been created by ${req.user.fullName}`;
        const type = 'create_room';
        const fromUser = req.user.id;
        const toUser = req.user.id;
        const noti = await saveNotification(msg, type, fromUser, toUser);
        var io = req.app.get('socketio');
        io.to(req.user.socket_id).emit('notity', noti);

        roomStartCronJob(room, req);

        ReS(res,{Room: {success: true}}, 201);

        /*
         Add room to all classe users
         */
        if (typeof bodyData.classeId === 'string' && bodyData.classeId !== 'none') {
            // Get classe
            let theLastClasse;
            [err, theLastClasse] = await to(Classe.findById(bodyData.classeId).populate([{ path: 'users' }]).exec());

            // Get users
            if (theLastClasse && theLastClasse.users && (theLastClasse.users.length > 0)) {
                for (let theLastUser of theLastClasse.users) {
                    let _thisLastUser;
                    // Add room to user
                    [err, _thisLastUser] = await to(User.findByIdAndUpdate(
                        theLastUser._id,
                        {
                            $addToSet: {
                                rooms: room._id
                            }
                        },
                        { new: true, useFindAndModify: false }
                    ));
                }
            }
        } else if (typeof bodyData.classeId === 'object' && bodyData.classeId !== 'none') {
            for (let _classe of bodyData.classeId) {
                // Get classe
                let theLastClasse;
                [err, theLastClasse] = await to(Classe.findById(_classe).populate([{ path: 'users' }]).exec());

                // Get users
                if (theLastClasse && theLastClasse.users && (theLastClasse.users.length > 0)) {
                    for (let theLastUser of theLastClasse.users) {
                        let _thisLastUser;
                        // Add room to user
                        [err, _thisLastUser] = await to(User.findByIdAndUpdate(
                            theLastUser._id,
                            {
                                $addToSet: {
                                    rooms: room._id
                                }
                            },
                            { new: true, useFindAndModify: false }
                        ));
                    }
                }
            }
        }


    } else {
        return ReE(res, 'Oops! something went wrong.', 422);
    }
};
module.exports.create = create;

const update = async function (req, res) {
    let err, _err, room, data;

    if (req.params.room_id) {
        data = req.body;

        [err, room] = await to(Room.findById(req.params.room_id));
        if (err) return ReE(res, err, 422);

        let newClasseIds = data.classeId || [];
        let oldClasseIds = [];
        let classeIdsToDelete = [];
        let classeIdsToAdd = [];

        // Add ids to oldClasseIds
        if (data.oldClasseId && data.oldClasseId.length > 0) {
            for (let _oldId of data.oldClasseId) {
                oldClasseIds.push(_oldId._id);
            }
        }

        // Get classe ids to delete
        if (data.isCLassesEmpty === 'true' || data.isCLassesEmpty === true) {
            for (let _oldId of oldClasseIds) {
                classeIdsToDelete.push(_oldId);
            }
        } else {
            if (newClasseIds.length > 0) {
                for (let _oldId of oldClasseIds) {
                    if (!newClasseIds.includes(_oldId)) {
                        classeIdsToDelete.push(_oldId);
                    }
                }
            }
        }

        // Get classe ids to add
        for (let _newId of newClasseIds) {
            if (!oldClasseIds.includes(_newId)) {
                classeIdsToAdd.push(_newId);
            }
        }

        // Delete room from old classes
        for (let idToDelete of classeIdsToDelete) {
            let classeToUpdate;
            [err, classeToUpdate] = await to(Classe.findByIdAndUpdate(
                idToDelete,
                {
                    $pull: {
                        rooms: req.params.room_id
                    }
                },
                { new: true, useFindAndModify: false }
            ));
            if (err) return ReE(res, err, 422);
        }

        // Add room to new classes
        for (let idToAdd of classeIdsToAdd) {
            let _classeToUpdate;
            [err, _classeToUpdate] = await to(Classe.findByIdAndUpdate(
                idToAdd,
                {
                    $addToSet: {
                        rooms: req.params.room_id
                    }
                },
                { new: true, useFindAndModify: false }
            ));
            if (err) return ReE(res, err, 422);
        }

        data.schoolName = req.user.etablissement;
        data.city = req.user.cityName;

        room.set(data);

        [_err, room] = await to(room.save());
        if (_err) return ReE(res, _err, 422);

        return ReS(res, {
            Room: {
                success: true
            }
        });

    } else {
        return ReE(res, 'Specify room ID.');
    }
};
module.exports.update = update;

const remove = async function (req, res) {
    let room, err;

    if (req.params.room_id) {

        // Get room
        let room;
        [err, room] = await to(Room.findById(req.params.room_id).populate([{ path: 'users' }]).exec());
        if (err) return ReE(res, err, 422);

        // Remove room from invited users
        let invitedToDelete;
        [err, invitedToDelete] = await to(Invited.deleteMany({
            room: req.params.room_id
        }));

        // Remove room from users
        if (room && room.users) {
            for (let _user of room.users) {
                let userToUpdate;
                [err, userToUpdate] = await to(User.findByIdAndUpdate(
                    _user._id,
                    {
                        $pull: {
                            rooms: room._id
                        }
                    },
                    { new: true, useFindAndModify: false }
                ));
            }
        }

        // Remove the classe
        let theRoom;
        [err, theRoom] = await to(Room.findByIdAndDelete(req.params.room_id));
        if (err) return ReE(res, 'Error occurred trying to delete room! ' + err);

        return ReS(res, { message: 'Room Deleted!' });

    } else {
        return ReE(res, 'Specify room ID.');
    }
};
module.exports.remove = remove;

const roomLogout = async function (req, res) {
    let room, err;

    if (req.query.meetingID) {
        [err, room] = await to(Room.findOne({ meetingID: req.query.meetingID }));
        if (err) return ReE(res, err, 422);

        room.set({
            isActive: false
        });

        [err, room] = await to(room.save());
        if (err) return ReE(res, err, 422);

        res.redirect(keys.DASHBOARD_URL);

    } else {
        res.redirect(keys.DASHBOARD_URL);
    }
};
module.exports.roomLogout = roomLogout;

const startRoom = async function (req, res) {
    let room, err, user, invitedUser;
    let data = req.body;

    // Get room
    [err, room] = await to(Room.findOne({ urlCode: data.roomCode }));
    if (err) return ReE(res, err, 422);

    // Get user
    [err, user] = await to(User.findOne({ email: data.userEmail }));
    if (err) return ReE(res, err, 422);

    if (room) {
        if (user && room.creator.toString() === user._id.toString()) {
            return ReS(res, { isModerator: true });
        } else {
            /*
            check room
            */
            let parsedXML;
            var parser = new xml2js.Parser(/* options */);

            let queryString_meetingInfo = "meetingID=" + room.meetingID;
            let checksum_meetingInfo = sha1("getMeetingInfo" + queryString_meetingInfo + keys.BBB_SECRET);

            let options_meetingInfo = {
                method: 'GET',
                uri: keys.BBB_HOST + '/getMeetingInfo?' + queryString_meetingInfo + '&checksum=' + checksum_meetingInfo
            };

            let bbbMeeting_meetingInfo;
            [err, bbbMeeting_meetingInfo] = await to(rp(options_meetingInfo));
            if (err) return ReE(res, err, 422);

            [err, parsedXML] = await to(parser.parseStringPromise(bbbMeeting_meetingInfo));
            if (err) return ReE(res, err, 422);

            if (parsedXML && parsedXML.response && parsedXML.response.returncode[0] !== 'SUCCESS') {
                // Recreate room
                let queryString;
                if (data.isGustaveDashboard === true || data.isGustaveDashboard === 'true') {
                    queryString = '' +
                        'name=' + encodeURIComponent(room.roomName) +
                        '&meetingID=' + room.meetingID +
                        '&attendeePW=' + room.attendeePW +
                        '&moderatorPW=' + room.moderatorPW +
                        '&welcome=' + encodeURIComponent(keys.BBB_MEETING_WELCOME_MESSAGE) +
                        '&isBreakout=false' +
                        '&allowStartStopRecording=false' +
                        '&copyright=LaClasse.ma';
                } else {
                    queryString = '' +
                        'name=' + encodeURIComponent(room.roomName) +
                        '&meetingID=' + room.meetingID +
                        '&attendeePW=' + room.attendeePW +
                        '&moderatorPW=' + room.moderatorPW +
                        '&welcome=' + encodeURIComponent(keys.BBB_MEETING_WELCOME_MESSAGE) +
                        '&isBreakout=false' +
                        '&allowStartStopRecording=false' +
                        '&copyright=LaClasse.ma';
                }

                // Generate checksum
                let checksum = generateChecksum('create' + queryString + keys.BBB_SECRET);

                // Send post request
                let options;
                if (data.isGustaveDashboard === true || data.isGustaveDashboard === 'true') {

                    options = {
                        method: 'POST',
                        uri: keys.BBB_HOST + '/create?' + queryString + '&checksum=' + checksum,
                        body: presentation
                    };
                } else {
                    options = {
                        method: 'POST',
                        uri: keys.BBB_HOST + '/create?' + queryString + '&checksum=' + checksum
                    };
                }

                let bbbMeeting;
                [err, bbbMeeting] = await to(rp(options));
                if (err) return ReE(res, err, 422);
            }

            if (user) {
                let queryString = "" +
                    "meetingID=" + room.meetingID +
                    "&fullName=" + encodeURIComponent(user.fullName) +
                    "&password=" + (user._id === room.creator ? room.moderatorPW : room.attendeePW) +
                    "&redirect=true";

                let checksum = sha1("join" + queryString + keys.BBB_SECRET);

                let roomURL = keys.BBB_HOST + '/join?' + queryString + '&checksum=' + checksum;

                return ReS(res, { roomURL: roomURL });
            } else {
                // Get invited user
                [err, invitedUser] = await to(Invited.findOne({ email: data.userEmail }));
                if (err) return ReE(res, err, 422);

                if (invitedUser) {

                    let queryString = "" +
                        "meetingID=" + room.meetingID +
                        "&fullName=" + encodeURIComponent(invitedUser.fullName) +
                        "&password=" + room.attendeePW +
                        "&redirect=true";
                    let checksum = sha1("join" + queryString + keys.BBB_SECRET);

                    let roomURL = keys.BBB_HOST + '/join?' + queryString + '&checksum=' + checksum;

                    return ReS(res, { roomURL: roomURL });

                } else {
                    return ReS(res, { message: 'Room link is invalid!' });
                }
            }
        }
    } else {
        return ReS(res, { message: 'Room link is invalid!' });
    }
};
module.exports.startRoom = startRoom;

const startVerifyRoom = async function (req, res) {
    let bbbMeeting_meetingInfo, err;

    let parsedXML;
    var parser = new xml2js.Parser(/* options */);

    let data = req.body;

    /*
    Get meeting info
     */
    let queryString_meetingInfo = "meetingID=" + data.meetingID;
    let checksum_meetingInfo = sha1("getMeetingInfo" + queryString_meetingInfo + keys.BBB_SECRET);

    let options_meetingInfo = {
        method: 'GET',
        uri: keys.BBB_HOST + '/getMeetingInfo?' + queryString_meetingInfo + '&checksum=' + checksum_meetingInfo
    };

    [err, bbbMeeting_meetingInfo] = await to(rp(options_meetingInfo));
    if (err) return ReE(res, err, 422);

    [err, parsedXML] = await to(parser.parseStringPromise(bbbMeeting_meetingInfo));
    if (err) return ReE(res, err, 422);

    if (parsedXML && parsedXML.response && parsedXML.response.returncode[0] === 'SUCCESS') {
        return ReS(res, {
            roomRedirectURL: data.roomRedirectURL,
            isRoomOn: true
        });
    } else {
        // Recreate room
        let queryString;
        if (data.isGustaveDashboard === true || data.isGustaveDashboard === 'true') {
            queryString = '' +
                'name=' + encodeURIComponent(data.roomName) +
                '&meetingID=' + data.meetingID +
                '&attendeePW=' + data.attendeePW +
                '&moderatorPW=' + data.moderatorPW +
                '&welcome=' + encodeURIComponent(keys.BBB_MEETING_WELCOME_MESSAGE) +
                '&isBreakout=false' +
                '&allowStartStopRecording=false' +
                '&copyright=LaClasse.ma';
        } else {
            queryString = '' +
                'name=' + encodeURIComponent(data.roomName) +
                '&meetingID=' + data.meetingID +
                '&attendeePW=' + data.attendeePW +
                '&moderatorPW=' + data.moderatorPW +
                '&welcome=' + encodeURIComponent(keys.BBB_MEETING_WELCOME_MESSAGE) +
                '&isBreakout=false' +
                '&allowStartStopRecording=false' +
                '&copyright=LaClasse.ma';
        }

        // Generate checksum
        let checksum = generateChecksum('create' + queryString + keys.BBB_SECRET);

        // Send post request
        let options;
        if (data.isGustaveDashboard === true || data.isGustaveDashboard === 'true') {

            options = {
                method: 'POST',
                uri: keys.BBB_HOST + '/create?' + queryString + '&checksum=' + checksum,
                body: presentation
            };
        } else {
            options = {
                method: 'POST',
                uri: keys.BBB_HOST + '/create?' + queryString + '&checksum=' + checksum
            };
        }

        let bbbMeeting;
        [err, bbbMeeting] = await to(rp(options));
        if (err) return ReE(res, err, 422);

        [err, parsedXML] = await to(parser.parseStringPromise(bbbMeeting));
        if (err) return ReE(res, err, 422);

        if (parsedXML && parsedXML.response && parsedXML.response.returncode[0] === 'SUCCESS') {
            return ReS(res, {
                roomRedirectURL: data.roomRedirectURL,
                isRoomOn: true
            });
        } else {
            let roomToUpdate;
            [err, roomToUpdate] = await to(Room.findByIdAndUpdate(
                data.roomId,
                {
                    isActive: false
                },
                { new: true, useFindAndModify: false }
            ));

            return ReS(res, {
                roomRedirectURL: data.roomRedirectURL,
                isRoomOn: false
            });
        }
    }
};
module.exports.startVerifyRoom = startVerifyRoom;

const verifyRoom = async function(req, res) {
    let roomCode = req.params.room_code;
    let room, err;

    [err, room] = await to(Room.findOne({urlCode: roomCode, isActive: true}));
    if (err) return ReE(res, err, 422);

    if (room) {
        return ReS(res, {
            isRoomValid: true,
            startDateTime: room.startDateTime,
            isInstant: room.isInstant
        });
    } else {
        return ReS(res, {
            isRoomValid: false
        });
    }
};
module.exports.verifyRoom = verifyRoom;

function randomString(length) {
    var result = '';
    var characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

async function roomStartCronJob(room, req) {

    const myroom = await Room.findById({ _id: room.id, isActive: true });

    const msg = `${myroom.roomName} room will be started after 15 minutes`;
    const type = 'room_start_fifteen';
    const fromUser = req.user.id;
    const toUser = req.user.id;
    //

    // run cron job on sepecific date
    var x = moment(myroom.startDateTime);
    console.log('real time:  ' + moment(x).format('h:mm'));
    var duration = moment.duration("00:15:00");
    var diff = x.subtract(duration).format('hh:mm');
    console.log('after subtraction 15min:  ' + diff);
    var year = x.format('YYYY');
    var month = x.format('M');
    var day = x.format('DD');
    var hour = x.format('H');
    var minutes = x.format('mm');
    console.log(`hour: ${hour},  minutes: ${minutes}, day: ${day}, month: ${month}, year: ${year}`);
    var job_name = randomString(10);
    var isFinished = false;

    if (myroom) {
        schedule.scheduleJob(job_name, `00 ${minutes} ${hour} ${day} ${month} *`, async function () {

            const noti = await saveNotification(msg, type, fromUser, toUser);
            const time = moment(noti.createdAt, "YYYYMMDD").fromNow();
            var io = req.app.get('socketio');
            io.to(req.user.socket_id).emit('notity', noti);

            console.log(`Cron job for room has been started`);
            isFinished = true;
            if (isFinished) {
                console.log('finished');
                schedule.scheduledJobs[job_name].cancel();
            }
        });
    }
}

function publicCoursesResponse(rooms, req, hideSubscribedRooms) {
    let roomsToReturn = [];

    if (rooms) {
        for (let _room of rooms) {

            let isSubscribe = false;
            let subscribers = 0;

            if (_room.subscribers) {
                isSubscribe = _room.subscribers.includes(req.user._id.toString());
                subscribers = _room.subscribers.length;
            }

            if (hideSubscribedRooms) {
                if (!isSubscribe) {
                    if (_room.creator) {
                        if (req.user._id.toString() !== _room.creator._id.toString()) {
                            roomsToReturn.push({
                                isInstant: _room.isInstant,
                                _id: _room._id,
                                id: _room._id,
                                roomName: _room.roomName,
                                description: _room.description,
                                schoolName: _room.schoolName,
                                city: _room.city,
                                creator: {
                                    _id: _room.creator._id,
                                    fullName: _room.creator.fullName,
                                },
                                participants: _room.users.length + _room.invited.length,
                                subscribers: subscribers,
                                isSubscribe: isSubscribe,
                                isPublicSearch: true,
                                isPublic: true
                            });
                        }
                    }
                }
            } else {
                if (_room.creator) {
                    if (req.user._id.toString() !== _room.creator._id.toString()) {
                        roomsToReturn.push({
                            isInstant: _room.isInstant,
                            _id: _room._id,
                            id: _room._id,
                            roomName: _room.roomName,
                            description: _room.description,
                            schoolName: _room.schoolName,
                            city: _room.city,
                            creator: {
                                _id: _room.creator._id,
                                fullName: _room.creator.fullName,
                            },
                            participants: _room.users.length + _room.invited.length,
                            subscribers: subscribers,
                            isSubscribe: isSubscribe,
                            isPublicSearch: true,
                            isPublic: true
                        });
                    }
                }
            }
        }
    }

    return roomsToReturn;
}

function privateCoursesResponse(user) {
    let rooms = [];

    for (let room of user.rooms) {
        let roomData = {
            isActive: room.isActive,
            isInstant: room.isInstant,
            _id: room._id,
            id: room._id,
            roomName: room.roomName,
            description: room.description,
            meetingID: room.meetingID,
            attendeePW: room.attendeePW,
            moderatorPW: room.moderatorPW,
            startDateTime: room.startDateTime,
            endDateTime: room.endDateTime,
            schoolName: room.schoolName,
            city: room.city,
            urlCode: room.urlCode,
            creator: {
                _id: room.creator._id,
                fullName: room.creator.fullName,
            },
            classe: [],
            participants: room.users.length + room.invited.length,
            subscribers: 0,
            isPublicSearch: false,
            isPublic: false
        };
        if (room.classe.length > 0) {
            for (let _roomClasse of room.classe) {
                roomData.classe.push({
                    _id: _roomClasse._id,
                    classeName: _roomClasse.classeName,
                });
            }
        }

        if (room.subscribers) {
            roomData.subscribers = room.subscribers.length;
        }

        if (room.isPublic) {
            roomData.isPublic = room.isPublic;
        }

        rooms.push(roomData);
    }

    return rooms;
}

const search = async function (req, res) {
    const { roomName, profName, searchType } = req.query;

    if (searchType === 'publicCourses') {
        let rooms, err;

        let roomParams = {
            isActive: true,
            isPublic: true
        };
        let creatorParams = {};

        if (roomName !== '') {
            roomParams.roomName = {$regex: '.*' + roomName + '.*'};
        }

        if (profName !== '') {
            creatorParams.fullName = { $regex: '.*' + profName + '.*' };
        }

        [err, rooms] = await to(Room.find(roomParams).populate([
            {
                path: 'creator',
                match: creatorParams
            },
            {path: 'users'},
            {path: 'invited'},
        ]).exec());
        if (err) return ReE(res, err, 422);

        return ReS(res, {
            Rooms: publicCoursesResponse(rooms, req, false)
        });
    }

    else if (searchType === 'privateCourses') {
        let user, err;

        let roomParams = {
            isActive: true
        };

        if (roomName !== '') {
            roomParams.roomName = {$regex: '.*' + roomName + '.*'};
        }

        [err, user] = await to(User.findById(req.user._id).populate([{
            path: 'rooms',
            match: roomParams,
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
        }]).exec());
        if (err) return ReE(res, err, 422);

        return ReS(res, {
            Rooms: privateCoursesResponse(user)
        });
    }

    else {
        let rooms, user, err;

        let roomParams = {
            isActive: true
        };
        let creatorParams = {};

        if (roomName !== '') {
            roomParams.roomName = {$regex: '.*' + roomName + '.*'};
        }

        if (profName !== '') {
            creatorParams.fullName = { $regex: '.*' + profName + '.*' };
        }

        // Public
        [err, rooms] = await to(Room.find({
            ...roomParams,
            isPublic: true
        }).populate([
            {
                path: 'creator',
                match: creatorParams
            },
            {path: 'users'},
            {path: 'invited'},
        ]).exec());
        if (err) return ReE(res, err, 422);

        // Private
        [err, user] = await to(User.findById(req.user._id).populate([{
            path: 'rooms',
            match: roomParams,
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
        }]).exec());
        if (err) return ReE(res, err, 422);

        return ReS(res, {
            Rooms: publicCoursesResponse(rooms, req, false).concat(privateCoursesResponse(user))
        });
    }
};
module.exports.search = search;

const subscribe = async function (req, res) {
    const { roomID, subscribe } = req.query;

    let room, err;

    let isSubscribe = false;

    if (subscribe === 'true' || subscribe === true) {
        [err, room] = await to(Room.findByIdAndUpdate(
            roomID,
            {
                $addToSet: {
                    subscribers: req.user._id
                }
            },
            { new: true, useFindAndModify: false }
        ));
        if (err) return ReE(res, err, 422);

        isSubscribe = true;
    } else {
        [err, room] = await to(Room.findByIdAndUpdate(
            roomID,
            {
                $pull: {
                    subscribers: req.user._id
                }
            },
            { new: true, useFindAndModify: false }
        ));
        if (err) return ReE(res, err, 422);

        isSubscribe = false;
    }

    return ReS(res, {
        isSubscribe: isSubscribe
    });
};
module.exports.subscribe = subscribe;

const handleSubscriptions = async function (req, res) {
    const { roomID, userID, accept } = req.query;

    let room, user, err;

    [err, room] = await to(Room.findById(roomID));
    if (err) return ReE(res, err, 422);

    if (room) {
        // Delete user from subscribers list
        [err, room] = await to(Room.findByIdAndUpdate(
            roomID,
            {
                $pull: {
                    subscribers: userID
                }
            },
            { new: true, useFindAndModify: false }
        ));
        if (err) return ReE(res, err, 422);


        if (accept === 'true' || accept === true) {
            // Add room to user
            [err, user] = await to(User.findByIdAndUpdate(
                userID,
                {
                    $addToSet: {
                        rooms: roomID
                    }
                },
                { new: true, useFindAndModify: false }
            ));
            if (err) return ReE(res, err, 422);
        }

        return ReS(res, {
            isDone: true
        });

    } else {
        return ReS(res, {
            isDone: false
        });
    }
};
module.exports.handleSubscriptions = handleSubscriptions;

const getRoomParticipants = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    const { roomID } = req.query;

    let err, room, invitedUsers;
    let participants = [];

    if (roomID) {

        // Get room users
        [err, room] = await to(Room.findById(roomID).populate([{ path: 'users' }]).exec());
        if (err) return ReE(res, err, 422);

        if (room && room.users && (room.users.length > 0)) {
            for (let user of room.users) {
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
            room: roomID
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
        return ReE(res, 'Specify room ID.');
    }
};
module.exports.getRoomParticipants = getRoomParticipants;

const deleteParticipantFromRoom = async function (req, res) {
    let err;

    // Get user
    let thisUser;
    [err, thisUser] = await to(User.findById(req.params.user_id));
    if (err) return ReE(res, err, 422);

    if (!thisUser) {
        // remove invited users with this room
        let invitedToDelete;
        [err, invitedToDelete] = await to(Invited.deleteMany({
            _id: req.params.user_id,
            room: req.params.room_id
        }));
        if (err) return ReE(res, err, 422);

    } else {
        // Delete room from user
        let userToUpdate;
        [err, userToUpdate] = await to(User.findByIdAndUpdate(
            req.params.user_id,
            {
                $pull: {
                    rooms: req.params.room_id
                }
            },
            { new: true, useFindAndModify: false }
        ));
        if (err) return ReE(res, err, 422);
    }

    return ReS(res, { message: 'User deleted from room!' });
};
module.exports.deleteParticipantFromRoom = deleteParticipantFromRoom;
