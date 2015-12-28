function SpeakEasyBuild(DataChannel) {
  this.LocalDataChannelContstructor = DataChannel;
  this.socket = null;
  this.AdminInfo = null;
  this.PlayerInfo = null;
};

SpeakEasyBuild.prototype.resetState = function () {
  this.LocalDataChannel = null;
  this.socket = null;
  this.AdminInfo = null;
  this.PlayerInfo = null;
};

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
SpeakEasyBuild.prototype.onOpenInject = function (q, z) {
  console.log("IN ON OPEN IN INJECT", q, z)
  if (this.PlayerInfo) {
    console.log("Player connection event to admin fired");
    this.LocalDataChannel.send({ //send message to admin to complete initial handshake
      isPlayer_initiation: true,
      PlayerSocketId: this.PlayerInfo.PlayerSocketId
    })
  }
};
SpeakEasyBuild.prototype.onMessageInject = function (data, rtcId) {
  console.log("ON MESSAGE FIRING", data, rtcId)
  if (this.AdminInfo && data.isPlayer_initiation) { //check to see if is player connection intiation
    return this.initiatePlayer(data, rtcId)
  }
  if (this.AdminInfo) { //if player response to instruction
    return console.log("PLAYER RESPONSE MESSAGE: ", data);
  } else if (this.PlayerInfo) {
    return console.log("PLAYER RECIEVED MEASSAGE: ", data, rtcId);
  }
  console.error("Somehow arrived to onMessage inject without PLAYER or admin status");
};

SpeakEasyBuild.prototype.ejectPlayer = function (data) {
  this.LocalDataChannel.channels[data].channel.peer.close()
};

SpeakEasyBuild.prototype.onclose = function (event) {
  console.log("ON CLOSE FIRED", event)
  var playerRtcId = event.target.SpkEzId;
  if (this.AdminInfo) {
    if (!playerRtcId) { //if not player rtcId, means the player lost connection without being 'ejected' - WILL RESULT IN CLOSE EVENT FIRING 2x. Once for disconnect, another to eject him.
      var channels = this.LocalDataChannel.channels;
      for (var channel in channels) {
        if (channels[channel].channel.peer.iceConnectionState) {
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
  } else if (this.LocalDataChannel.channels[this.PlayerInfo.adminId].channel.peer === event.target) { //Not ideal.  But this is reliable
    this.resetState();
    return this.init(this.signaler, this.socketEndPoint);
  }
  console.error("On Close event error: Somehow a player left that was neither an admin or a registered player")
};

SpeakEasyBuild.prototype.initiatePlayer = function (data, rtcId) {
  console.log("init player", data, rtcId)
  this.socket.emit("playerrecieved", {
    playerRtc: rtcId,
    PlayerSocketId: data.PlayerSocketId
  });
};

SpeakEasyBuild.prototype.confirmPlayer = function (data) {
  this.AdminInfo.players[data.playerRtc] = new PlayerInfo(data);
  console.log("Player confirmed", data);
};

SpeakEasyBuild.prototype.adminSetup = function (data) {
  this.AdminInfo = new AdminInfo(data, this);
  this.LocalDataChannel.userid = this.AdminInfo.adminId;
  this.LocalDataChannel.transmitRoomOnce = true;
  this.LocalDataChannel.open(this.AdminInfo.adminId);
};

SpeakEasyBuild.prototype.playerSetup = function (data) {
  console.log("Player Setup", data)
  this.PlayerInfo = new PlayerInfo(data, this);
  this.LocalDataChannel.connect(data.adminId);
  this.LocalDataChannel.join({
    id: data.adminId,
    owner: data.adminId
  });
};

function AdminInfo(data, parent) {
  this.parent = parent;
  this.adminId = data.adminId;
  this.players = {};
}

function PlayerInfo(data, parent) {
  this.PlayerSocketId = data.PlayerSocketId;
  if (parent) {
    this.adminId = data.adminId;
    this.parent = parent;
  } else {
    this.rtcid = data.playerRtc;
  }
}

AdminInfo.prototype.broadcast = function (msg) {
  this.parent.LocalDataChannel.send(msg);
};

AdminInfo.prototype.message = function (msg, plebId, toLevelId) {
  if (!toLevelId) {
    //this.players[playerId].occupied = true;
    //SpeakEasy.LocalDataChannel.channels[playerId].send(msg); //SO GHETTOOOO
    //send to next avail player
  } else if (toLevelId === 1) {
    throw Error("Somehow this admin thought it was a player...")
  } else {
    //send to mother
  }
};

PlayerInfo.prototype.respond = function (msg, toLevelId) {
  this.parent.LocalDataChannel.send(msg);
};
