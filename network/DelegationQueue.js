var DelegationQueue = function (level, sendFunction) {
  //don't forget to bind the sendFunction!
  Queue.call(this);
  this.toLevel
  this.send = sendFunction;
}
DelegationQueue.prototype = Object.create(Queue);
DelegationQueue.prototype.constructor = DelegationQueue;

this.prototype.sendCommands = function (callback) {
  var numFinished = 0;
  for(var i = 0; i < this.length; ++i) {
    var currentTask = this.dequeue();
    this.send({
      command: currentTask,
      value: currentTask
    }, function (completionCallback, response) {
        numFinished++;
        completionCallback(response);
        if(numFinished >= this.length) {
          callback();
        }
    }.bind(null, currentTask.callback));
  }
}

this.prototype.addCommand = function (command, value, callback) {
  this.enqueue({
    'command': command, 
    'value': value, 
    'callback': callback
  });
}
