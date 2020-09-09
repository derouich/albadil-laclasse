let express     = require('express'),
    router      = express.Router();

let shortenerController = require('../controllers/shortenerController');

router.get('/:urlCode', shortenerController.redirectToOriginal);

module.exports = router;
