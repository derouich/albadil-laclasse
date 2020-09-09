let mongoose    = require('mongoose');
let bcrypt      = require('bcrypt');
let bcrypt_p    = require('bcrypt-promise');
let jwt         = require('jsonwebtoken');
let validate    = require('mongoose-validator');
let {TE, to}    = require('../helpers/utils');
let keys = require('./../config/keys');

// Define a schema
let Schema = mongoose.Schema;

let UserSchema = new Schema({

    studentNumber: {
        type: String,
        trim: true
    },

    fullName: {
        type: String,
        trim: true
    },

    phone: {
        type: String,
        lowercase: true,
        trim: true,
        index: true,
        sparse: true //sparse is because now we have two possible unique keys that are optional
    },

    email: {
        type: String,
        lowercase: true,
        trim: true,
        index: true,
        unique: true,
        sparse: true,
        validate: [validate({
            validator: 'isEmail',
            message: 'Not a valid email.',
        }),]
    },

    password: {
        type: String,
        trim: true
    }, // add city

    cityName: {
        type: String,
        trim: true
    },

    etablissement: {
        type: String,
        trim: true
    },

    profileImage: {
        type: String,
        default: null
    },

    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    },

    isModerator: {
        type: Boolean,
        required: true,
        default: false
    },

    classes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Classe"
        }
    ],

    rooms: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room"
        }
    ],

    notifications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Notification"
        }
    ],

    status: {
        type: Boolean,
        required: true,
        default: true
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

    validationToken: {
        type: String
    },

    forgotPasswordToken: {
        type: String
    },

    lastLogin: {
        type: Date
    },
    socket_id: {
        type: String,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

UserSchema.virtual('subscribedRooms', {
    ref: 'Room',
    localField: '_id',
    foreignField: 'subscribers'
});

UserSchema.pre('save', async function(next) {

    if (this.isModified('password') || this.isNew) {

        let err, salt, hash;
        [err, salt] = await to(bcrypt.genSalt(10));
        if(err) TE(err.message, true);

        [err, hash] = await to(bcrypt.hash(this.password, salt));
        if(err) TE(err.message, true);

        this.password = hash;
    } else {
        return next();
    }
});

UserSchema.methods.comparePassword = async function(pw) {
    let err, pass;
    if (!this.password) TE('password not set');

    [err, pass] = await to(bcrypt_p.compare(pw, this.password));
    if (err) TE(err);

    if (!pass) TE('invalid password');

    return this;
};

UserSchema.methods.getJWT = function() {
    let expiration_time = parseInt(keys.JWT_EXPIRATION);
    return "Bearer " + jwt.sign({user_id:this._id}, keys.JWT_ENCRYPTION, {/*expiresIn: expiration_time*/});
};

UserSchema.methods.toWeb = function() {
    let json = this.toJSON();
    json.id = this._id; //this is for the front end
    return json;
};

let User = module.exports = mongoose.model('User', UserSchema);
