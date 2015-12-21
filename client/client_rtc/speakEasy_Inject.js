function SpeakEasyBuild(DataChannel) {
  this.LocalDataChannel = new DataChannel();
  this.socket = null;
  this.ManagerInfo = null;
  this.PlebInfo = null;
}
SpeakEasyBuild.prototype.init = function (signalerSetup, socketEndPoint) {
  if (typeof signalerSetup !== "function") throw Error("SignalerSetup needs to be a function")
  signalerSetup(this, socketEndPoint || '/');
  this.LocalDataChannel.onMessage = this.onMessageInject;
  this.LocalDataChannel.onopen = this.onOpenInject;
  this.LocalDataChannel.onleave = this.onLeave;
};
SpeakEasyBuild.prototype.onOpenInject = function () {
  console.log("ON OPEN INJECT FIRED", userId);
  if (this.PlebInfo.plebStatus) {
    console.log("Pleb connection event to manager fired");
    this.LocalDataChannel.send({ //send message to manager to complete initial handshake
      isPleb_initiation: true,
      plebSocketId: this.PlebInfo.oldPlebSocketId
    })
  }
};
SpeakEasyBuild.prototype.onMessageInject = function (data) {
  if (this.ManagerInfo.managerStatus && data.isPleb_initiation) { //check to see if is pleb connection intiation
    return this.initiatePleb(data, rtcId)
  }
  if (this.ManagerInfo) { //if pleb response to instruction
    return console.log("PLEB RESPONSE MESSAGE: ", data);
    //toggle pleb is occupied
  } else if (this.PlebInfo) {
    return console.log("PLEB RECIEVED MEASSAGE: ", data, rtcId);
  }
  throw Error("Somehow arrived to onMessage inject without pleb or manager status");
};

SpeakEasyBuild.prototype.ejectPleb = function (data) {
  console.log("THIS IS WHAT EJECT PLEB IS TRYING TO EJECT ", data);
  this.LocalDataChannel.eject(data);
  delete this.ManagerInfo.plebs[data];
};

SpeakEasyBuild.prototype.onLeave = function () {
  console.log("ON LEAVE INJECT FIRED", rtcId);
  if (this.ManagerInfo.managerStatus) {
    return this.socket.emit('pleblost', plebSocketId);
  }
  //need to check if manager left
  this.init();
};
SpeakEasyBuild.prototype.resetState = function () {
  this.LocalDataChannel = null;
  this.socket = null;
  this.ManagerInfo = null;
  this.PlebInfo = null;
};

SpeakEasyBuild.prototype.initiatePleb = function () {
  this.ManagerInfo.plebRtcIds[data.plebSocketId] = rtcId; //lets us look up plebs rtc id's by their socket ids
  this.ManagerInfo.plebs[rtcId] = {
    oldSocketId: data.plebSocketId //stores the old socket id for no reason atm.
  };
  this.socket.emit("plebrecieved", data.plebSocketId);
  console.log("Pleb handshake confirmed", this.ManagerInfo.plebs);
};


SpeakEasyBuild.prototype.managerSetup = function (data) {
  this.ManagerInfo = new ManagerInfo(data);
  this.LocalDataChannel.userid = data.managerId;
  this.LocalDataChannel.transmitRoomOnce = true;
  this.LocalDataChannel.open(SpeakEasy.LocalDataChannel.userid);
};

SpeakEasyBuild.prototype.plebSetup = function (data) {
  this.PlebInfo = new PlebInfo(data);
  this.LocalDataChannel.connect(data.managerId);
  this.LocalDataChannel.join({
    id: data.managerId,
    owner: data.managerId
  });
};

function ManagerInfo(data) {
  this.model = null;
  this.managerId = data.managerId;
  this.managerStatus = true;
  this.plebs = {};
  this.plebRtcIds = {};
}

ManagerInfo.prototype.broadcast = function (msg) {
  SpeakEasy.LocalDataChannel.send(msg); //SO GHETTOOOO
  // body...
};
ManagerInfo.prototype.message = function (toLevelId, msg) {
  if (!toLevelId) {
    //this.plebs[plebId].occupied = true;
    //SpeakEasy.LocalDataChannel.channels[plebId].send(msg); //SO GHETTOOOO
    //send to next avail pleb
  } else if (toLevelId === 1) {
    throw Error("Somehow this manager thought it was a pleb...")
  } else {
    //send to mother
  }
};

function PlebInfo(data) {
  this.oldPlebSocketId = data.plebId;
  this.model = null;
  this.plebStatus = true;
}

PlebInfo.prototype.respond = function (toLevelId, msg) {
  SpeakEasy.LocalDataChannel.send(msg);
};
