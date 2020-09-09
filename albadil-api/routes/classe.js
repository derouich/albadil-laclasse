let express     = require('express'),
    router      = express.Router();
let passport    = require('passport');

require('./../middleware/passport')(passport);

let classeController = require('../controllers/classeController');

router.get('/classes', passport.authenticate('jwt', {session:false}), classeController.listAll);

router.get('/classes/:classe_id', passport.authenticate('jwt', {session:false}), classeController.listOne);

router.post('/classes', passport.authenticate('jwt', {session:false}), classeController.create);

router.put('/classes/:classe_id', passport.authenticate('jwt', {session:false}), classeController.update);

router.delete('/classes/:classe_id', passport.authenticate('jwt', {session:false}), classeController.remove);

router.get('/classes/invited/:classe_id', passport.authenticate('jwt', {session:false}), classeController.listClasseParticipant);

router.get('/classes/archived/:classe_id', passport.authenticate('jwt', {session:false}), classeController.listArchivedClasseRooms);

router.get('/my-classes',  passport.authenticate('jwt', {session:false}), classeController.myUserClasses);

module.exports = router;
