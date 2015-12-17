var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var config = {
  saltFactor: 10
}

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },
  salt: String
});

UserSchema.methods.comparePasswords = function (pwd) {
  bcrypt.compare(pwd, this.password, function (err, isMatch) {
    if (err) {
      throw (err);
    } else {
      return (isMatch);
    }
  });
};

UserSchema.pre('save', function (next) {
  var user = this;
  var salt = bcrypt.genSaltSync(config.saltFactor);
  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return next();
  }
  // generate a salt
  // hash the password along with our new salt
  bcrypt.hash(user.password, salt, function (err, hash) {
    if (err) return next(err);
    // override the cleartext password with the hashed one
    user.password = hash;
    next();
  });
});

module.exports = mongoose.model('users', UserSchema);