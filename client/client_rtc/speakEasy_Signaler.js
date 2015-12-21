function socketListener(SpeakEasy) {
  if (!SpeakEasy.LocalDataChannel) throw '"SpeakEasy.LocalDataChannel" argument is required, its possible you did not init()';

  // SpeakEasy.LocalDataChannel.openSignalingChannel = function (config) {
  //   var channel = config.channel;
  //   if (config.onopen) setTimeout(config.onopen, 1);
  //   return {
  //     send: function (message) {
  //       SpeakEasy.socket.emit('message', {
  //         sender: channel.userid,
  //         channel: channel,
  //         message: message
  //       });
  //     },
  //     channel: channel
  //   };
  // };


  initSocket();

  function initSocket() { //all the handlers!
    console.log("Init socket")
    SpeakEasy.socket = io.connect('http://localhost:1337/', {
      'force new connection': true,
      'reconnect': false
    });

    SpeakEasy.socket.on('error', function () {
      socket.isHavingError = true;
      SpeakEasy.resetState();
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
      SpeakEasy.resetState();
      initSocket(); //if not pleb, means was manager or hadn't been established yet, attempt reconnect
    });

    SpeakEasy.socket.on('managersetup', function (data) {
      console.log("MANAGER SETUP SIGNAL RECIEVED", data);
      SpeakEasy.managerSetup(data);
    });

    SpeakEasy.socket.on('plebsetup', function (data) {
      console.log("PLEB SETUP SIGNAL RECIEVED", data);
      SpeakEasy.plebSetup(data);
    });

    SpeakEasy.socket.on('plebeject', function (data) {
      if (SpeakEasy.ManagerInfo.managerStatus) {
        console.log("Pleb Eject called for:", data)
        var plebrtcid = SpeakEasy.ManagerInfo.plebRtcIds[data];
        SpeakEasy.ejectPleb(plebrtcid);
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
      return alert('Internet channel seems disconnected or having issues.');
    }
    if (SpeakEasy.socket.isHavingError) {
      SpeakEasy.resetState();
      initSocket();
    }
  }

  listenEventHandler('load', onLineOffLineHandler);
  listenEventHandler('online', onLineOffLineHandler);
  listenEventHandler('offline', onLineOffLineHandler);

  //===================================== Connection error handling!!!!!
}
