//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();
chai.use(chaiHttp);
var ls = require('local-storage');

function randomString(length) {
    var result = '';
    var characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

var email = `${randomString(5)}@gmail.com`;
var password = "password";
describe('users route', () => {
    describe('/POST register', () => {
        it('register here with unique email and password', (done) => {
            const data = { email, password }
            chai.request(server).post('/v1/register').send(data).end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.property('success').eql(true);
                done();
            });
        });
    });

    describe('/POST login', () => {
        it('check 1', (done) => {
            const data = { email }
            chai.request(server).post('/v1/login').send(data).end((err, res) => {
                res.should.have.status(422);
                res.body.should.be.a('object');
                res.body.should.property('success').eql(false);
                done();
            });
        });
    });

    describe('/POST login', () => {
        it('check 2', (done) => {
            const data = { email, password }
            chai.request(server).post('/v1/login').send(data).end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.property('success').eql(true);
                res.body.should.property('token');
                res.body.should.to.have.property('user');
                ls('token', res.body.token);
                done();
            });
        });
    });

    describe('/POST update user profile', () => {
        it('check', (done) => {
            const data = {
                "fullName": "junaid",
                "phone": "phone",
                "email": email,
                "password": password,
                "cityName": "lahore",
                "etablissement": "etablissement",
                "profileImage": "image.png",
                "isModerator": true
            }
            chai.request(server).post('/v1/user/me').set('Authorization', ls('token')).send(data).end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.property('success').eql(true);
                res.body.should.to.have.property('user');
            });
            done();
        });
    });

    describe('/POST Invite users', () => {
        it('check', (done) => {
            const data = {
                "invitedUsers": [
                    "name;email@gmail.com",
                    "name2;email2@gmail.com"
                ],
                "isClasse": true,
                "thisThingID": "5ea54aed059cc001346e92db"
            }
            chai.request(server).post('/v1/users/invite').set('Authorization', ls('token')).send(data).end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.property('success').eql(true);
                res.body.should.property('Invited').eql(true);
            });
            done();
        });
    });

    describe('/GET get user profile', () => {
        it('check', (done) => {
            chai.request(server).get('/v1/user/me').set('Authorization', ls('token')).end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.property('success').eql(true);
            });
            done();
        });
    });

    describe('/GET activate user account', () => {
        it('check', (done) => {
            chai.request(server).get('/v1/user/activation?email=email@gmail.com').set('Authorization', ls('token'))
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.property('success').eql(true);
                });
            done();
        });
    });





    // tests reuired classe id or room id so they will be tested manually


    // describe('/DELETE Delete user from classe', () => {
    //     it('check', (done) => {
    //         chai.request(server).post('/v1/users/5ea54a1b059cc001346e92d9/5ea54aed059cc001346e92db').set('Authorization', ls('token'))
    //             .end((err, res) => {
    //                 res.should.have.status(200);
    //                 res.body.should.be.a('object');
    //                 res.body.should.to.have.property('error');
    //                 // console.log(res.body);
    //             });
    //         done();
    //     });
    // });

    // describe('/DELETE invites users from classe or room', () => {
    //     it('check', (done) => {
    //         chai.request(server).delete('/v1/users/email2@gmail.com/5ea54aed059cc001346e92db').set('Authorization', ls('token'))
    //             .end((err, res) => {
    //                 res.should.have.status(200);
    //                 res.body.should.be.a('object');
    //                 res.body.should.property('success').eql(true);
    //             });
    //         done();
    //     });
    // });









    // tests are okay email token required that is why have to test these routes manully

    // describe('/POST forgot password email', () => {
    //     it('check 2', (done) => {
    //         const data = { email: "email@gmail.com" }
    //         chai.request(server).post('/v1/user/forgot_password').send(data).end((err, res) => {
    //             res.should.have.status(200);
    //             res.body.should.be.a('object');
    //             res.body.should.property('success').eql(true);
    //             done();
    //         });
    //     });
    // });

    // describe('/POST forgot password email', () => {
    //     it('check 2', (done) => {
    //         const data = {
    //             "email": "email@gmail.com",
    //             "password": "password",
    //             "token": "46bcaea83c3654a9"
    //         }
    //         chai.request(server).post('/v1/user/reset_password').send(data).end((err, res) => {
    //             res.should.have.status(200);
    //             res.body.should.be.a('object');
    //             res.body.should.property('success').eql(true);
    //             done();
    //         });
    //     });
    // });

});
