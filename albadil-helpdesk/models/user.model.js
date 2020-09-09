let mongoose = require('mongoose');
let bcrypt = require('bcrypt');

// Define a schema
let Schema = mongoose.Schema;

let UserSchema = new Schema({

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
        sparse: true
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
    },
    fcm: {
        type: String,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

UserSchema.pre('save', async function (next) {
    if (this.isModified('password') || this.isNew) {
        let err, salt, hash;
        salt = await bcrypt.genSalt(10);
        hash = await bcrypt.hash(this.password, salt);
        this.password = hash;
    } else {
        return next();
    }
});

UserSchema.methods.matchPassword = function(password) {
    return bcrypt.compare(password, this.password);
  };

UserSchema.methods.paginate = async function (pageNo, pageLimit, callback) {
    var limit = parseInt(pageLimit);
    var skip = (parseInt(pageNo) - 1) * limit;
    var totalCount;
    var docs;

    docs = await mongoose.models['User'].find({}).skip(skip).limit(limit).sort({ $natural: -1 });
    totalCount = await mongoose.models['User'].find({}).countDocuments();

    var result = {
        totalRecords: totalCount,
        page: parseInt(pageNo),
        per_page: docs.length,
        result: docs
    };
    return callback('Records', result);


};



let User = module.exports = mongoose.model('User', UserSchema);
