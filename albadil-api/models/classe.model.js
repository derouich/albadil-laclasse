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

ClasseSchema.virtual('invited', {
    ref: 'Invited',
    localField: '_id',
    foreignField: 'classe'
});

ClasseSchema.methods.toWeb = function() {
    let json = this.toJSON();
    json.id = this._id; //this is for the front end
    return json;
};

let Classe = module.exports = mongoose.model('Classe', ClasseSchema);
