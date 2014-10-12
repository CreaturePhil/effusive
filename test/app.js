var request = require('supertest');
var app = require('../index.js');
var mongoose = require('mongoose');
var secrets = require('../config/secrets');

describe('connecting to mongodb server', function() {
  it('should connect to mongodb server', function(done) {
    mongoose.connect(secrets.db);
    mongoose.connection.on('error', function() {
      return done('MongoDB Connection Error. Make sure MongoDB is running.');
    });
    done();
  });
});

describe('GET /', function() {
  it('should return 200 OK', function(done) {
    request(app)
    .get('/')
    .expect(200, done);
  });
});

describe('GET /signup', function() {
  it('should return 200 OK', function(done) {
    request(app)
    .get('/signup')
    .expect(200, done);
  });
});

describe('GET /login', function() {
  it('should return 200 OK', function(done) {
    request(app)
    .get('/login')
    .expect(200, done);
  });
});


describe('GET /forgot_password', function() {
  it('should return 200 OK', function(done) {
    request(app)
    .get('/forgot_password')
    .expect(200, done);
  });
});

describe('GET /contact in development', function() {
  it('should return 404', function(done) {
    request(app)
    .get('/contact')
    .expect(404, done);
  });
});

describe('GET /contact in production', function() {
  it('should return 404', function(done) {
    app.set('env', 'production');
    request(app)
    .get('/contact')
    .expect(404, done);
  });
});

describe('GET /community', function() {
  it('should return 200 OK', function(done) {
    request(app)
    .get('/community')
    .expect(200, done);
  });
});

describe('GET /logout', function() {
  it('should return 302 Redirect', function(done) {
    request(app)
    .get('/logout')
    .expect(302, done);
  });
});

describe('GET /settings/', function() {
  describe('GET /account', function() {
    it('should return 302 Redirect', function(done) {
      request(app)
      .get('/settings/account')
      .expect(302, done);
    });
  });
  describe('GET /password', function() {
    it('should return 302 Redirect', function(done) {
      request(app)
      .get('/settings/password')
      .expect(302, done);
    });
  });
  describe('GET /delete', function() {
    it('should return 302 Redirect', function(done) {
      request(app)
      .get('/settings/delete')
      .expect(302, done);
    });
  });
});
