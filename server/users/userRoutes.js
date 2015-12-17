var userCtrl = require('./userCtrl.js');

module.exports = function (app) {
	app.post('/signin', userCtrl.signin);
	app.post('/signup', userCtrl.signup);
};