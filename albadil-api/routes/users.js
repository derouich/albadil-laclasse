let express = require('express'),
    router = express.Router();
let passport = require('passport');


require('./../middleware/passport')(passport);

let usersController = require('../controllers/usersController');


router.post('/login', usersController.login); // DONE: /login

router.post('/register', usersController.register); // DONE: /register

router.post('/users/invite', passport.authenticate('jwt', { session: false }), usersController.inviteUsers);


router.get('/user/me', passport.authenticate('jwt', { session: false }), usersController.listOne); // DONE: /users/me

router.post('/user/me', passport.authenticate('jwt', { session: false }), usersController.updateUser); // DONE: /users/me

// this one is to delete user from classe
router.delete('/users/:user_id/classe/:classe_id', passport.authenticate('jwt', { session: false }), usersController.deleteUser);
router.delete('/users/:user_email/:thing_id', passport.authenticate('jwt', { session: false }), usersController.manageDeleteInvitedUser);

router.get('/user/activation', usersController.activateUserAccount);

router.post('/user/forgot_password', usersController.forgotPassword);

router.post('/user/reset_password', usersController.resetPassword);

router.post('/user/delete-account', passport.authenticate('jwt', { session: false }), usersController.deleteUserAccount);




module.exports = router;
