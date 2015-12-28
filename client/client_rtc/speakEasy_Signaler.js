function socketListener(SpeakEasy) {
  if (!SpeakEasy.LocalDataChannel) throw '"SpeakEasy.LocalDataChannel" argument is required, its possible you did not init()';
  SpeakEasy.LocalDataChannel.openSignalingChannel = function (config) {
    var channel = config.channel || this.channel || 'default-channel';
    onMessageCallbacks[channel] = config.onmessage;
    if (config.onopen) setTimeout(config.onopen, 1);
    return {
      send: function (message) {
        SpeakEasy.socket.emit('setup', {
          sender: channel.userid,
          channel: channel,
          message: message
        });
      },
      channel: channel
    };
  };

  var onMessageCallbacks = {};
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

    SpeakEasy.socket.on('setup', function (data) {
      if (onMessageCallbacks[data.channel]) {
        onMessageCallbacks[data.channel](data.message);
      };
    });

    SpeakEasy.socket.on('connect', function () { //speaks with mother to ask for what the current role should be
      SpeakEasy.socket.emit("establish_role");
      console.log("Socket Conn with mother established", SpeakEasy.socket);
    });

    SpeakEasy.socket.on('disconnect', function () {
      if (SpeakEasy.PlayerInfo) {
        return console.log("Player status established with admin & socket disconnected");
      }
      console.log("Socket disconnected for unexpected reason, attempting reconnect")
      SpeakEasy.socket.isHavingError = true;
      SpeakEasy.resetState();
      initSocket(); //if not player, means was admin or hadn't been established yet, attempt reconnect
    });

    SpeakEasy.socket.on('adminsetup', function (data) {
      console.log("ADMIN SETUP SIGNAL RECIEVED", data);
      SpeakEasy.LocalDataChannel.openSignalingChannel({
        channel: data.adminId
      })
      SpeakEasy.adminSetup(data);
    });

    SpeakEasy.socket.on('playersetup', function (data) {
      // if (SpeakEasy.AdminInfo || SpeakEasy)
      console.log("PLAYER SETUP SIGNAL RECIEVED", data);
      SpeakEasy.playerSetup(data);
    });

    SpeakEasy.socket.on('playerconfirmed', function (data) {
      if (SpeakEasy.AdminInfo) {
        return SpeakEasy.confirmPlayer(data);
      };
      console.error("Received playerconfirmation but not established as admin");
    });

    SpeakEasy.socket.on('playereject', function (data) {
      if (SpeakEasy.AdminInfo) {
        console.log("Player Eject called for:", data)
        SpeakEasy.ejectPlayer(data.playerRtc);
      };
    });
  }

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
