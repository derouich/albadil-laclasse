let mongoose    = require('mongoose');

// Define a schema
let Schema = mongoose.Schema;

let RoomSchema = new Schema({

    roomName: {
        type: String,
        trim: true
    },


    description: {
        type: String,
        trim: true
    },

    schoolName: {
        type: String,
        trim: true
    },

    city: {
        type: String,
        trim: true
    },

    meetingID: {
        type: String,
        trim: true
    },

    attendeePW: {
        type: String,
        trim: true,
        required: true
    },

    moderatorPW: {
        type: String,
        trim: true,
        required: true
    },

    startDateTime: {
        type: Date
    },

    endDateTime: {
        type: Date
    },

    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    isActive: {
        type: Boolean,
        required: true,
        default: true
    },

    /*originalUrl: {
        type: String
    },*/

    urlCode: {
        type: String
    },

    /*shortUrl: {
        type: String
    },*/

    isInstant: {
        type: Boolean,
        required: true,
        default: false
    },

    isPublic: {
        type: Boolean,
        required: true,
        default: false
    },

    subscribers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

RoomSchema.virtual('users', {
    ref: 'User',
    localField: '_id',
    foreignField: 'rooms'
});

RoomSchema.virtual('invited', {
    ref: 'Invited',
    localField: '_id',
    foreignField: 'room'
});

RoomSchema.virtual('classe', {
    ref: 'Classe',
    localField: '_id',
    foreignField: 'rooms'
});
RoomSchema.virtual('room_files', {
    ref: 'Files',
    localField: '_id',
    foreignField: 'room'
});

RoomSchema.methods.toWeb = function() {
    let json = this.toJSON();
    json.id = this._id; //this is for the front end
    return json;
};

let Room = module.exports = mongoose.model('Room', RoomSchema);
