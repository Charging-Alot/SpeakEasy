// require('reliable-signaler')(httpServer);

var sysLog = require('sysLog');
var AdminListCon = require('adminList');


exports.easySignaler = easySignaler;

function easySignaler(app) {

  var io = require('socket.io').listen(app, {
    log: true,
    origins: '*:*'
  });

  var AdminList = new AdminListCon();
  AdminList.seq2seq.trainCallResponse([
    [1, 1, 1],
    [0, 0, 0]
  ], [
    [1, 1, 1],
    [1, 1, 1]
  ], function () {
    console.log("HOLY SHIT IT WORKS?")
  });

  io.on('connection', function (socket) {
    var currentUser = socket;
    /*
     * Removes admin from the AdminList
     *
     * @param {string}  - The unique identifier for the new user
     */
    socket.on('ADMINREADY', function () {
      console.log("SOCKET EVENT ADMINREADY is firing")
      AdminList.checkQandDq(socket);
    });
    /*
     * Removes admin from the AdminList
     *
     * @param {string}  - The unique identifier for the new user
     */
    socket.on('disconnect', function () {
      sysLog("Socket " + socket.id + " disconnect");
      if (AdminList.storage[socket.id]) {
        AdminList.removeAdmin(socket.id); //could still fire when a player disconnects before establishing admin connection
      }
    });
    /*
     * Takes a user id and determines if the new user should either be a "admin" or a admin's child ("player").
     * If all current admins are at max capacity (Determined by the constructor's adminSize param, default is 3), it sets the new user up as a new Admin
     *
     * @param {string} userId - The unique identifier for the new user
     */
    socket.on('establish_role', function () {
      console.log("ESTABLISH ROLLE IS FIRING!@!!!!@@!@!!")
      AdminList.introduce(socket);
    });
    /*
     * Complete communication 'triangle' ensuring that admin and given player have indeed established a connection allowing for a player socket to be disconnected
     *
     * @param {string} adminSocketId - The unique identifier admins socket in the AdminList
     */
    socket.on('playerrecieved', function (data) { //having two of these might be overkill
      console.log("SOCKET EVENT playerrecieved is firing")
      AdminList.playerRecieved(socket, data)
    });
    /*
     * Signals to the mother that a player was lost and it can be removed from the pool of players of that admin 
     *
     * @param {string} player_id - The unique identifier of the player in the admin's player collection
     */
    socket.on('playerlost', function (player_id) {
      console.log("SOCKET EVENT playerlost is firing")
      AdminList.removePlayer(socket.id, player_id);
      //remove player id from admin's player list to open for new additions
    });

    socket.on('updatedModel', function (data) {
      console.log("SOCKET EVENT updatedModel is firing")
      AdminList.updatedModel(socket, data)
    });


    socket.on('setup', function (message) {
      console.log("SOCKET EVENT setup is firing")
      socket.broadcast.emit('setup', message);
    });
  });
}
