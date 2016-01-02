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

UserSchema.methods.comparePasswords = function (pwd, callback) {
  bcrypt.compare(pwd, this.password, function (err, isMatch) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, isMatch);
    }
  });
};

UserSchema.pre('save', function (next) {
  var user = this;
  var salt = bcrypt.genSaltSync(config.saltFactor);
  if (!this.isModified('password')) {
    return next();
  }
  bcrypt.hash(this.password, salt, function (err, hash) {
    if (err) return next(err);
    user.password = hash;
    next();
  });
});

module.exports = mongoose.model('users', UserSchema);
