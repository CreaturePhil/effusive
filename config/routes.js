var express = require('express');
var passportConf = require('./passport');
var homeController = require('../app/controllers/home_controller');
var authController = require('../app/controllers/authentication_controller');
var userController = require('../app/controllers/user_controller');

var router = express.Router();

router.route('/')
  .get(homeController.getIndex)
  .post(passportConf.isAuthenticated, homeController.postUserPost);

router.route('/signup')
  .get(authController.getSignup)
  .post(authController.postSignup);

router.route('/login')
  .get(authController.getLogin)
  .post(authController.postLogin);

router.route('/logout')
  .get(authController.getLogout);

router.route('/forgot_password')
  .get(authController.getForgotPassword)
  .post(authController.postForgotPassword);

router.route('/reset_password/:token')
  .get(authController.getResetPassword)
  .post(authController.postResetPassword);

router.route('/settings/account')
  .get(passportConf.isAuthenticated, userController.getAccount)
  .post(passportConf.isAuthenticated, userController.postUpdateAccount);

router.route('/settings/password')
  .get(passportConf.isAuthenticated, userController.getPassword)
  .post(passportConf.isAuthenticated, userController.postUpdatePassword);

router.route('/settings/delete')
  .get(passportConf.isAuthenticated, userController.getDelete)
  .post(passportConf.isAuthenticated, userController.postDeleteAccount);

router.route('/:user')
  .get(userController.getUserProfile);

router.route('/:user/:hash/:title')
  .get(userController.getUserPost)
  .post(passportConf.isAuthenticated, userController.postComment);

router.route('/:user/:hash/:title/edit')
  .get(passportConf.isAuthenticated, userController.getEditPost)
  .post(passportConf.isAuthenticated, userController.postEditPost);

router.route('/:user/:hash/:title/:comment/edit')
  .get(passportConf.isAuthenticated, userController.getEditComment)
  .post(passportConf.isAuthenticated, userController.postEditComment);

module.exports = router;
