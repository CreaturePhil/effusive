var chai = require('chai');
var moment = require('moment');
var should = chai.should();
var User = require('../app/models/User');
var Post = require('../app/models/Post');
var secrets = require('../config/secrets');
var Hashids = require('hashids');
var hashids = new Hashids(secrets.hashidSecret);

describe('user model', function() {
  it('should create a new user', function(done) {
    var user = new User({
      uid: 'tester',
      username: 'tester',
      email: 'test@gmail.com',
      password: 'password',
      joinDate: moment()
    });
    user.save(function(err) {
      if (err) return done(err);
      done();
    });
  });

  it('should not create a user with the unique username', function(done) {
    var user = new User({
      uid: 'tester',
      username: 'tester',
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
      username: 'tester2',
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

  it('should used user\'s methods', function(done) {
    User.findOne({ email: 'test@gmail.com' }, function(err, user) {
      if (err) return done(err);
      user.gravatar();
      user.comparePassword('password', function(err, isMatch) {
        isMatch.should.equal(true);
        done();
      });
    });
  });

  it('should delete a user', function(done) {
    User.remove({ email: 'test@gmail.com' }, function(err) {
      if (err) return done(err);
      done();
    });
  });
});

describe('post model', function() {
  var post = new Post({
    turl: 'my-title',
    title: 'My title',
    avatar: 'picture.png',
    author: 'admin',
    date: moment(),
    body: 'awesome content body here'
  });

  it('should create a new post', function(done) {
    post.save(function(err, savePost) {
      if (err) return done(err);
      post = savePost;
      done();
    });
  });

  it('should find post by id', function(done) {;
    done();
  });

  it('equal id of object when decoding post hashid', function(done) {
    hashids.decodeHex(post.getHash()).should.equal(post.id); 
    done();
  });

  it('should delete a post', function(done) {
    Post.remove({ id: post.id }, function(err) {
      if (err) return done(err);
      done();
    });
  });
});
