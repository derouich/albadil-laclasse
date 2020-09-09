let createError = require('http-errors'),
  express = require('express'),
  cookieParser = require('cookie-parser'),
  env = require('dotenv').config(),
  bodyParser = require('body-parser'),
  passport = require('passport'),
  pe = require('parse-error'),
  cors = require('cors'),
  logger = require('morgan');

const { createUsers } = require('./config/data');
const { minioClient, bucketsNames } = require('./config/minio');
const User = require('./models/user.model');


//HTTPS
//var   fs = require("fs");
//var privateKey = fs.readFileSync('private.key').toString();
//var certificate = fs.readFileSync('certificate.crt').toString();
//var credentials = {key: privateKey, cert: certificate};


let app = express();

var http = require('http').createServer( app);



var io = require('socket.io')(http);
// global._io = io;
app.set('socketio', io);




// For BodyParser
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '200mb'
}));
app.use(bodyParser.json({ limit: '200mb' }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/v1/project-assets", express.static('project-assets'));

// Passport
app.use(passport.initialize());

// CORS
app.use(cors());

/*
MinIO
 */
// Create users profile pictures bucket
minioClient().bucketExists(bucketsNames().usersProfilePictures).then((exists) => {
  if (!exists) {
    minioClient().makeBucket(bucketsNames().usersProfilePictures).then().catch((err) => {});
  }
}).catch((err) => {});

/*
Create accounts
 */
createUsers().then().catch();

// The main page
app.get('/', function (req, res) {
  res.json({
    status: true
  });
});

let users = require('./routes/users');
let classe = require('./routes/classe');
let room = require('./routes/room');
let notifications = require('./routes/notifications');
let files = require('./routes/files');
let webinar = require('./routes/webinar');
let scripts = require('./routes/scripts');

let shortener = require('./routes/shortener');

app.use('/v1', [users, classe, room, notifications, files, webinar, scripts]);
app.use('/', [shortener]);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  let errorMessage = {};
  errorMessage.message = err.message;
  errorMessage.error = req.app.get('env') === 'development' ? err : {};

  errorMessage.status = err.status || 500;

  res.json(errorMessage);
});

app.use(function(req, res, next) {
      if ((req.get('X-Forwarded-Proto') !== 'https')) {
        res.redirect('https://' + req.get('Host') + req.url);
      } else
        next();
    });



io.on('connection', async function (socket) {
  io.to(socket.id).emit('connected', { connected: true });

  socket.on('join room', async (data) => {
    const user = await User.findById({ _id: data.id });
    if (user) {
      user.socket_id = socket.id;
      await user.save();
      console.log('socket id saved in db    ' + user.socket_id);
      console.log('socket id                ' + socket.id);
    }
  });
});



http.listen(process.env.PORT, function () {
  console.log('listening on *:'+process.env.PORT);
});








