function initSpeakEasySignaler(SpeakEasy) {
  var onMessageCallbacks = {};
  if (!SpeakEasy.LocalDataChannel) throw '"SpeakEasy.LocalDataChannel" argument is required.';

  initSocket();

  function initSocket() { //all the handlers!
    console.log("Init socket")
    SpeakEasy.resetState();
    SpeakEasy.socket = io.connect('http://localhost:1337/', {
      'force new connection': true,
      reconnect: false
    });

    SpeakEasy.socket.on('error', function () {
      socket.isHavingError = true;
      initSocket();
    });

    SpeakEasy.socket.on('connect', function () {
      SpeakEasy.socket.emit("establish_role");
      console.log("Socket Conn with mother established");
    });

    SpeakEasy.socket.on('disconnect', function () {
      if (SpeakEasy.PlebInfo.plebStatus === true) {
        return console.log("Pleb status established with manager and socket disconnected");
      }
      SpeakEasy.socket.isHavingError = true;
      console.log("Socket disconnected for unexpected reason, trying re-init socket")
      initSocket(); //if not pleb, means was manager or hadn't been established yet.  Reconnect
    });

    SpeakEasy.socket.on('managersetup', function (data) {
      console.log("MANAGER SETUP", data);

      SpeakEasy.LocalDataChannel.userid = data.managerId;
      SpeakEasy.LocalDataChannel.transmitRoomOnce = true;
      SpeakEasy.LocalDataChannel.open(data.managerId);
      // SpeakEasy.ManagerInfo.Model = new Manager(null, SpeakEasy.ManagerInfo.message.bind(SpeakEasy.ManagerInfo))
      SpeakEasy.ManagerInfo.managerStatus = true;
      SpeakEasy.ManagerInfo.managerId = data.managerId;
    });

    SpeakEasy.socket.on('plebsetup', function (data) {
      console.log("PLEB SETUP", data);
      SpeakEasy.LocalDataChannel.connect(data.managerId);
      SpeakEasy.LocalDataChannel.join({
        id: data.managerId,
        owner: data.managerId
      });
      // SpeakEasy.PlebInfo.Model = new Manager(null, SpeakEasy.PlebInfo.respond.bind(SpeakEasy.PlebInfo));
      SpeakEasy.PlebInfo.plebStatus = true;
      SpeakEasy.PlebInfo.oldPlebSocketId = data.plebId;
    });

    SpeakEasy.socket.on('plebeject', function (data) {

      if (SpeakEasy.ManagerInfo.managerStatus) {
        console.log("Pleb Eject called for:", data)
        var plebrtcid = SpeakEasy.ManagerInfo.plebRtcIds[data];
        //so ghettoo
        SpeakEasy.LocalDataChannel.channels[plebrtcid].channel.peer.close(plebrtcid);
        delete SpeakEasy.ManagerInfo.plebs[data];
      };
    });
    SpeakEasy.socket.on('message', function (data) {
      if (onMessageCallbacks[data.channel]) {
        onMessageCallbacks[data.channel](data.message);
      };
    });

  }

  SpeakEasy.LocalDataChannel.openSignalingChannel = function (config) {
    var channel = config.channel || this.channel || 'default-channel';
    onMessageCallbacks[channel] = config.onmessage;
    if (config.onopen) setTimeout(config.onopen, 1);
    return {
      send: function (message) {
        SpeakEasy.socket.emit('message', {
          sender: channel.userid,
          channel: channel,
          message: message
        });
      },
      channel: channel
    };
  };

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
