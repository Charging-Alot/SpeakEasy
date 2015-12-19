// require('reliable-signaler')(httpServer);

var sysLog = require('sysLog');
var ManagerListCon = require("managerList");

exports.easySignaler = easySignaler;

function easySignaler(app) {

  var io = require('socket.io').listen(app, {
    log: true,
    origins: '*:*'
  });

  var ManagerList = new ManagerListCon();

  io.on('connection', function (socket) {
    var currentUser = socket;
    /*
     * Removes manager from the ManagerList
     *
     * @param {string}  - The unique identifier for the new user
     */
    socket.on('disconnect', function () {
      sysLog("Socket " + socket.id + " disconnect");
      if (ManagerList.storage[socket.id]) {
        ManagerList.removeManager(socket.id); //could still fire when a pleb disconnects before establishing manager connection
      }
    });
    /*
     * Takes a user id and determines if the new user should either be a "Manager" or a manager's child ("Pleb").
     * If all current managers are at max capacity (Determined by the constructor's ManagerSize param, default is 3), it sets the new user up as a new Manager
     *
     * @param {string} userId - The unique identifier for the new user
     */
    socket.on('establish_role', function () {
      ManagerList.introduce(socket);
    });
    /*
     * Complete communication 'triangle' ensuring that manager and given pleb have indeed established a connection allowing for a pleb socket to be disconnected
     *
     * @param {string} managerSocketId - The unique identifier managers socket in the ManagerList
     */
    socket.on('plebrecieved', function (plebSocketId) { //having two of these might be overkill
      ManagerList.plebRecieved(socket, plebSocketId)
    });
    /*
     * Signals to the mother that a pleb was lost and it can be removed from the pool of plebs of that manager 
     *
     * @param {string} pleb_id - The unique identifier of the pleb in the manager's pleb collection
     */
    socket.on('pleblost', function (pleb_id) {
      ManagerList.removePleb(socket.id, pleb_id);
      //remove pleb id from manager's pleb list to open for new additions
    });

    socket.on('message', function (message) {
      socket.broadcast.emit('message', message);
    });
  });
}