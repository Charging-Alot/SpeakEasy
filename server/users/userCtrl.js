var User = require('./userModel.js');
var jwt = require('jwt-simple');

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
        res.status(200).send({
          success: true,
          data: email
        });
      } else {
        res.status(200).send({
          success: false,
          data: "Email or password was faulty."
        });
      }

    });

  },

  signup: function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var create;
    var newUser;

    var query = User.where({
      email: email
    });
    quey.findOne(function (err, user) {
      if (err) throw (err);
      if (user) {
        res.status(400).send({
          success: false,
          data: "User email already in use."
        })
      } else {
        User.create({
          email: email,
          password: password
        }, function (err, user) {
          if (err) throw (err);
          res.status(200).send({
            success: true,
            data: {
              email: email
            }
          })
        });
      }
    });
    // check to see if user already exists
  }
};