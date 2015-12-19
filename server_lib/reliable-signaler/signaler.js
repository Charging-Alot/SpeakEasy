// <script src="/reliable-signaler/signaler.js"></script>

function initReliableSignaler(connection, socketURL) {
  var socket;
  
  if (!connection) throw '"connection" argument is required.';

  function initSocket() { //all the handlers!
  if (socket && connection && connection.isInitiator && connection.roomid) {
    socket.emit('keep-session', connection.roomid);
  }
  socket = io.connect(socketURL || '/');

  socket.on('connect', function() {
    socket.emit("establish_role",getRandomString()); //need to check for collisions
    console.log("Connect event fired")
  });

  socket.on('Manager_Setup', function(e) {
    console.log("MANAGER SETUP",e)
  });

  socket.on('Pleb_Setup', function(data) {
    console.log("PLEB SETUP",data)
  });

  socket.on('message', function(data) {
    if (onMessageCallbacks[data.channel]) {
    onMessageCallbacks[data.channel](data.message);
    };
  });

  socket.on('error', function() {
    socket.isHavingError = true;
    initSocket();
  });

  socket.on('disconnect', function() {
    socket.isHavingError = true;
    initSocket();
  });
  }();

  var onMessageCallbacks = {};

  // using socket.io for signaling
  connection.openSignalingChannel = function(config) {
  var channel = config.channel || this.channel || 'default-channel';
  onMessageCallbacks[channel] = config.onmessage;
  if(config.onopen) setTimeout(config.onopen, 1);
  return {
    send: function(message) {
    socket.emit('message', {
      sender: connection.userid,
      channel: channel,
      message: message
    });
    },
    channel: channel
  };
  };

  function listenEventHandler(eventName, eventHandler) {
  window.removeEventListener(eventName, eventHandler);
  window.addEventListener(eventName, eventHandler, false);
  }

  listenEventHandler('load', onLineOffLineHandler);
  listenEventHandler('online', onLineOffLineHandler);
  listenEventHandler('offline', onLineOffLineHandler);

  function onLineOffLineHandler() {
  if (!navigator.onLine) {
    return console.warn('Internet channel seems disconnected or having issues.');
  }
  // if socket.io was disconnected out of network issues...try a reconnect
  if (socket.isHavingError) {
    initSocket();
  }
  }
  
  function getRandomString() {
  if (window.crypto && window.crypto.getRandomValues && navigator.userAgent.indexOf('Safari') === -1) {
    var a = window.crypto.getRandomValues(new Uint32Array(3)),
    token = '';
    for (var i = 0, l = a.length; i < l; i++) {
    token += a[i].toString(36);
    }
    return token;
  } else {
    return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
  }
  }

  return {
  socket: socket,
  createNewRoomOnServer: function(roomid, successCallback) {
    // for reusability on failures & reconnect
    connection.roomid = roomid;
    connection.isInitiator = true;
    connection.userid = connection.userid || getRandomString();
    socket.emit('keep-in-server', roomid || connection.channel, successCallback || function() {});
  },
  getRoomFromServer: function(roomid, callback) {
    connection.userid = connection.userid || getRandomString();
    socket.emit('get-session-info', roomid, callback);
  }
  };
}
