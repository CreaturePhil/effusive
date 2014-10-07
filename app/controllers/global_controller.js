var User = require('../models/User');
var Post = require('../models/Post');

/**
 * Route /browse
 * --------------------
 */

// Get browse page.
exports.getBrowse = function(req, res) {
  Post.find({}, function(err, posts) {
    if (err) return next(err);
    posts.sort(function(a, b) {
      return b.date - a.date;
    });
    res.render('browse', {
      title: 'Browse',
      posts: posts
    });
  });
};

/**
 * Route /community
 * --------------------
 */

// Get community page.
exports.getCommunity = function(req, res) {
  User.find({}, function(err, users) {
    if (err) return next(err);
    users.sort(function(a, b) {
      return b.joinDate - a.joinDate;
    });
    res.render('community', {
      title: 'Community',
      users: users
    });
  });
};
