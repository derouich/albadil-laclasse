let express     = require('express'),
    router      = express.Router();

let webinarController = require('../controllers/webinarController');

router.post('/webinar', webinarController.registerParticipants);

module.exports = router;
