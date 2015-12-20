function socketListener(SpeakEasy) {
  // var onMessageCallbacks = {};
  if (!SpeakEasy.LocalDataChannel) throw '"SpeakEasy.LocalDataChannel" argument is required.';

  initSocket();

  function initSocket() { //all the handlers!
    console.log("Init socket")
    SpeakEasy.resetState();
    SpeakEasy.socket = io.connect('http://localhost:1337/', {
      'force new connection': true,
      'reconnect': false
    });

    SpeakEasy.socket.on('error', function () {
      socket.isHavingError = true;
      initSocket();
    });

    SpeakEasy.socket.on('connect', function () { //speaks with mother to ask for what the current role should be
      SpeakEasy.socket.emit("establish_role");
      console.log("Socket Conn with mother established");
    });

    SpeakEasy.socket.on('disconnect', function () {
      if (SpeakEasy.PlebInfo) {
        return console.log("Pleb status established with manager & socket disconnected");
      }
      console.log("Socket disconnected for unexpected reason, attempting reconnect")
      SpeakEasy.socket.isHavingError = true;
      initSocket(); //if not pleb, means was manager or hadn't been established yet, attempt reconnect
    });

    SpeakEasy.socket.on('managersetup', function (data) {
      console.log("MANAGER SETUP SIGNAL RECIEVED", data);
      SpeakEasy.managerSetup();
      SpeakEasy.ManagerInfo.managerId = data.managerId; //might not need this.
      SpeakEasy.ManagerInfo.managerStatus = true;
      SpeakEasy.LocalDataChannel.userid = data.managerId;
      SpeakEasy.LocalDataChannel.transmitRoomOnce = true;
      SpeakEasy.LocalDataChannel.open(SpeakEasy.LocalDataChannel.userid);
      // SpeakEasy.ManagerInfo.Model = new Manager(null, SpeakEasy.ManagerInfo.message.bind(SpeakEasy.ManagerInfo))
    });

    SpeakEasy.socket.on('plebsetup', function (data) {
      console.log("PLEB SETUP SIGNAL RECIEVED", data);
      SpeakEasy.plebSetup();
      SpeakEasy.LocalDataChannel.connect(data.managerId);
      SpeakEasy.LocalDataChannel.join({
        id: data.managerId,
        owner: data.managerId
      });
      SpeakEasy.PlebInfo.plebStatus = true;
      SpeakEasy.PlebInfo.oldPlebSocketId = data.plebId;
      // SpeakEasy.PlebInfo.Model = new Manager(null, SpeakEasy.PlebInfo.respond.bind(SpeakEasy.PlebInfo));
    });

    SpeakEasy.socket.on('plebeject', function (data) {
      if (SpeakEasy.ManagerInfo.managerStatus) {
        console.log("Pleb Eject called for:", data)
        var plebrtcid = SpeakEasy.ManagerInfo.plebRtcIds[data];
        SpeakEasy.LocalDataChannel.channels[plebrtcid].channel.peer.close(plebrtcid); //ghetto
        delete SpeakEasy.ManagerInfo.plebs[data];
      };
    });

    SpeakEasy.socket.on('message', function (data) {
      if (onMessageCallbacks[data.channel]) {
        onMessageCallbacks[data.channel](data.message);
      };
    });
  }


  //======================================== Connection error handling!!!!!
  //======================================== Connection error handling!!!!!
  //======================================== Connection error handling!!!!!
  //======================================== Connection error handling!!!!!
  //======================================== Connection error handling!!!!!
  //======================================== Connection error handling!!!!!
  //======================================== Connection error handling!!!!!
  function listenEventHandler(eventName, eventHandler) {
    window.removeEventListener(eventName, eventHandler);
    window.addEventListener(eventName, eventHandler, false);
  }

  function onLineOffLineHandler() {
    if (!navigator.onLine) {
      return console.warn('Internet channel seems disconnected or having issues.');
    }
    if (SpeakEasy.socket.isHavingError) {
      initSocket();
    }
  }

  listenEventHandler('load', onLineOffLineHandler);
  listenEventHandler('online', onLineOffLineHandler);
  listenEventHandler('offline', onLineOffLineHandler);

  //===================================== Connection error handling!!!!!
}
