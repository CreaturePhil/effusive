var chai = require('chai');
var should = chai.should();
var User = require('../app/models/User');

describe('User Model', function() {
  it('should create a new user', function(done) {
    var user = new User({
      uid: 'tester',
      username: 'Tester',
      email: 'test@gmail.com',
      password: 'password'
    });
    user.save(function(err) {
      if (err) return done(err);
      done();
    })
  });

  it('should not create a user with the unique username', function(done) {
    var user = new User({
      uid: 'tester',
      username: 'TESTER',
      email: 'testchange@gmail.com',
      password: 'password'
    });
    user.save(function(err) {
      if (err) err.code.should.equal(11000);
      done();
    });
  });

  it('should not create a user with the unique email', function(done) {
    var user = new User({
      username: 'Tester2',
      email: 'test@gmail.com',
      password: 'password'
    });
    user.save(function(err) {
      if (err) err.code.should.equal(11000);
      done();
    });
  });

  it('should find user by uid (username id)', function(done) {
    User.findOne({ uid: 'tester' }, function(err, user) {
      if (err) return done(err);
      user.uid.should.equal('tester');
      done();
    });
  });

  it('should find user by email', function(done) {
    User.findOne({ email: 'test@gmail.com' }, function(err, user) {
      if (err) return done(err);
      user.email.should.equal('test@gmail.com');
      done();
    });
  });

  it('should delete a user', function(done) {
    User.remove({ email: 'test@gmail.com' }, function(err) {
      if (err) return done(err);
      done();
    });
  });
});
