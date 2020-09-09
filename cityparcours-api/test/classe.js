let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();
chai.use(chaiHttp);
var ls = require('local-storage');

describe('classe routes', () => {
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

    describe('/POST create classe', () => {
        it('check', (done) => {
            const data = {
                "classeName": "class name",
                "schoolName": "school name",
                "city": "city",
                "invitedUsers": [
                    "name;email@gmail.com"
                ]
            }
            chai.request(server).post('/v1/classes').set('Authorization', ls('token')).send(data).end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.property('success').eql(true);
                res.body.should.to.have.property('Classe');
                ls('classe-id', res.body.Classe.id);
                done();
            });
        });
    });

    describe('/GET get classe', () => {
        it('check', (done) => {
            chai.request(server).get('/v1/classes').set('Authorization', ls('token')).end((err, res) => {
                res.body.should.be.a('object');
                res.body.should.property('success').eql(true);
                // console.log(res.body);
                done();
            });
        });
    });

    describe('/GET get classe by id', () => {
        it('check', (done) => {
            chai.request(server).get(`/v1/classes/${ls('classe-id')}`).set('Authorization', ls('token')).end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.property('success').eql(true);
                res.body.should.to.have.property('Classe');
                done();
            });
        });
    });

    describe('/PUT update classe', () => {
        it('check', (done) => {
            var data = {
                "classeName": "test",
                "schoolName": "schoolName",
                "city": "city"
            }
            chai.request(server).put(`/v1/classes/${ls('classe-id')}`).set('Authorization', ls('token')).send(data).end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.property('success').eql(true);
                res.body.should.to.have.property('Classe');
                done();
            });
        });
    });



    describe('/GET list all participant of classe', () => {
        it('check', (done) => {
            chai.request(server).get(`/v1/classes/invited/${ls('classe-id')}`).set('Authorization', ls('token')).end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.property('success').eql(true);
                done();
            });
        });
    });

    describe('/GET list archeived classe rooms', () => {
        it('check', (done) => {
            chai.request(server).get(`/v1/classes/archived/${ls('classe-id')}`).set('Authorization', ls('token')).end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.property('success').eql(true);
                done();
            });
        });
    });

    describe('/DELETE delete classe', () => {
        it('check', (done) => {
            chai.request(server).delete(`/v1/classes/${ls('classe-id')}`).set('Authorization', ls('token')).end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.property('success').eql(true);
                done();
            });
        });
    });

});