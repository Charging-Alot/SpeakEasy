var userCtrl = require('./userCtrl.js');


module.exports = function (app) {
  // app === userRouter injected from middlware.js

  app.post('/signin', userCtrl.signin);
  app.post('/signup', userCtrl.signup);
  app.get('/signedin', userCtrl.checkAuth);
};
