let mongoose    = require('mongoose');

// Define a schema
let Schema = mongoose.Schema;

let WebinarSchema = new Schema({

    fullName: {
        type: String,
        trim: true
    },

    email: {
        type: String,
        lowercase: true,
        trim: true
    },

    phone: {
        type: String,
        trim: true
    },

    webinarDate: {
        type: String,
        trim: true
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

WebinarSchema.methods.toWeb = function() {
    let json = this.toJSON();
    json.id = this._id; //this is for the front end
    return json;
};

let Webinar = module.exports = mongoose.model('Webinar', WebinarSchema);
