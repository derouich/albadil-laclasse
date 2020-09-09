let Minio = require('minio');
let keys = require('./../config/keys');

module.exports.minioClient = () => {
    const MINIO_CONFIG = {
        endPoint: keys.MINIO_ENDPOINT,
        useSSL: true,
        accessKey: keys.MINIO_ACCESS_KEY,
        secretKey: keys.MINIO_SECRET_KEY
    };

    return new Minio.Client(MINIO_CONFIG);
};


module.exports.bucketsNames = () => {
    return {
        usersProfilePictures: 'cityparcours-users-profile-pictures'
    };
};

module.exports.generateFileName = () => {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
