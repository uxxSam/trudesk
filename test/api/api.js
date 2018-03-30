var async       = require('async');
var expect      = require('chai').expect;
var should      = require('chai').should();
var request     = require('supertest');
var superagent  = require('superagent');

describe('api/api.js', function() {

    var agent   = superagent.agent();
    var unauthAgent = superagent.agent();
    var user = { "login-username": 'trudesk', "login-password": '$2a$04$350Dkwcq9EpJLFhbeLB0buFcyFkI9q3edQEPpy/zqLjROMD9LPToW'};

    it('should return 401 for failed login', function(done) {
        var user = { username: 'test', password: '' };
        agent.post('http://localhost:3111/api/v1/login')
            .send(user)
            .end(function(err) {
                expect(err).to.exist;
                expect(err.status).to.equal(401);

                done();
            });
    });

    it('should login', function(done) {
        var user = { username: 'trudesk', password: '$2a$04$350Dkwcq9EpJLFhbeLB0buFcyFkI9q3edQEPpy/zqLjROMD9LPToW'};
        request(server).post('/api/v1/login')
            .send(user)
            .expect(200, done);
    });

    it('should gain a session', function(done) {
        agent.post('http://localhost:3111/login')
            .type('json')
            .send(user)
            .end(function(err, res) {
                should.not.exist(err);
                expect(res.status).to.equal(200);
                //expect(res.user).to.exist;

                done();
            });
    });

    //it('should have access token', function(done) {
    //    var userSchema = require('../../src/models/user');
    //    userSchema.getUserByUsername('trudesk', function(err, user) {
    //        expect(err).to.not.exist;
    //        expect(user).to.be.a('object');
    //        expect(user.accessToken).to.exist;
    //
    //        done();
    //    });
    //});

    it ('should return a 404 error (\'/api/404\')', function(done) {
        request(server).get('/api/404').expect(404, done);
    });

    it('should allow accessToken', function(done) {
        request(server).get('/api/v1/tickets/1000')
            .set('accesstoken', 'da39a3ee5e6b4b0d3255bfef95601890afd80709')
            .expect(200, done);
    });

    it('should error Invalid Access Token', function(done) {
        request(server).get('/api/v1/tickets/1000')
            .set('accesstoken', '1')
            .expect(401, done);
    });

});
