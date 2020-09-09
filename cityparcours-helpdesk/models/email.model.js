let mongoose = require('mongoose');
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

// Define a schema
let Schema = mongoose.Schema;

let emailSchema = new Schema({

    first_name: {
        type: String,
        trim: true
    },
    last_name: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isDownload: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        trim: true
    }
});


emailSchema.pre('save', async function (next) {
    this.password = randomString(6);
});




let Classe = module.exports = mongoose.model('Email', emailSchema);
