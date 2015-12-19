// require('reliable-signaler')(httpServer);
exports.ReliableSignaler = ReliableSignaler;


var ManagerList = require('../customModules/managerList.js');



function ReliableSignaler(app, socketCallback) {

  var io = require('socket.io').listen(app, {
  log: true,
  origins: '*:*'
  });

  var ManagerList = new ManagerList();

  io.on('connection', function(socket) {
  var currentUser = socket;
  /*
   * Takes a user id and determines if the new user should either be a "Manager" or a manager's child ("Pleb").
   * If all current managers are at max capacity (Determined by the constructor's ManagerSize param, default is 3), it sets the new user up as a new Manager
   *
   * @param {string} userId - The unique identifier for the new user
   */
  socket.on('establish_role', function(userId) {
    ManagerList.introduce(socket,userId);
  });
  /*
   * Signals to the server that its appropriate to disconnect the socket for a given pleb after having connected with manager - Still requires the manager to emit a 'pleb_connection_established' event
   *
   * @param {string} managerSocketId - The unique identifier managers socket in the ManagerList
   */
  socket.on('manager_connection_established', function(managerSocketId) {
    //first step to disconnecting a plebs socket, still requires a manager's pleb connection est event to fully complete disconnect process.
  });
  /*
   * Complete communication 'triangle' ensuring that manager and given pleb have indeed established a connection allowing for a pleb socket to be disconnected
   *
   * @param {string} managerSocketId - The unique identifier managers socket in the ManagerList
   */
  socket.on('pleb_connection_established', function(plebUniqueId) {
    //tell socket to disconnect.
  });
  /*
   * Signals to the that a pleb was lost and it can be removed from the pool of plebs of that manager 
   *
   * @param {string} pleb_id - The unique identifier of the pleb in the manager's pleb collection
   */
  socket.on('pleb_lost', function(pleb_id) {
    ManagerList.removePleb(socket.id,pleb_id);
    //remove pleb id from manager's pleb list to open for new additions
  });



  socket.on('keep-in-server', function(roomid, callback) {
    listOfRooms[roomid] = roomid;
    currentUser.roomid = roomid;
    if(callback) callback();
  });

  socket.on('get-session-info', function(roomid, callback) {
    if (!!listOfRooms[roomid]) {
    callback(listOfRooms[roomid]);
    return;
    }

    (function recursive() { //this is lol worthy.
    if (currentUser && listOfRooms[roomid]) {
      callback(listOfRooms[roomid]);
      return
    }
    setTimeout(recursive, 1000);
    })();
  });

  socket.on('message', function(message) {
    socket.broadcast.emit('message', message);
  });

  socket.on('disconnect', function() {


    // if (!currentUser) return;

    // // autoCloseEntireSession = true;
    // if (currentUser && currentUser.roomid && listOfRooms[currentUser.roomid]) {
    //   delete listOfRooms[currentUser.roomid];
    // }

    // currentUser = null;
  });
  
  if(socketCallback) {
    socketCallback(socket);
  }
  });
}
