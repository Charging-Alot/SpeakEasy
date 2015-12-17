var chatCtrl = require('./chatCtrl.js');


module.exports = function (app) {
  // app === userRouter injected from middlware.js

  app.post('/chat', chatCtrl.receive);
  // app.post('/signup', userCtrl.signup);
  // app.get('/signedin', userCtrl.checkAuth);
};
