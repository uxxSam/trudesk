var async           = require('async');
var expect          = require('chai').expect;
var should          = require('chai').should();
var m               = require('mongoose');
var ticketTypeSchema = require('../../src/models/tickettype');

describe('ticketType.js', function() {

    it('should create a ticket type', function(done) {
        ticketTypeSchema.create({
            name: 'Test Ticket Type'
        }, function(err, tt) {
            expect(err).to.not.exist;
            expect(tt).to.be.a('object');
            expect(tt._doc).to.include.keys('_id', 'name');

            done();
        });
    });

    it('should get all ticket types.', function(done) {
        ticketTypeSchema.getTypes(function(err, types) {
            expect(err).to.not.exist;
            expect(types).to.be.a('array');
            expect(types).to.have.length(1);

            done();
        });
    });

    it('should get ticket type via name', function(done) {
        ticketTypeSchema.getTypeByName('Test Ticket Type', function(err, type) {
            expect(err).to.not.exist;
            expect(type).to.be.a('object');

            done();
        });
    });

});
