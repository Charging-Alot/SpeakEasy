var User = require('./userModel.js');
var jwt = require('jwt-simple');

function RespObj(status, data) {
  this.status = status;
  this.data = data;
}



module.exports = {
  signin: function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var query = User.where({
      email: email
    });

    query.findOne(function (err, user) {
      if (err) throw (err);
      if (user.comparePasswords(password)) {
        res.status(200).send(new RespObj(true, email));
      } else {
        res.status(200).send(new RespObj(false, "Email or password was faulty."));
      }

    });

  },

  signup: function (req, res) {
    console.log("ALL THE FIZZLES", req.body)
    var pwdConf = req.body.passwordConfirmation;
    var email = req.body.email;
    var password = req.body.password;
    var query = User.where({
      email: email
    });
    if (password !== pwdConf) return res.status(400).send(new RespObj(false, "Your passwords did not match."))

    query.findOne(function (err, user) {
      if (err) throw (err);
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