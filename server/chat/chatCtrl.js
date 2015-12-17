jwt = require('jwt-simple'); // but it's possible authorization might happen in here

module.exports = {
	receive: function (req, res, next) {
		var message = req.body.text;
		console.log('chatCtrl received that!', message);

		res.send('hi!');

	}
}