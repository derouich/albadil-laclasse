let express     = require('express'),
    router      = express.Router();
let passport    = require('passport');

require('./../middleware/passport')(passport);

let notificationsController = require('../controllers/notificationsController');

router.get('/notifications', passport.authenticate('jwt', {session:false}), notificationsController.listUserNotifications);

// router.put('/notifications', passport.authenticate('jwt', {session:false}), notificationsController.notificationsIsSeenUpdate);

module.exports = router;
