function SpeakEasy() {
  this.LocalDataChannel = null;
  this.socket = null;
  this.ManagerInfo = null;
  this.PlebInfo = null;
}

SpeakEasy.prototype.init = function (channelArg) {
  this.LocalDataChannel = new channelArg();
  initSpeakEasySignaler(this, '/');
};

SpeakEasy.prototype.resetState = function (first_argument) {
  this.ManagerInfo = null;
  this.PlebInfo = null;
};

SpeakEasy.prototype.initiatePleb = function () {
  this.ManagerInfo.plebRtcIds[data.plebSocketId] = rtcId; //lets us look up plebs rtc id's by their socket ids
  this.ManagerInfo.plebs[rtcId] = {
    oldSocketId: data.plebSocketId //stores the old socket id for no reason atm.
  };
  this.socket.emit("plebrecieved", data.plebSocketId);
  console.log("Pleb handshake confirmed", this.ManagerInfo.plebs);
};
SpeakEasy.prototype.onMessageInject = function (first_argument) {
  if (this.ManagerInfo.managerStatus && data.isPleb_initiation) { //check to see if is pleb connection intiation
    return this.initiatePleb(data, rtcId)
  }
  if (this.ManagerInfo.managerStatus) { //if pleb response to instruction
    //toggle pleb is occupied
  }
  console.log("PLEB RECIEVED MEASSAGE: ", data, rtcId)
};

SpeakEasy.prototype.onClose = function (first_argument) {
  console.log("ON LEAVE INJECT FIRED", rtcId);
  if (this.ManagerInfo.managerStatus) {
    return this.socket.emit('pleblost', plebSocketId);
  }
  this.init();
};

SpeakEasy.prototype.onOpenInject = function (first_argument) {
  console.log("ON OPEN INJECT FIRED", userId);
  if (this.PlebInfo.plebStatus) {
    console.log("Pleb connection event to manager fired");
    this.LocalDataChannel.send({ //send message to manager to complete initial handshake
      isPleb_initiation: true,
      plebSocketId: this.PlebInfo.oldPlebSocketId
    })
  }
};



function ManagerInfo() {
  this.managerId = '';
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



function PlebInfo() {
  this.oldPlebSocketId = '';
  this.plebStatus = true;
}

Pleb.prototype.respond = function (toLevelId, msg) {
  SpeakEasy.LocalDataChannel.send(msg);
};

// init: function () {
//   this.LocalDataChannel = new SpeakEasyChannel();
//   initSpeakEasySignaler(this, '/');
// },

// resetState: function () {
//   this.ManagerInfo.managerStatus = false;
//   this.ManagerInfo.plebRtcIds = {};
//   this.PlebInfo.plebStatus = false;
// },

// initiatePleb: function (data, rtcId) {
//   this.ManagerInfo.plebRtcIds[data.plebSocketId] = rtcId; //lets us look up plebs rtc id's by their socket ids
//   this.ManagerInfo.plebs[rtcId] = {
//     oldSocketId: data.plebSocketId //stores the old socket id for no reason atm.
//   };
//   this.socket.emit("plebrecieved", data.plebSocketId);
//   console.log("Pleb handshake confirmed", this.ManagerInfo.plebs);
// },

// onMessageInject: function (data, rtcId) {
//   if (this.ManagerInfo.managerStatus && data.isPleb_initiation) { //check to see if is pleb connection intiation
//     return this.initiatePleb(data, rtcId)
//   }
//   if (this.ManagerInfo.managerStatus) { //if pleb response to instruction
//     //toggle pleb is occupied
//   }

//   console.log("PLEB RECIEVED MEASSAGE: ", data, rtcId)
// },

// onClose: function (rtcId) {
//   console.log("ON LEAVE INJECT FIRED", rtcId);
//   if (this.ManagerInfo.managerStatus) {
//     return this.socket.emit('pleblost', plebSocketId);
//   }
//   this.init();
// },

// onOpenInject: function (userId) {
//   console.log("ON OPEN INJECT FIRED", userId);
//   if (this.PlebInfo.plebStatus) {
//     console.log("Pleb connection event to manager fired");
//     this.LocalDataChannel.send({ //send message to manager to complete initial handshake
//       isPleb_initiation: true,
//       plebSocketId: this.PlebInfo.oldPlebSocketId
//     })
//   }
// }
