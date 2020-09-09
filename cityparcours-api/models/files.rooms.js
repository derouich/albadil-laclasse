let mongoose    = require('mongoose');

// Define a schema
let Schema = mongoose.Schema;

let RoomFilesSchema = new Schema({

    file_path: {
        type: String,
        trim: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
    }

});


module.exports = mongoose.model('Files', RoomFilesSchema);
