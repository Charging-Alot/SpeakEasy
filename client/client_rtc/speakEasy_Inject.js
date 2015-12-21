function SpeakEasyBuild(DataChannel) {
  this.LocalDataChannel = new DataChannel();
  this.socket = null;
  this.AdminInfo = null;
  this.PlayerInfo = null;
}
SpeakEasyBuild.prototype.init = function (signalerSetup, socketEndPoint) {
  if (typeof signalerSetup !== "function") throw Error("SignalerSetup needs to be a function")
  signalerSetup(this, socketEndPoint || '/');
  this.LocalDataChannel.onmessage = this.onMessageInject.bind(this);
  this.LocalDataChannel.onopen = this.onOpenInject.bind(this);
  this.LocalDataChannel.onleave = this.onLeave.bind(this);
};
SpeakEasyBuild.prototype.onOpenInject = function () {
  console.log("ON OPEN FIRING", this)
  if (this.PlayerInfo) {
    console.log("Player connection event to admin fired");
    this.LocalDataChannel.send({ //send message to admin to complete initial handshake
      isPlayer_initiation: true,
      playerSocketId: this.PlayerInfo.oldPlayerSocketId
    })
  }
};
SpeakEasyBuild.prototype.onMessageInject = function (data) {
  console.log("ON MESSAGE FIRING", data)
  if (this.AdminInfo && data.isPlayer_initiation) { //check to see if is player connection intiation
    return this.initiatePlayer(data, rtcId)
  }
  if (this.AdminInfo) { //if player response to instruction
    return console.log("PLAYER RESPONSE MESSAGE: ", data);
  } else if (this.PlayerInfo) {
    return console.log("PLAYER RECIEVED MEASSAGE: ", data, rtcId);
  }
  throw Error("Somehow arrived to onMessage inject without PLAYER or admin status");
};

SpeakEasyBuild.prototype.ejectPlayer = function (data) {
  console.log("THIS IS WHAT EJECT PLAYER IS TRYING TO EJECT ", data);
  this.LocalDataChannel.eject(data);
  delete this.AdminInfo.players[data];
};

SpeakEasyBuild.prototype.onLeave = function () {
  console.log("ON LEAVE INJECT FIRED", rtcId);
  if (this.AdminInfo) {
    return this.socket.emit('playerlost', playerSocketId);
  }
  //need to check if admin left
  this.init();
};
SpeakEasyBuild.prototype.resetState = function () {
  this.LocalDataChannel = null;
  this.socket = null;
  this.AdminInfo = null;
  this.PlayerInfo = null;
};

SpeakEasyBuild.prototype.initiatePlayer = function () {
  this.AdminInfo.playerRtcIds[data.playerSocketId] = rtcId; //lets us look up players rtc id's by their socket ids
  this.AdminInfo.players[rtcId] = {
    oldSocketId: data.playerSocketId //stores the old socket id for no reason atm.
  };
  this.socket.emit("playerrecieved", data.playerSocketId);
  console.log("Player handshake confirmed", this.AdminInfo.players);
};


SpeakEasyBuild.prototype.adminSetup = function (data) {
  this.AdminInfo = new AdminInfo(data);
  this.LocalDataChannel.userid = data.adminId;
  this.LocalDataChannel.transmitRoomOnce = true;
  this.LocalDataChannel.open(data.adminId);
};

SpeakEasyBuild.prototype.playerSetup = function (data) {
  this.PlayerInfo = new PlayerInfo(data);
  this.LocalDataChannel.connect(data.adminId);
  this.LocalDataChannel.join({
    id: data.adminId,
    owner: data.adminId
  });
};

function AdminInfo(data) {
  this.adminId = data.adminId;
  this.players = {};
  this.playerRtcIds = {};
}

AdminInfo.prototype.broadcast = function (msg) {
  SpeakEasy.LocalDataChannel.send(msg); //SO GHETTOOOO
  // body...
};
AdminInfo.prototype.message = function (toLevelId, msg) {
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

function PlayerInfo(data) {
  this.oldPlayerSocketId = data.playerId;
}

PlayerInfo.prototype.respond = function (toLevelId, msg) {
  SpeakEasy.LocalDataChannel.send(msg);
};
