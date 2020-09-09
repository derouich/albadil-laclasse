const jsonResponse = require('../utils/jsonResponse');
const mongoose = require('mongoose');
const moment = require('moment');
const { Classe, User, Room, Email } = require('../models');
const underscore = require('underscore');
var { Parser } = require('json2csv')


exports.loginView = async (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    return res.render('login.ejs');
}
exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email) {
        return jsonResponse(res, 0, 'Email is required.');
    }
    if (!password) {
        return jsonResponse(res, 0, 'Password is required.');
    }
    /*if (email == 'admin@GustaveEiffel.com' && password == 'p@ssword') {
        req.session.user = email;
        return jsonResponse(res, 1, 'Logged In successfully...');
    } else {
        return jsonResponse(res, 0, 'Invalid credentials');
    }*/

    const user = await User.findOne({ email });
    if (!user) {
        return jsonResponse(res, 0, 'Invalid credentials');
    }
    const checkPass = await user.matchPassword(password);

    if (!checkPass) {
        return jsonResponse(res, 0, 'Invalid credentials');
    }

    if (user.isAdmin) {
        req.session.user = user;
        return jsonResponse(res, 1, 'Logged In successfully...');
    } else {
        return jsonResponse(res, 0, 'Could not logged in');
    }

}

exports.logout = async (req, res, next) => {
    req.session.user = null;
    return res.redirect('/login');
}

exports.homeView = async (req, res, next) => {
    const users = await User.find({}).countDocuments();
    const teachers = await User.find({ isModerator: true }).countDocuments();
    const students = await User.find({ isModerator: false }).countDocuments();
    const admins = await User.find({ isAdmin: true }).countDocuments();
    const classes = await Classe.find({}).countDocuments();
    const courses = await Room.find({}).countDocuments();


    return res.render('index.ejs', { users, teachers, students, classes, courses, admins: admins });
}


exports.usersView = async (req, res, next) => {
    return res.render('users.ejs');
}

exports.getUsers = async (req, res, next) => {
    var limit = parseInt(req.query.length);
    var skip = parseInt(req.query.start);
    var users;
    if (req.query.search.value !== '') {
        var search = req.query.search.value;
        users = await User.find({
            $or: [
                { email: { '$regex': search, '$options': 'i' } },
                { fullName: { '$regex': search, '$options': 'i' } },
                { phone: { '$regex': search, '$options': 'i' } }
            ]
        });
    } else {
        users = await User.find({}).skip(skip).limit(limit).sort({ $natural: -1 });
    }
    const count = await User.find({}).countDocuments();

    return res.json({ recordsFiltered: count, recordsTotal: count, users });
    // return jsonResponse(res, 1, 'Users are here', users);
}

exports.getUserDetails = async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById({ _id: id })
        .populate('rooms', null, { isActive: true })
        .populate('classes', null, { isActive: true });


    const LastUserLogin = moment(user.lastLogin).format('MMMM Do YYYY, h:mm:ss a');
    return res.render('user_detail.ejs', { user, LastUserLogin });
}

exports.deleteUser = async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findByIdAndRemove({ _id: id });
    if (user) {
        return res.redirect('/users');
    }
}




exports.updateUserProfile = async (req, res, next) => {
    const { password, status, moderator, admin, id, fullname, email, cityName, etablissement, forgotPasswordToken, phone } = req.body;

    const user = await User.findById({ _id: id });
    if (password) {
        user.password = password;
    }
    user.status = status;
    user.isModerator = moderator;
    user.isAdmin = admin;
    user.fullName = fullname;
    user.email = email;
    user.cityName = cityName;
    user.etablissement = etablissement;
    user.etablissement = etablissement;
    user.forgotPasswordToken = forgotPasswordToken;
    user.phone = phone;
    await user.save();
    return jsonResponse(res, 1, 'Profile updated...');
}




exports.createUserView = async (req, res, next) => {
    return res.render('create-user.ejs');
}

exports.createUserPost = async (req, res, next) => {
    const { fullName, email, password, phone, cityName, etablissement, moderator } = req.body;

    if (!fullName || !email || !password || !phone || !cityName || !etablissement) {
        return jsonResponse(res, 0, 'Please fill the form');
    }
    const user = await User.findOne({ email });
    if (user) {
        return jsonResponse(res, 0, 'User already exists with this email');
    }
    var newUser = new User();
    newUser.fullName = fullName;
    newUser.email = email;
    newUser.phone = phone;
    newUser.cityName = cityName;
    newUser.etablissement = etablissement;
    newUser.isModerator = moderator;
    newUser.password = password;
    await newUser.save();
    return jsonResponse(res, 1, 'User registered.');
}

exports.emailManagementView = async (req, res, next) => {
    return res.render('email-management.ejs');
}

exports.newEmailPost = async (req, res, next) => {
    const { first_name, last_name, phone } = req.body;
    if (!first_name || !last_name || !phone) {
        return jsonResponse(res, 0, 'Please prvode complete details');
    }
    var email = `${first_name}.${last_name}@gustaveeiffel.ma`;
    const newEmail = await Email.create({ first_name, last_name, phone, email });
    if (newEmail) {
        return jsonResponse(res, 1, 'Email created');
    }
}


exports.getEmails = async (req, res, next) => {
    var limit = parseInt(req.query.length);
    var skip = parseInt(req.query.start);
    var emails;
    if (req.query.search.value !== '') {
        var search = req.query.search.value;
        emails = await Email.find({
            isDeleted: false,
            $or: [
                { email: { '$regex': search, '$options': 'i' } },
                { first_name: { '$regex': search, '$options': 'i' } },
                { last_name: { '$regex': search, '$options': 'i' } },
                { phone: { '$regex': search, '$options': 'i' } }
            ]
        });
    } else {
        emails = await Email.find({ isDeleted: false }).skip(skip).limit(limit).sort({ $natural: -1 });
    }
    const count = await Email.find({ isDeleted: false }).countDocuments();

    return res.json({ recordsFiltered: count, recordsTotal: count, emails });
    // return jsonResponse(res, 1, 'Users are here', users);
}


exports.delEmail = async (req, res, next) => {
    const { id } = req.body;
    if (!id) {
        return jsonResponse(res, 0, 'Something went wrong');
    }
    const email = await Email.findOne({ _id: id, isDeleted: false });
    if (!email) {
        return jsonResponse(res, 0, 'Invalid email');
    }
    email.isDeleted = true;
    await email.save();
    return jsonResponse(res, 1, 'Email deleted successfully');
}

exports.download = async (req, res, next) => {
    const emails = await Email.find({ isDeleted: false, isDownload: false });
    var data = [];
    for (let index = 0; index < emails.length; index++) {
        const element = emails[index];
        var name = element.email.substring(0, element.email.indexOf('@'));
        var domain = 'gustaveeiffel.ma';
        var password = element.password
        data.push({ domain, name, password });
        element.isDownload = true;
        await element.save();
    }

    const json2csv = new Parser();
    try {
        const csv = json2csv.parse(data);
        res.attachment('data.csv');
        res.status(200).send(csv);
    } catch (error) {
        if (data.length == 0) {
            const csv = json2csv.parse({ domain: '', name: '', password: '' });
            res.attachment('data.csv');
            res.status(200).send(csv);
        }
        res.status(200).send(error.message);
    }
   
}











