var chai = require('chai');
var moment = require('moment');
var should = chai.should();
var Post = require('../app/models/Post');
var secrets = require('../config/secrets');
var Hashids = require('hashids');
var hashids = new Hashids(secrets.hashidSecret);

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
