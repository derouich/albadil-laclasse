const fs                = require('fs');
const path              = require('path');
const basename          = path.basename(__filename);
const models            = {};
const mongoose          = require('mongoose');
let keys = require('./../config/keys');

if (keys.DB_HOST !== '') {
    let files = fs
        .readdirSync(__dirname)
        .filter((file) => {
            return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
        })
        .forEach((file) => {
            var filename = file.split('.')[0];
            var model_name = filename.charAt(0).toUpperCase() + filename.slice(1);
            models[model_name] = require('./' + file);
        });

    mongoose.Promise = global.Promise; //set mongo up to use promises

    const mongo_location = `mongodb://${keys.DB_HOST}:${keys.DB_PORT}/${keys.DB_NAME}`;

    mongoose.connect(mongo_location, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    }).catch((err) => {
        console.log('*** Can Not Connect to Mongo Server:', mongo_location);
    });

    let db = mongoose.connection;
    module.exports = db;
    db.once('open', () => {
        console.log('Connected to mongo at ' + mongo_location);
        //require('./../config/userData').create();
    });
    db.on('error', (error) => {
        console.log("error", error);
    });
    // End of Mongoose Setup
} else {
    console.log("No Mongo Credentials Given");
}

module.exports = models;
