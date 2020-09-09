let mongoose    = require('mongoose');
let validate    = require('mongoose-validator');

// Define a schema
let Schema = mongoose.Schema;

let InvitedSchema = new Schema({

    fullName: {
        type: String,
        trim: true
    },

    email: {
        type: String,
        lowercase: true,
        trim: true,
        validate: [validate({
            validator: 'isEmail',
            message: 'Not a valid email.',
        }),]
    },

    classe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Classe"
    },

    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

InvitedSchema.methods.toWeb = function() {
    let json = this.toJSON();
    json.id = this._id; //this is for the front end
    return json;
};

let Invited = module.exports = mongoose.model('Invited', InvitedSchema);
