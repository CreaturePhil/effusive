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
    req.user.following.push(req.user);

    var users = [];
    var posts = [];
    var following = req.user.following;
    var len = following.length;

    while(len--) {
      users.push(following[len].uid);
    }

    User.find({
      'uid': {
        $in: users
      }
    }, function(err, users) {
      if (err) return next(err); 

      len = users.length;

      while(len--) {
        posts = posts.concat(users[len].posts);
      }

      Post.find({
        '_id': {
          $in: posts
        }
      }, function(err, posts) {
        if (err) return next(err);
        posts.sort(function(a, b) {
          return b.date - a.date;
        });
        res.render('dashboard', {
          title: 'Home',
          posts: posts,
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
    avatar: req.user.profile.avatar || req.user.gravatar(),
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
        res.redirect('/');
      });
    });
  });
};

/**
 * Route /about
 * --------------------
 */
exports.getAbout = function(req, res, next) {
  res.render('about', {
    title: 'About'
  });
};
