let mongoose    = require('mongoose');

// Define a schema
let Schema = mongoose.Schema;

let NotificationSchema = new Schema({
    message: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        trim: true
    },

    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    isSeen: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

// NotificationSchema.methods.toWeb = function() {
//     let json = this.toJSON();
//     json.id = this._id; //this is for the front end
//     return json;
// };

let Notification = module.exports = mongoose.model('Notification', NotificationSchema);
