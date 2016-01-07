  /* 
   * Initial configuration/constructor.  Here more for future design purposes. The init method does more of the job a constructor.
   * 
   * @param {object} DataChannel - Intended for Muaz Khans DataChannel.js WebRTC wrapper library. SpeakEasy uses a slightly modified one with addition ICE servers and some additional PeerConnection event listeners.
   * @param {object} CallbacksObj - Configuration object for Admin/Player callbacks
   * @return {object} SpeakEasyObject - SpeakEasy object containing all the SpeakEasy functionality that sits on top of DataChanneljs - Still requires init to be fired.
   */
  function SpeakEasyBuild(DataChannel, callbacksObj) {
    // if (!callbacksObj || (typeof callbacksObj !== 'object')) throw Error("Callbacks configuration object needed and non provided")
    this.callbacks = callbacksObj;
    this.LocalDataChannelContstructor = DataChannel;
    this.socket = null;
    this.AdminInfo = null;
    this.PlayerInfo = null;
  };
  /* 
   * Resets the state of a given SpeakEasy object.  Used when connections is lost and the user's state needs to reset and placed back in the network.
   *  
   */
  SpeakEasyBuild.prototype.resetState = function () {
    this.LocalDataChannel = null;
    this.socket = null;
    this.AdminInfo = null;
    this.PlayerInfo = null;
  };
  /* 
   * The Init Method for the SpeakEasy object.  Currently setup to use a Socket.io signaling server to establish WebRTC connections with incoming users.
   * 
   * @param {object} socket - The Socket of the admin
   * @return {object} object - The storage entry containing the socket and a collection of players (Unique user ids)
   */
  SpeakEasyBuild.prototype.init = function (signalerSetup, socketEndPoint) {
    if (typeof signalerSetup !== "function") throw Error("SignalerSetup needs to be a function")
    this.signaler = signalerSetup;
    this.socketEndPoint = socketEndPoint;
    this.LocalDataChannel = new this.LocalDataChannelContstructor();
    this.LocalDataChannel.onmessage = this.onMessageInject.bind(this);
    this.LocalDataChannel.onopen = this.onOpenInject.bind(this);
    this.LocalDataChannel.onclose = this.onclose.bind(this);
    signalerSetup(this, socketEndPoint || '/');
  };
  /* 
   * Configurable Storage entry data
   * 
   * @param {object} socket - The Socket of the admin
   * @return {object} object - The storage entry containing the socket and a collection of players (Unique user ids)
   */
  SpeakEasyBuild.prototype.onOpenInject = function () {
    if (this.PlayerInfo) {
      console.log("Player connection event to admin fired");
      this.LocalDataChannel.send({ //send message to admin to complete initial handshake
        isPlayer_initiation: true,
        PlayerSocketId: this.PlayerInfo.PlayerSocketId
      })
    }
    /* 
     * Configurable Storage entry data
     * 
     * @param {object} socket - The Socket of the admin
     * @return {object} object - The storage entry containing the socket and a collection of players (Unique user ids)
     */
  };
  SpeakEasyBuild.prototype.onMessageInject = function (data, rtcId) {
    if (this.AdminInfo && data.isPlayer_initiation) { //check to see if is player connection intiation
      return this.initiatePlayer(data, rtcId)
    }
    if (this.AdminInfo) { //if player response to instruction
      console.log("PLAYER RESPONSE MESSAGE: ", data, rtcId);
      this.AdminInfo.controller.input(data);
      if (this.AdminInfo.commandQueue.length) {
        var newMsg = this.AdminInfo.commandQueue.dequeue();
        return this.AdminInfo.message(rtcId, newMsg);
      }
      this.AdminInfo.players[rtcId].busy = false;
      return
    } else if (this.PlayerInfo) {
      this.PlayerInfo.controller.input(data);
      return console.log("PLAYER RECIEVED MEASSAGE: ", data, rtcId);
    }
    console.error("Somehow user received message without having established a role.");
  };
  /* 
   * Configurable Storage entry data
   * 
   * @param {object} socket - The Socket of the admin
   * @return {object} object - The storage entry containing the socket and a collection of players (Unique user ids)
   */
  SpeakEasyBuild.prototype.ejectPlayer = function (data) {
    console.log("Player Eject called for:", data)
    this.LocalDataChannel.channels[data].channel.peer.close()
  };
  /* 
   * Configurable Storage entry data
   * 
   * @param {object} socket - The Socket of the admin
   * @return {object} object - The storage entry containing the socket and a collection of players (Unique user ids)
   */
  SpeakEasyBuild.prototype.onclose = function (event) {
    var playerRtcId = event.target.SpkEzId;
    if (this.AdminInfo) {
      if (!playerRtcId) { //if not player rtcId, means the player lost connection without being 'ejected' - WILL RESULT IN CLOSE EVENT FIRING 2x. Once for disconnect, another to eject him.
        var channels = this.LocalDataChannel.channels;
        for (var channel in channels) {
          if (channels[channel].channel.peer.iceConnectionState) {
            console.log("Player lost connection, removing from room")
            return this.ejectPlayer(channel);
          }
        }
      } else { //means the player was ejected and we have have his rtcId
        var players = this.AdminInfo.players;
        for (var player in players) {
          if (player == playerRtcId) { //the one time its ok to use `==` (string == number)
            this.socket.emit('playerlost', players[player].PlayerSocketId);
            delete this.AdminInfo.players[player];
            return console.log("Player removed from admin's local player collection")
          }
        }
      }
    } else { //Not ideal.  But this is reliable
      console.log("It would appear that the admin left/lost connection/ejected user - Re-establishing connection and role...")
      this.LocalDataChannel = null; //shouldnt have to do this but it works.  On close was firing 2x.
      this.resetState();
      return this.init(this.signaler, this.socketEndPoint);
    }
  };
  /* 
   * Configurable Storage entry data
   * 
   * @param {object} socket - The Socket of the admin
   * @return {object} object - The storage entry containing the socket and a collection of players (Unique user ids)
   */
  SpeakEasyBuild.prototype.initiatePlayer = function (data, rtcId) {
    console.log("Player " + rtcId + " initialized...")
    this.socket.emit("playerrecieved", {
      playerRtc: rtcId,
      PlayerSocketId: data.PlayerSocketId
    });
  };
  /* 
   * Configurable Storage entry data
   * 
   * @param {object} socket - The Socket of the admin
   * @return {object} object - The storage entry containing the socket and a collection of players (Unique user ids)
   */
  SpeakEasyBuild.prototype.confirmPlayer = function (data) {
    console.log("Player confirmed", data);
    this.AdminInfo.players[data.playerRtc] = new PlayerInfo(data);
    this.AdminInfo.checkQdQ(data.playerRtc);
  };
  /* 
   * Configurable Storage entry data
   * 
   * @param {object} socket - The Socket of the admin
   * @return {object} object - The storage entry containing the socket and a collection of players (Unique user ids)
   */
  SpeakEasyBuild.prototype.adminSetup = function (data) {
    console.log("Role established: Admin", data);
    this.AdminInfo = new AdminInfo(data, this);
    this.LocalDataChannel.userid = this.AdminInfo.adminId;
    this.LocalDataChannel.transmitRoomOnce = true;
    this.LocalDataChannel.open(this.AdminInfo.adminId);
    this.socket.emit("ADMINREADY");

  };
  /* 
   * Configurable Storage entry data
   * 
   * @param {object} socket - The Socket of the admin
   * @return {object} object - The storage entry containing the socket and a collection of players (Unique user ids)
   */
  SpeakEasyBuild.prototype.playerSetup = function (data) {
    console.log("Role established: Player", data);
    this.PlayerInfo = new PlayerInfo(data, this);
    this.LocalDataChannel.connect(data.adminId);
    this.LocalDataChannel.join({
      id: data.adminId,
      owner: data.adminId
    });
  };
  /* 
   * Configurable Storage entry data
   * 
   * @param {object} socket - The Socket of the admin
   * @return {object} object - The storage entry containing the socket and a collection of players (Unique user ids)
   */
  function AdminInfo(data, parent) {
    this.parent = parent;
    this.adminId = data.adminId;
    this.players = {};
    this.controller = new Manager(null, this.instruct.bind(this));
    this.commandQueue = new Queue();

  }

  function PlayerInfo(data, parent) {
    this.PlayerSocketId = data.PlayerSocketId;
    if (parent) {
      this.adminId = data.adminId;
      this.parent = parent;
      this.controller = new Pleb(null, this.respond.bind(this));
    } else {
      this.rtcId = data.playerRtc;
      this.busy = false;
    }
  }
  /* 
   * Configurable Storage entry data
   * 
   * @param {object} socket - The Socket of the admin
   * @return {object} object - The storage entry containing the socket and a collection of players (Unique user ids)
   */
  AdminInfo.prototype.broadcast = function (msg) {
    this.parent.LocalDataChannel.send(msg);
  };
  /* 
   * Configurable Storage entry data
   * 
   * @param {object} socket - The Socket of the admin
   * @return {object} object - The storage entry containing the socket and a collection of players (Unique user ids)
   */
  AdminInfo.prototype.instruct = function (levelId, msg) {
    if (levelId === 0) {
      var players = this.players;
      for (var player in players) {
        if (!(players[player].busy)) {
          players[player].busy = true;
          return this.message(player, msg);
        }
      }
      return this.commandQueue.enqueue(msg);
    } else if (levelId === 2) {
      return this.parent.socket.emit("updatedModel", msg);
    }
    console.log("Error in instruct - LevelId was not satisfied appropriately");
  }

  /* 
   * Configurable Storage entry data
   * 
   * @param {object} socket - The Socket of the admin
   * @return {object} object - The storage entry containing the socket and a collection of players (Unique user ids)
   */
  AdminInfo.prototype.checkQdQ = function (playerId) {
    if (this.commandQueue.length) {
      var newCommand = this.commandQueue.dequeue();
      this.players[playerId].busy = true;
      this.parent.LocalDataChannel.channels[playerId].send(newCommand);
    }
  };
  /* 
   * Configurable Storage entry data
   * 
   * @param {object} socket - The Socket of the admin
   * @return {object} object - The storage entry containing the socket and a collection of players (Unique user ids)
   */
  AdminInfo.prototype.message = function (playerId, msg) {
    this.parent.LocalDataChannel.channels[playerId].send(msg);
  };
  /* 
   * Configurable Storage entry data
   * 
   * @param {object} socket - The Socket of the admin
   * @return {object} object - The storage entry containing the socket and a collection of players (Unique user ids)
   */
  PlayerInfo.prototype.respond = function (toLevel, msg) {
    this.adminMessage(msg);
  };
  /* 
   * Configurable Storage entry data
   * 
   * @param {object} socket - The Socket of the admin
   * @return {object} object - The storage entry containing the socket and a collection of players (Unique user ids)
   */
  PlayerInfo.prototype.adminMessage = function (msg) {
    this.parent.LocalDataChannel.send(msg);
  };
