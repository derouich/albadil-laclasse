let mongoose    = require('mongoose');

// Define a schema
let Schema = mongoose.Schema;

let ClasseSchema = new Schema({

    classeName: {
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

    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    rooms: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room"
        }
    ],

    isActive: {
        type: Boolean,
        required: true,
        default: true
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

ClasseSchema.virtual('users', {
    ref: 'User',
    localField: '_id',
    foreignField: 'classes'
});


ClasseSchema.methods.paginate = async function (pageNo, pageLimit, callback) {
    var limit = parseInt(pageLimit);
    var skip = (parseInt(pageNo) - 1) * limit;
    var totalCount;
    var docs;

    docs = await mongoose.models['Classe'].find({}).skip(skip).limit(limit).sort({ $natural: -1 });
    totalCount = await mongoose.models['Classe'].find({}).countDocuments();

    var result = {
        totalRecords: totalCount,
        page: parseInt(pageNo),
        per_page: docs.length,
        result: docs
    };
    return callback('Records', result);


};

let Classe = module.exports = mongoose.model('Classe', ClasseSchema);
