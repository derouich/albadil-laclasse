let express     = require('express'),
    router      = express.Router();
let passport    = require('passport');

require('./../middleware/passport')(passport);

let roomController = require('../controllers/roomController');

router.get('/rooms', passport.authenticate('jwt', {session:false}), roomController.listAll);

router.get('/rooms/public-rooms/list', passport.authenticate('jwt', {session:false}), roomController.listAllPublicRooms);

router.get('/rooms/:room_id', passport.authenticate('jwt', {session:false}), roomController.listOne);

router.post('/rooms', passport.authenticate('jwt', {session:false}), roomController.create);

router.put('/rooms/:room_id', passport.authenticate('jwt', {session:false}), roomController.update);

router.delete('/rooms/:room_id', passport.authenticate('jwt', {session:false}), roomController.remove);

router.post('/rooms/search', passport.authenticate('jwt', {session:false}), roomController.search);

router.post('/rooms/subscribe', passport.authenticate('jwt', {session:false}), roomController.subscribe);

router.post('/rooms/handle-subscribe', passport.authenticate('jwt', {session:false}), roomController.handleSubscriptions);

router.get('/room/participants', passport.authenticate('jwt', {session:false}), roomController.getRoomParticipants);

router.delete('/room/:room_id/user/:user_id', passport.authenticate('jwt', {session:false}), roomController.deleteParticipantFromRoom);


router.get('/room/logout', roomController.roomLogout);

router.post('/rooms/start', roomController.startRoom);

router.post('/rooms/start_verify', roomController.startVerifyRoom);

router.get('/rooms/verify_room/:room_code', roomController.verifyRoom);


module.exports = router;
