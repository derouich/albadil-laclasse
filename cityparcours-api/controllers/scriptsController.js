const { User } = require('../models');
const { to, ReE, ReS } = require('../helpers/utils');
const { minioClient, bucketsNames, generateFileName } = require('./../config/minio');

const getAllUsersWIthBase64 = async function (req, res) {

    if (req.user.isAdmin) {
        let users, err;

        [err, users] = await to(User.find({
            profileImage: { "$nin": [ null, "" ] }
        }));
        if (err) return ReE(res, err, 422);

        return ReS(res, {
            message: 'Users with images probably Base64!',
            count: users.length
        });
    } else {
        return ReE(res, "unauthorized", 401);
    }
};
module.exports.getAllUsersWIthBase64 = getAllUsersWIthBase64;

const base64ToImageLink = async function (req, res) {

    if (req.user.isAdmin) {
        let users, err, minioResponse;
        const BUCKET_ENDPOINT = 'https://bucket.mwsapp.com';

        [err, users] = await to(User.find({
            profileImage: { "$nin": [ null, "" ] }
        }));
        if (err) return ReE(res, err, 422);

        for (let user of users) {
            let imageType = user.profileImage.substring(user.profileImage.indexOf('/') + 1, user.profileImage.indexOf(';base64'));
            let imageName = `${generateFileName()}.${imageType}`;

            let base64Image = user.profileImage.split(';base64,').pop();

            const imageBuffer = Buffer.from(base64Image, 'base64');

            // Upload image to MinIO
            minioClient().putObject(bucketsNames().usersProfilePictures, imageName, imageBuffer).then(async () => {

                let _user, _err;
                [_err, _user] = await to(User.findByIdAndUpdate(
                    user._id,
                    {
                        profileImage: `${BUCKET_ENDPOINT}/${bucketsNames().usersProfilePictures}/${imageName}`
                    },
                    {
                        new: true,
                        useFindAndModify: false
                    }
                ));

            }).catch((err) => {console.log(err);});
        }

        return ReS(res, {
            message: 'Users Base64 to Path are done!',
            count: users.length
        });
    } else {
        return ReE(res, "unauthorized", 401);
    }
};
module.exports.base64ToImageLink = base64ToImageLink;

const addGustaveUsers = async function (req, res) {

    if (req.user.isAdmin) {

    } else {
        return ReE(res, "unauthorized", 401);
    }
};
module.exports.addGustaveUsers = addGustaveUsers;
