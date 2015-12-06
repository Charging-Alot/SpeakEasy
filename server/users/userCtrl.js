var User = require('./userModel.js');
    Q = require('q');
    jwt = require('jwt-simple');

module.exports = {
  signin: function (req, res, next) {
    console.log('serverside login')
    var email = req.body.email;
    var password = req.body.password;

    var findUser = Q.nbind(User.findOne, User);
    findUser({email: email})
      .then(function (user) {
        if (!user) {
          next(new Error('User does not exist'));
        } else {
          return user.comparePasswords(password)
            .then(function (foundUser) {
              if (foundUser) {
                var token = jwt.encode(user, 'secret');
                res.json({token: token});
              } else {
                return next(new Error('No user'));
              }
            });
        }
      })
      .fail(function (error) {
        next(error);
      });
  },

  signup: function (req, res, next) {
    console.log('serverside signup')
    var email = req.body.email;
    var password = req.body.password;
    var create;
    var newUser;

    var findOne = Q.nbind(User.findOne, User);
    // check to see if user already exists
    findOne({email: email})
      .then(function (user) {
        if (user) {
          next(new Error('User already exists!'));
        } else {
          // make a new user if not one
          // create = Q.nbind(User.create, User);
          newUser = {
            email: email,
            password: password
          };
          // IT GETS THIS FAR, BUT THEN CAN'T CREATE THE USER
          // console.log('creating user', create(newUser))
          newDBUser = new User(newUser);
          console.log("ABOUT TO SAVE THE USER",newDBUser)
          newDBUser.save(function(err,DBresp) {
            if(err) return console.log("THERE WAS AN ERROR IN CREATE USER",err);
            console.log("SUCESS IN SAVE YER",DBresp)
            return DBresp;
          })
          // return create(newUser); 
        }
      })
      .then(function (user) {
        // create token to send back for auth
        var token = jwt.encode('THIS IS THE PAYLOAD', 'secret');
        res.json({token: token});
      })
      .fail(function (error) {
        next(error);
      });
  },

  checkAuth: function (req, res, next) {
    // checking to see if the user is authenticated
    // grab the token in the header is any
    // then decode the token, which we end up being the user object
    // check to see if that user exists in the database
    var token = req.headers['x-access-token'];
    if (!token) {
      next(new Error('No token'));
    } else {
      var user = jwt.decode(token, 'secret');
      var findUser = Q.nbind(User.findOne, User);
      findUser({email: user.email})
        .then(function (foundUser) {
          if (foundUser) {
            res.send(200);
          } else {
            res.send(401);
          }
        })
        .fail(function (error) {
          next(error);
        });
    }
  }
};
