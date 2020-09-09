const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');
const adminsController = require('../controllers/admins');
const checkAdmin = require('../middlewares/checkAdmin');


router.get('/login', userController.loginView);
router.post('/login', userController.login);
router.get('/logout', userController.logout);

router.get('/', checkAdmin, userController.homeView);
router.get('/users', checkAdmin,  userController.usersView);
router.get('/users/:id', checkAdmin,  userController.getUserDetails);
router.get('/delete-user/:id', checkAdmin,  userController.deleteUser);
router.get('/get-users', checkAdmin,  userController.getUsers);
router.post('/update-user-profile', checkAdmin, userController.updateUserProfile);

router.get('/admins', checkAdmin, adminsController.adminsView);
router.get('/get-admins', checkAdmin,  adminsController.getAdmins);
router.get('/delete-admin/:id', checkAdmin,  adminsController.deleteAdmin);

router.get('/create-user', checkAdmin,  userController.createUserView);
router.post('/create-user',checkAdmin,  userController.createUserPost);

router.get('/email-management',checkAdmin,  userController.emailManagementView);
router.post('/new-email', checkAdmin, userController.newEmailPost);
router.post('/delete-email', checkAdmin, userController.delEmail);
router.get('/get-emails', checkAdmin, userController.getEmails);


router.get('/downlaod', checkAdmin, userController.download);



module.exports = router;
