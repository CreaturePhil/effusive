var moment = require('moment');
var User = require('../models/User');
var Post = require('../models/Post');

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
    res.render('dashboard', {
      title: 'Home'
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

        var url = ['', req.user.username, post.getHash(), post.turl];
        res.redirect(url.join('/'));
      });
    });
  });
};
