// **This file was provided/inspired by the hard work of Muaz Khan's npm module "datachannel-client": "^1.0.2".
// **Thank you for your help with the RTC community muaz.

module.exports = Server;

function Server(srv, opts) {
	require('./socketHandler.js').easySignaler(srv);
}
