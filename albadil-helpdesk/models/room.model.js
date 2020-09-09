let mongoose = require('mongoose');

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
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

// RoomSchema.virtual('users', {
//     ref: 'User',
//     localField: '_id',
//     foreignField: 'rooms'
// });

// RoomSchema.virtual('invited', {
//     ref: 'Invited',
//     localField: '_id',
//     foreignField: 'room'
// });

// RoomSchema.virtual('classe', {
//     ref: 'Classe',
//     localField: '_id',
//     foreignField: 'rooms'
// });
// RoomSchema.virtual('room_files', {
//     ref: 'Files',
//     localField: '_id',
//     foreignField: 'room'
// });



RoomSchema.methods.paginate = async function (pageNo, pageLimit, searchQuery, callback) {
    var limit = parseInt(pageLimit);
    var skip = (parseInt(pageNo) - 1) * limit;
    var totalCount;
    var docs;
    console.log(skip);

    if (typeof searchQuery !== 'object') {
        docs = await mongoose.models['Room'].find({}).skip(skip).limit(limit).sort({ $natural: -1 });
        totalCount = await mongoose.models['Room'].find({}).countDocuments();
    }

    if (typeof searchQuery === 'object') {
        docs = await mongoose.models['Room'].find({
            isActive: true, roomName: { '$regex': searchQuery.param, '$options': 'i' }
        }).skip(skip).limit(limit).sort({ $natural: -1 });
        totalCount = await mongoose.models['Room'].find({
            isActive: true, roomName: { '$regex': searchQuery.param, '$options': 'i' }
        }).countDocuments();
    }

    var result = {
        totalRecords: totalCount,
        page: parseInt(pageNo),
        per_page: docs.length,
        result: docs
    };
    return callback('Records', result);
};

let Room = module.exports = mongoose.model('Room', RoomSchema);
