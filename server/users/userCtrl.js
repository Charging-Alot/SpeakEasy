var User = require('./userModel.js');
var jwt = require('jwt-simple');

function RespObj(status, data) {
  this.status = status;
  this.message = data;
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
      console.log('findingerror!', err, user)
      if (err || !user) {
        console.log('throwing signin error!!')
        res.status(200).send(new RespObj(false, "User was not found, please signup below!"));
        //throw (err);
      } else {
        if (user.comparePasswords(password)) {
          res.status(200).send(new RespObj(true, email));
        } else {
          res.status(200).send(new RespObj(false, "Sorry, that password was incorrect."));
        }
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
        console.log("ERROR IN CREATE USER", err);
        return res.status(400).send(new RespObj(false, "There was an issue handling your request."))
      }
      if (user) {
        res.status(400).send(new RespObj(false, "User email already in use."))
      } else {

        User.create({
          email: email,
          password: password
        }, function (err, user) {
          if (err) throw (err);
          res.status(200).send(new RespObj(true, email));
        });
      }
    });
  }
};
