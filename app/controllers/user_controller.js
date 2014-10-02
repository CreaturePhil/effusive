var User = require('../models/User');

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
 * Route /*
 * --------------------
 */

// Get user profile
exports.getUserProfile = function(req, res, next) {
  User.findOne({ uid: req.params.user.toLowerCase() }, function(err, user) {
    if (user) {
      res.render('user/profile', {
        title: user.username,
        User: user
      });
    } else {
      var err = new Error('Page Not Found');
      err.status = 404;
      return next(err);
    }
  }); 
};
