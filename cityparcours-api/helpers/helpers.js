let crypto = require('crypto');
let fs = require('fs');


module.exports.generateChecksum = (queryString) => {
    const shasum = crypto.createHash('sha1');
    return shasum.update(queryString).digest('hex');
};

module.exports.generateMeetingId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

module.exports.generateMeetingPassword = (type) => {
    return type + '' + Math.random().toString(36).substring(7);
};

module.exports.readHTMLFile = (path, callback) => {
    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
        if (err) {
            console.log(err);
            callback(err);
        }
        else {
            callback(null, html);
        }
    });
};
