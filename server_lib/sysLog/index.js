var fs = require('fs');

function systemLog(msg) {
	var systemLogMsg = Array.prototype.slice.call(arguments) + '\r\n';
	fs.appendFile('syslog.txt', systemLogMsg, function (err) {
		if (err) throw err;
	});
}

module.exports = systemLog;