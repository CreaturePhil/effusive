var moment = require('moment');
var crypto = require('crypto');
var User = require('../models/User');
var Post = require('../models/Post');
var secrets = require('../../config/secrets');
var Hashids = require('hashids');
var hashids = new Hashids(secrets.hashidSecret);

/**
 * Route /settings/account
 * --------------------
 */

// Account settings page.
exports.getAccount = function(req, res) {
  res.render('user/settings', {
    title: 'Account',
    description: 'Change your basic account settings.'
  });
};

// Update user's account information. 
exports.postUpdateAccount = function(req, res, next) {
  req.body.avatar && req.assert('avatar', 'Must be .png, .jpg, or .gif').regexMatch(/(https?:\/\/.*\.(?:png|jpg|gif))/i);
  req.assert('username', 'Only letters and numbers are allow in username.').regexMatch(/^[A-Za-z0-9]*$/);
  req.assert('username', 'Username cannot be more than 30 characters.').len(1, 30);
  req.body.website && req.assert('website', 'Invalid website url.').regexMatch(/https?:\/\/.{1,}\..{1,}/);
  req.assert('email', 'Email is not valid.').isEmail();
  req.assert('bio', 'Bio must be less than or equal to 160 characters.').len(0, 160);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/settings/account');
  }

  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);
    user.profile.avatar = req.body.avatar || '';
    user.uid = req.body.username.toLowerCase(); 
    user.username = req.body.username;
    user.email = req.body.email;
    user.profile.location = req.body.location || '';
    user.profile.website = req.body.website || '';
    user.profile.bio = req.body.bio || '';

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Profile information updated.' });
      res.redirect('/settings/account');
    });
  });
};

/**
 * Route /settings/password
 * --------------------
 */

// Get change password page.
exports.getPassword = function(req, res) {
  res.render('user/settings', {
    title: 'Password',
    description: 'Change your password.'
  });
};

// Update user's current password
exports.postUpdatePassword = function(req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user.password = req.body.password;

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Password has been changed.' });
      res.redirect('/settings/password');
    });
  });
};

/**
 * Route /settings/delete
 * --------------------
 */

// Delete user account confirmation page.
exports.getDelete = function(req, res, next) {
  res.render('user/delete_account', {
    title: 'Delete'
  }); 
};

// Delete user's account.
exports.postDeleteAccount = function(req, res, next) {
  User.remove({ _id: req.user.id }, function(err) {
    if (err) return next(err);
    req.logout();
    req.flash('info', { msg: 'Your account has been deleted.' });
    res.redirect('/');
  });
};

/**
 * Route /:user
 * --------------------
 */

// Get user profile
exports.getUserProfile = function(req, res, next) {
  User.findOne({ uid: req.params.user.toLowerCase() }, function(err, user) {
    if (err || !user) return next(err);

    function findFollows(follower, following) {
      var followings = follower.following;
      var len = followings.length;
      while(len--) {
        if (followings[len].uid === following.uid) {
          return true;
        }
      }
      return false;
    }

    Post.find({
      '_id': { 
        $in: user.posts
      }
    }, function(err, posts) {
      if (err) return next(err);
      res.render('user/profile', {
        title: user.username,
        User: user,
        findFollows: findFollows,
        posts: posts
      });
    });
  }); 
};

// Post follow user
exports.postFollowUser = function(req, res, next) {
  if (req.params.user.toLowerCase() === req.user.uid) res.redirect('/' + req.params.user);
  User.findOne({ uid: req.params.user.toLowerCase() }, function(err, followUser) {
    if (err || !followUser) return next(err);
    User.findById(req.user.id, function(err, follower) {
      if (err) return next(err);
      followUser.followers.push({
        avatar: req.user.profile.avatar || req.user.gravatar(),
        uid: req.user.uid,
        username: req.user.username
      });
      follower.following.push({
        avatar: followUser.profile.avatar || followUser.gravatar(),
        uid: followUser.uid,
        username: followUser.username
      });
      followUser.save(function(err) {
        if (err) next(err);
        follower.save(function(err) {
          if (err) next(err);
          res.redirect('/' + req.params.user);
        });
      });
    });
  }); 
};

/**
 * Route /:user/unfollow
 * --------------------
 */

