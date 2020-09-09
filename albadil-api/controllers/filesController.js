var mv = require('mv');
const { to, ReE, ReS } = require('../helpers/utils');
const { Room, Files, User } = require('../models');
const fs = require("fs");

exports.uploadFiles = async (req, res) => {
    const { file } = req.files;
    const { room_id } = req.fields;
    let err, room;
    if (!room_id) {
        return ReE(res, 'Please provide room id', 422);
    }
    [err, room] = await to(Room.findById({ _id: room_id }));
    if (err) return ReE(res, err, 404);

    if (!file) {
        return ReE(res, 'Please upload file', 422);
    }

    if (Array.isArray(file)) {
        for (let i = 0; i < file.length; i++) {
            const e = file[i];
            if (!e || !e.name) {
                return ReE(res, 'Please upload file', 422);
            }

            if (!e.name.match(/\.(doc|docx|pdf|jpg|png|jpeg|xls|xlsx|ppt|pptx)$/i)) {
                return ReE(res, 'Please upload file of .jpg, .png .pptx .ppt .xlsx .xls .pdf .docx .doc or jpeg', 422);
            }

        }
        for (let index = 0; index < file.length; index++) {
            const element = file[index];
            if (!element || !element.name) {
                return ReE(res, 'Please upload file', 422);
            }
            if (element.name) {
                var path;
                const fileExtension = element.name.split('.').pop();
                path = 'project-assets/files/' + 'files_' + Date.now() + '.' + fileExtension;
                mv(element.path, path, async function (err) {
                    if (err) throw err
                    console.log('Successfully renamed - AKA moved!');
                    await Files.create({ file_path: path, creator: req.user.id, room: room.id })
                });
            }
        }

        return ReS(res, { message: 'Files uploaded...' });
    }

    if (!Array.isArray(file)) {
        console.log('single');
        if (!file || !file.name) {
            return ReE(res, 'Please upload file', 422);
        }
        if (file.name) {
            if (!file.name.match(/\.(doc|docx|pdf|jpg|png|jpeg|xls|xlsx|ppt|pptx)$/i)) {
                return ReE(res, 'Please upload file of .jpg, .png .pptx .ppt .xlsx .xls .pdf .docx .doc or jpeg', 422);
            }
            const fileExtension = file.name.split('.').pop();
            path = 'project-assets/files/' + 'files_' + Date.now() + '.' + fileExtension;
            mv(file.path, path, async function (err) {
                if (err) throw err;
                console.log('Successfully renamed - AKA moved!');
                await Files.create({ file_path: path, creator: req.user._id, room: room.id })
                return ReS(res, { message: 'Files uploaded...' });
            });
        }
    }
};

exports.filesPerRoom = async (req, res) => {
    const { room_id } = req.params;
    let err, room;
    if (!room_id) {
        return ReE(res, 'Please provide room id', 422);
    }
    [err, room] = await to(Room.findById({ _id: room_id }));
    if (err) return ReE(res, err, 404);

    const files = await Files.find({ room: room_id }).populate('room').sort({ $natural: -1 });
    return ReS(res, { files });
};


exports.deleteFile = async (req, res) => {
    const { path } = req.body;
    if (fs.existsSync(path)) {
        fs.unlink(path, (err) => {
            if (err && err.code == 'ENOENT') {
                return ReE(res, 'File doesn\'t exist, won\'t remove it', 401);
            } else if (err) {
                return ReE(res, 'Error occurred while trying to remove file', 401);
            } else {
                return ReS(res, {});
            }
        });
    } else {
        return ReE(res, 'File not exists', 404);
    }
};


exports.downloadFile = async (req, res) => {
    const { path } = req.query;
    console.log(path);
    if (fs.existsSync(path)) {
        res.download(path, function (err) {
            console.log(err);
        });
    } else {
        return ReE(res, 'File not exists', 404);
    }
};

exports.filesPerUser = async (req, res) => {
    const { user_id } = req.params;
    let err, user;
    // if(!user_id) return ReE(res, 'Please provide user id', 422);
    [err, user] = await to(User.findById({ _id: user_id }));
    if (err) return ReE(res, 'Invalid user id', 404);

    const files = await Files.find({ creator: user_id }).populate('room').sort({ $natural: -1 });
    return ReS(res, { files });


}







