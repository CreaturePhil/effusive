var moment = require('moment');
var User = require('../models/User');
var Post = require('../models/Post');
var secrets = require('../../config/secrets');
var Hashids = require('hashids');
var hashids = new Hashids(secrets.hashidSecret);

/**
 * Route /
 * --------------------
 */

// Home or index page.
exports.getIndex = function(req, res) {
  if (!req.isAuthenticated()) {
    res.render('index', {
      title: 'Home'
    });
  } else {
    User.findById(req.user.id, function(err, user) {
      if (err) return next(err);
      Post.find({
        '_id': { 
          $in: user.posts
        }
      }, function(err, posts) {
        if (err) return next(err);
        res.render('dashboard', {
          title: 'Home',
          posts: posts
        });
      });
    });
  }
};

// Post a user's post
exports.postUserPost = function(req, res, next) {
  var post = new Post({
    turl: req.body.title.replace(/[^a-z0-9 ]/gi, '').replace(/ /gi, '-'),
    title: req.body.title,
    author: req.user.username,
    date: moment(),
    body: req.body.content
  });

  post.save(function(err, post) {
    if (err) return next(err);
    User.findById(req.user.id, function(err, user) {
      if (err) return next(err);
      user.posts.push(post.id);
      user.save(function(err) {
        if (err) return next(err);
        req.flash('success', { msg: 'Post sucessfully posted!' });

//        var url = ['', req.user.username, post.getHash(), post.turl];
//        res.redirect(url.join('/'));
        res.redirect('/');
      });
    });
  });
};