// Post unfollow user
exports.postUnfollowUser = function(req, res, next) {
  if (req.params.user.toLowerCase() === req.user.uid) res.redirect('/' + req.params.user);
  User.findOne({ uid: req.params.user.toLowerCase() }, function(err, followUser) {
    if (err || !followUser) return next(err);
    User.findById(req.user.id, function(err, follower) {
      if (err) return next(err);
      followUser.followers.splice(followUser.followers.indexOf({
        avatar: req.user.profile.avatar || req.user.gravatar(),
        uid: req.user.uid,
        username: req.user.username
      }), 1);
      follower.following.splice(follower.following.indexOf({
        avatar: followUser.profile.avatar || followUser.gravatar(),
        uid: followUser.uid,
        username: followUser.username
      }), 1);
      followUser.save(function(err) {
        if (err) next(err);
        follower.save(function(err) {
          if (err) next(err);
          res.redirect('/' + req.params.user);
        });
      });
    });
  }); 
};

/**
 * Route /:user/:hash/:title
 * --------------------
 */

// Get user's post
exports.getUserPost = function(req, res, next) {
  Post.findById(hashids.decodeHex(req.params.hash), function(err, post) {
    if (err) return next(err);
    User.findOne({ username: post.author }, function(err, user) {
      if (err) return next(err);
      res.render('user/post', {
        title: post.title,
        post: post,
        User: user
      });
    });
  });
};

// Post user's comment
exports.postComment = function(req, res, next) {
  Post.findById(hashids.decodeHex(req.params.hash), function(err, post) {
    if (err) return next(err);
    User.findById(req.user.id, function(err, user) {
      crypto.randomBytes(6, function(err, buf) {
        var token = buf.toString('hex');
        var comment = {
          cid: token,
          avatar: user.profile.avatar || user.gravatar(),
          aid: user.uid,
          author: user.username,
          date: moment()._d,
          content: req.body.comment 
        };
        post.comments.push(comment);
        post.save(function(err) {
          if (err) return next(err);
          var url = ['', post.author, post.getHash(), post.turl];
          res.redirect(url.join('/'));
        });
      });
    });
  });
};

/**
 * Route /:user/:hash/:title/edit
 * --------------------
 */

// Get user's post to edit
exports.getEditPost = function(req, res, next) {
  if (req.user.uid !== req.params.user.toLowerCase()) {
    var url = ['', req.params.user, req.params.hash, req.params.title];
    return res.redirect(url.join('/'));
  }
  Post.findById(hashids.decodeHex(req.params.hash), function(err, post) {
    if (err) return next(err);
    res.render('user/editPost', {
      title: post.title,
      post: post
    });
  });
};

// Save changes on edited post
exports.postEditPost = function(req, res, next) {
  if (req.user.uid !== req.params.user.toLowerCase()) {
    var url = ['', req.params.user, req.params.hash, req.params.title];
    return res.redirect(url.join('/'));
  }
  Post.findById(hashids.decodeHex(req.params.hash), function(err, post) {
    if (err) return next(err);

    post.turl = req.body.title.replace(/[^a-z0-9 ]/gi, '').replace(/ /gi, '-');
    post.title = req.body.title;
    post.body = req.body.content;
    post.editDate = moment();

    post.save(function(err, post) {
      if (err) return next(err); 
      req.flash('success', { msg: 'Post succesfully edited.' });
      var url = ['', post.author, post.getHash(), post.turl];
      res.redirect(url.join('/'));
    });
  });
};

/**
 * Route /:user/:hash/:title/:comment/edit
 * --------------------
 */

// Get user's comment to edit
exports.getEditComment = function(req, res, next) {
  Post.findById(hashids.decodeHex(req.params.hash), function(err, post) {
    if (err) return next(err);

    var comments = post.comments;
    var len = post.comments.length;

    while(len--) {
      if (req.params.comment === comments[len].cid) {
        var comment = comments[len];
        if (req.user.uid !== comment.aid) {
          var url = ['', req.params.user, req.params.hash, req.params.title];
          return res.redirect(url.join('/'));
        }
        res.render('user/editComment', {
          title: post.title,
          comment: comment
        });
      }
    }
  });
};

// Save changes on edited comment
exports.postEditComment = function(req, res, next) {
  Post.findById(hashids.decodeHex(req.params.hash), function(err, post) {
    if (err) return next(err);

    var comments = post.comments;
    var len = post.comments.length;

    while(len--) {
      if (req.params.comment === comments[len].cid) {
        var comment = comments[len];
        if (req.user.uid !== comment.aid) {
          var url = ['', req.params.user, req.params.hash, req.params.title];
          return res.redirect(url.join('/'));
        }
        comment.content = req.body.content;  
        comment.editDate = moment()._d;
        
        post.comments.splice(len, 1, comment);

        post.save(function(err) {
          if (err) return next(err);
          req.flash('success', { msg: 'Comment succesfully edited.' });
          var url = ['', post.author, post.getHash(), post.turl];
          res.redirect(url.join('/'));
        });
      }
    }
  });
};
