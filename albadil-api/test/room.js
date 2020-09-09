let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();
chai.use(chaiHttp);
var ls = require('local-storage');

describe('Room routes', () => {
    describe('/POST login', () => {
        it('check 2', (done) => {
            const data = { email: "email@gmail.com", password: "password" }
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

    describe('/POST create room', () => {
        it('check 2', (done) => {
            const data = {
                "roomName": "room name",
                "startDateTime": "2020-04-26 02:42 PM",
                "description": "description",
                "classeId": "5ea54aed059cc001346e92db",
                "isInstant": false,
                "endDateTime": "2020-04-26 02:34 PM"
            }
            chai.request(server).post('/v1/rooms').set('Authorization', ls('token')).send(data).end((err, res) => {
                res.body.should.be.a('object');
                res.body.should.property('success').eql(true);
                res.body.should.to.have.property('Room');
                ls('room-id', res.body.Room.id);
                ls('room-urlCode', res.body.Room.urlCode);
                ls('room-meetingID', res.body.Room.meetingID);
                done();
            });
        });
    });

    describe('/GET get rooms', () => {
        it('check 2', (done) => {
            chai.request(server).get('/v1/rooms').set('Authorization', ls('token')).end((err, res) => {
                res.body.should.be.a('object');
                res.body.should.property('success').eql(true);
                done();
            });
        });
    });

    describe('/GET get room by id', () => {
        it('check 2', (done) => {
            chai.request(server).get(`/v1/rooms/${ls('room-id')}`).set('Authorization', ls('token')).end((err, res) => {
                res.body.should.be.a('object');
                res.body.should.property('success').eql(true);
                done();
            });
        });
    });

    describe('/PUT update room by id', () => {
        it('check 2', (done) => {
            var data = {
                "roomName": "jeda",
                "description": "update description",
                "classeId": [],
                "startDateTime": "2020-04-26 02:42 PM",
                "endDateTime": "2020-04-26 02:42 PM",
                "isInstant": true,
                "isCLassesEmpty": true,
                "oldClasseId": []
            }
            chai.request(server).put(`/v1/rooms/${ls('room-id')}`).set('Authorization', ls('token')).send(data).end((err, res) => {
                res.body.should.be.a('object');
                res.body.should.property('success').eql(true);
                done();
            });
        });
    });

   
    describe('/POST Start room', () => {
        it('check 2', (done) => {
            var data = {
                "roomCode": ls('room-urlCode'),
                "userEmail": "email@gmail.com"
            }
            chai.request(server).post('/v1/rooms/start').set('Authorization', ls('token')).send(data).end((err, res) => {
                res.body.should.be.a('object');
                res.body.should.property('success').eql(true);
                done();
            });
        });
    });

    describe('/GET logout of room', () => {
        it('check 2', (done) => {
            chai.request(server).get(`/v1/room/logout?meetingID=${ls('room-meetingID')}`).set('Authorization', ls('token')).end((err, res) => {
                // res.body.should.be.a('object');
                // res.body.should.property('success').eql(true);
                console.log(res.body);
                done();
            });
        });
    });



    // uncomplete
    // describe('/POST Start room after verifying its on', () => {
    //     it('check 2', (done) => {
    //         var data = {
    //             "roomQueryString": "",
    //             "roomChecksum": "",
    //             "roomRedirectURL": "",
    //             "roomId": "",
    //             "meetingID": "",
    //             "roomName": "",
    //             "moderatorPW": "",
    //             "attendeePW": ""
    //         }
    //         chai.request(server).post('/v1/rooms/start_verify').set('Authorization', ls('token')).send(data).end((err, res) => {
    //             // res.body.should.be.a('object');
    //             // res.body.should.property('success').eql(true);
    //             done();
    //         });
    //     });
    // });


    describe('/GET verify room is valid to start or no ', () => {
        it('check 2', (done) => {
            chai.request(server).post(`/v1/rooms/verify_room/${ls('room-urlCode')}`).set('Authorization', ls('token')).end((err, res) => {
                // res.body.should.be.a('object');
                // res.body.should.property('success').eql(true);
                console.log(res.body);
                done();
            });
        });
    });



     describe('/DEL delete room by id', () => {
        it('check 2', (done) => {
            chai.request(server).delete(`/v1/rooms/${ls('room-id')}`).set('Authorization', ls('token')).end((err, res) => {
                res.body.should.be.a('object');
                res.body.should.property('success').eql(true);
                done();
            });
        });
    });

});