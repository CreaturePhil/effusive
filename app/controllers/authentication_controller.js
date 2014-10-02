var _ = require('lodash');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var passport = require('passport');
var moment = require('moment');
var User = require('../models/User');
var secrets = require('../../config/secrets');

/**
 * Route /signup
 * --------------------
 */

// Signup page.
exports.getSignup = function(req, res) {
  if (req.user) return res.redirect('/');
  res.render('authentication/signup', {
    title: 'Create Account'
  });
};

// Create a new local account.
exports.postSignup = function(req, res, next) {
  req.assert('username', 'Only letters and numbers are allow in username.').regexMatch(/^[A-Za-z0-9]*$/);
  req.assert('username', 'Username cannot be more than 30 characters.').len(1, 30);
  req.assert('email', 'Email is not valid.').isEmail();
  req.assert('password', 'Password must be between 4 to 300 characters long.').len(4, 300);
  req.assert('confirmPassword', 'Passwords do not match.').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/signup');
  }

  var user = new User({
    uid: req.body.username.toLowerCase(),
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    joinDate: moment()
  });

  if (secrets.banUsernames.indexOf(user.uid) >= 0) {
    req.flash('errors', { msg: 'Your username cannot be called that.' })
    return res.redirect('signup');
  }

  User.findOne({ email: req.body.email }, function(err, existingUser) {
    if (existingUser) {
      req.flash('errors', { msg: 'Account with that email address already exists.' });
      return res.redirect('/signup');
    }
    User.findOne({ uid: req.body.username.toLowerCase() }, function(err, existingUser) {
      if (existingUser) {
        req.flash('errors', { msg: 'Account with that username already exists.' });
        return res.redirect('/signup');
      }
      user.save(function(err) {
        if (err) return next(err);
        req.logIn(user, function(err) {
          if (err) return next(err);
          res.redirect('/');
        });
      });
    });
  });
};

/**
 * Route /login
 * --------------------
 */

// Login page.
exports.getLogin = function(req, res) {
  if (req.user) return res.redirect('/');
  res.render('authentication/login', {
    title: 'Login'
  });
};

// Sign in using email and password.
exports.postLogin = function(req, res, next) {
  req.assert('username', 'Only letters and numbers are allow in username.').regexMatch(/^[A-Za-z0-9]*$/);
  req.assert('username', 'Username cannot be more than 30 characters.').len(1, 30);
  req.assert('password', 'Password cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  passport.authenticate('local', function(err, user, info) {
    if (err) return next(err);
    if (!user) {
      req.flash('errors', { msg: info.message });
      return res.redirect('/login');
    }
    req.logIn(user, function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Success! You are logged in.' });
      res.redirect(req.session.returnTo || '/');
    });
  })(req, res, next);
};

/**
 * Route /logout
 * --------------------
 */

// Log the user out.
exports.getLogout = function(req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * Route /forgot_password
 * --------------------
 */

// Forgot password page.
exports.getForgotPassword = function(req, res) {
  if (req.isAuthenticated()) return res.redirect('/');
  res.render('authentication/forgot_password', {
    title: 'Forgot Password'
  });
};

// Create a random token, then the send user an email with a reset link.
exports.postForgotPassword = function(req, res, next) {
  req.assert('email', 'Please enter a valid email address.').isEmail();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  async.waterfall([
    function(done) {
      crypto.randomBytes(16, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {
        if (!user) {
          req.flash('errors', { msg: 'No account with that email address exists.' });
          return res.redirect('/forgot_password');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: secrets.sendgrid.user,
          pass: secrets.sendgrid.password
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'markus@markus.com',
        subject: 'Reset your password on Markus',
        text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset_password/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        req.flash('info', { msg: 'An e-mail has been sent to ' + user.email + ' with further instructions.' });
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot_password');
  });
};

/**
 * Route /reset_password
 * --------------------
 */

// Get reset password page.
exports.getResetPassword = function(req, res) {
  if (req.isAuthenticated()) return res.redirect('/');
  User
    .findOne({ resetPasswordToken: req.params.token })
    .where('resetPasswordExpires').gt(Date.now())
    .exec(function(err, user) {
      if (!user) {
        req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
        return res.redirect('/forgot');
      }
      res.render('authentication/reset_password', {
        title: 'Password Reset'
      });
    });
};

// Process the reset password request.
exports.postResetPassword = function(req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirmPassword', 'Passwords must match.').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  async.waterfall([
    function(done) {
      User
        .findOne({ resetPasswordToken: req.params.token })
        .where('resetPasswordExpires').gt(Date.now())
        .exec(function(err, user) {
          if (!user) {
            req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
            return res.redirect('back');
          }

          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function(err) {
            if (err) return next(err);
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        });
    },
    function(user, done) {
      var transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: secrets.sendgrid.user,
          pass: secrets.sendgrid.password
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'markus@markus.com',
        subject: 'Your Markus password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        req.flash('success', { msg: 'Success! Your password has been changed.' });
        done(err);
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
};
