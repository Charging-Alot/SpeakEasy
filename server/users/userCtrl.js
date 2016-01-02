var User = require('./userModel.js');
var jwt = require('jwt-simple');
var helper = require('../config/helpers.js');
var sysLog = require('sysLog');

function RespObj(status, data, token) {
  this.status = status;
  this.message = data;
  this.token = token;
}

module.exports = {
  signin: function (req, res) {
    if (!req.body.email || !req.body.password) {
      return res.status(404).send(new RespObj(false, "No email and/or password."))
    }
    var email = req.body.email;
    var password = req.body.password;
    var query = User.where({
      email: email
    });
    query.findOne(function (err, user) {
      if (err || !user) {
        res.status(200).send(new RespObj(false, "User was not found, please signup below!"));
        //throw (err);
      } else {
        //console.log('pw compare', user.comparePasswords(password))
        user.comparePasswords(password, function (err, success) {
          if (err) {
            res.status(404).send(new RespObj(false, "That was an error handling your request."));
          } else if (!success) {
            res.status(404).send(new RespObj(false, "Sorry, that password was incorrect."));
          } else {
            var token = helper.encode(user);
            var response = new RespObj(true, email, token);
            res.status(200).send(response);
          }
        });
      }

    });

  },

  signup: function (req, res) {
    var pwdConf = req.body.passwordConfirmation;
    var email = req.body.email;
    var password = req.body.password;
    var query = User.where({
      email: email
    });
    if (password !== pwdConf) return res.status(400).send(new RespObj(false, "Your passwords did not match."))

    query.findOne(function (err, user) {
      if (err) {
        sysLog(err);
        return res.status(400).send(new RespObj(false, "There was an issue handling your request."))
      }
      if (user) {
        res.status(400).send(new RespObj(false, "User email already in use."))
      } else {

        User.create({
          email: email,
          password: password
        }, function (err, user) {
          sysLog(err);
          var token = helper.encode(user);
          var response = new RespObj(true, email, token);
          res.status(200).send(response);
          //res.status(200).send(new RespObj(true, email));
        });
      }
    });
  }
};
