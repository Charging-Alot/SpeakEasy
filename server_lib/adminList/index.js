var sysLog = require("sysLog");

module.exports = function AdminList(adminSize) {
  this.adminSize = adminSize || 3;
  this.length = 0;
  this.storage = {}; //stores admin socke.id and number of connections each admin currently has.

  /* 
   * Configurable player data
   *  
   * @return {object} object - Client side player configuration data object
   */
  function playerData(playerId, manId) {
    return {
      PlayerSocketId: playerId,
      adminId: manId
    };
  }

  function PendingEntry(playerSocket) {
    this.createTime = new Date().getTime();
    this.socket = playerSocket;
  }
  /* 
   * Configurable Storage entry data
   * 
   * @param {socket} socket - The Socket of the admin
   * @return {object} object - The storage entry containing the socket and a collection of players (Unique user ids)
   */
  this.newAdminEntry = function (socket) {
      var newManEntry = {
        socket: socket,
        players: [],
        pending: []
      };
      this.storage[socket.id] = newManEntry;
      this.length++;
      socket.emit("adminsetup", {
        adminId: socket.id
      });
      sysLog("New admin Created, id: " + socket.id);
    }
    /*  
     * Takes a socket and determines if it would become a new admin or the player of a admin.  Stores the socket at key `socket.id`
     * 
     * @param {object} socket - The Socket representing the would be admin or player
     * @param {string} userId - unique identifier for the user.  Only really utilized if new user becomes player and is pushed into a admin's players collection.
     * 
     */
  this.introduce = function (socket) {
      // if (socket.id in this.storage) throw new Error("SocketId already in use by other admin");
      if (!this.length) { //if nobody is currently a admin, meaning no users are connected
        this.newAdminEntry(socket); // returns {socket:socket, players:[]};
        return this;
      }
      for (var adminId in this.storage) {
        if ((this.storage[adminId].players.length + this.storage[adminId].pending.length) < this.adminSize) {
          socket.emit("playersetup", playerData(socket.id, adminId));
          this.storage[adminId].pending.push(new PendingEntry(socket));
          sysLog("New Player handed to admin " + adminId + ". Players: " + this.storage[adminId].players + ".");
          return this;
        }
      }
      this.newAdminEntry(socket);
      return this;
    }
    /* 
     * Takes a admin's socket id and a corresponding playerId and removes the player from the admin's players collection
     * 
     * @param {string} adminId - The id representing the admin's socket id
     * @param {string} playerId - unique identifier for the player
     * 
     */
  this.removePlayer = function (adminId, playerId) {
      var storage = this.storage;
      var admin = storage[adminId];
      var playerIndex = admin.players.indexOf(playerId);
      if (!adminId || !playerId) return sysLog("Proper params for removePlayer reqd, provided: " + arguments);
      if (!admin) return sysLog("This is wierd, the adminId wasn't found in the adminList" + adminId);
      if (playerIndex === -1) return sysLog("This is wierd, the playerId wasn't found in the admin's player collection" + playerId);
      admin.players.splice(playerIndex, 1);
      sysLog("Player: " + playerId + " removed from admin: " + adminId);
      return this;
    }
    /* 
     * Takes a admin's socket id and a removes it from the admin list
     *
     * @param {string} adminId - The id representing the admin's socket id
     * 
     */
  this.removeAdmin = function (adminId) {
      if (!adminId) {
        sysLog("No manger id provided in `removeadmin`");
        return this;
      }
      if (!this.storage[adminId]) {
        sysLog("This is wierd, the adminId wasn't found in the adminList");
        return this;
      }
      delete this.storage[adminId];
      this.length--;
      sysLog("Admin: " + adminId + " removed from adminList.");
      return this;
    }
    /* 
     * Called by a admin connection to toggle a connection's manConfirmed status to true;
     *
     * @param {string} playerSocketId - The id representing the player's socket id in the pending connections object.
     * 
     */
  this.playerRecieved = function (manSocket, data) {
      var pendingIdx = where(this.storage[manSocket.id].pending, function (pendingObj) {
        if (pendingObj.socket.id === data.PlayerSocketId) return true;
        return false;
      });
      if (pendingIdx !== -1) {
        this.storage[manSocket.id].players.push(data.PlayerSocketId);
        this.storage[manSocket.id].pending[pendingIdx].socket.disconnect();
        this.storage[manSocket.id].pending.splice(pendingIdx, 1);
        return manSocket.emit("playerconfirmed", data);
      }
      manSocket.emit('playereject', data);
    }
    // 
    // 
    // 
    // 


  this.clearPending = function (max) { //need to test
    var max = max || 3;
    var curTime = new Date().getTime();
    for (var admin in this.storage) {
      var pending = this.storage[admin].pending;
      for (var i = pending.length - 1; i >= 0; i--) {
        if ((curTime - pending[i].createTime) > max) {
          pending.splice(i, 0);
        }
      };
    }
  }
}

function where(arr, cb) {
  for (var i = arr.length - 1; i >= 0; i--) {
    if (cb(arr[i], i, arr)) return i;
  };
  return -1;
}
