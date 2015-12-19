// **This file was provided/inspired by the hard work of Muaz Khan's npm module "datachannel-client": "^1.0.2".
// **Thank you for your help with the RTC community muaz.
// Added to provide access for the client side file:
// <script src="/reliable-signaler/signaler.js"></script>
//Sockets are handled by socketHandler.js 

module.exports = Server;

function Server(srv, opts) {
  require('./socketHandler.js').easySignaler(srv);
}