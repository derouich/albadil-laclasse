let express     = require('express'),
    router      = express.Router();
let passport    = require('passport');

require('./../middleware/passport')(passport);

let scriptsController = require('../controllers/scriptsController');

router.post('/scripts/script-1', passport.authenticate('jwt', {session:false}), scriptsController.getAllUsersWIthBase64);
router.post('/scripts/script-2', passport.authenticate('jwt', {session:false}), scriptsController.base64ToImageLink);

router.post('/scripts/gustave/script-3', passport.authenticate('jwt', {session:false}), scriptsController.addGustaveUsers);

module.exports = router;
