let express = require('express'),
    router = express.Router();
const formidableMiddleware = require('express-formidable');
let passport    = require('passport');
require('./../middleware/passport')(passport);

let filesController = require('../controllers/filesController');

router.post('/upload-files', 
passport.authenticate('jwt', {session:false}), formidableMiddleware({ multiples: true, }), filesController.uploadFiles);

router.get('/files/room/:room_id', passport.authenticate('jwt', {session:false}),  filesController.filesPerRoom);

router.post('/delete-file', passport.authenticate('jwt', {session:false}),  filesController.deleteFile);

router.get('/download-file',  filesController.downloadFile);

router.get('/files/:user_id', passport.authenticate('jwt', {session:false}), filesController.filesPerUser);


module.exports = router;