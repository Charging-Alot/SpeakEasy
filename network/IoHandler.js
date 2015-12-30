var IoHandler = function (level, toLevel, contoller, sendFunction) {
  this.input = new Queue();
  this.output = new Queue();
  this.contoller = contoller
  this.send = sendFunction
  this.level = level;
  this.toLevel = toLevel;
  this.waiting = {};
  this.waiting.names = {};
  this.waiting.callbacks = {};
  // this.blockInput = false;
}

IoHandler.prototype.addToOut = function (command, section, value, callback) {
  this.output.enqueue({
    'command': command, 
    'section': section,
    'value': value, 
    'callback': callback
  });
}

IoHandler.prototype.runOutput = function(taskObj, callback) {
  //callback argument is used to wrap the callback in taskObj instead of storing just
  //the one in taskObj.  must take a callback as it's first argument.
  //Mostly used for counting responses in runAllOutputs.
  //if there are response callbacks, set them to the waiting objects
  if(callback) {
    this.waiting.names[taskObj.command] = true;
    this.waiting.callbacks[taskObj.command] = callback.bind(this, taskObj.callback);
  } else if(taskObj.callback) {
    this.waiting.names[taskObj.command] = true;
    this.waiting.callbacks[taskObj.command] = taskObj.callback;
  }

  this.send(this.toLevel, {
      command: taskObj.command,
      section: taskObj.section,
      value: taskObj.value
  });
}

IoHandler.prototype.runAllOutputs = function (callback) {
  var numFinished = 0;
  var len = this.output.length;

  if(!this.output.length) {
    callback();
    return;
  }

  while(this.output.length) {
    var taskObj = this.output.dequeue();
    if(callback) {
      this.runOutput(taskObj, function (taskCallback, command, section, value) {
        if(taskCallback) {
          taskCallback(command, section, value);
        }
        ++numFinished;
        if(numFinished === len) {
          if(taskObj.section !== null) {
            this.waiting.names[taskObj.command] = false;
          }
          callback();
        }
      });
    } else {
      this.runOutput(taskObj);
    }
  }
}

IoHandler.prototype.addToIn = function (taskObj) {
  if(this.level < this.toLevel) {
    this.runInput(taskObj)
    // if(!blockInput) {
    //   if(true) {
    //   this.blockInput = true
    //   // this.input.enqueue(taskObj)
    //   this.runInput(taskObj);
    //   this.blockInput = false;
    //   // this.input.dequeue();
    // } else {
    //   this.input.enqueue(taskObj);
    // }
  } else {
    if(this.waiting.names[taskObj.command]) {
      this.runInput(taskObj);
    } else {
      this.input.enqueue(taskObj);
    }
  }
}

IoHandler.prototype.runInput = function (taskObj) {
  this.contoller.update(taskObj.command, taskObj.section, taskObj.value);
  if(this.level < this.toLevel && taskObj.command !== 'update') {
    this.contoller.run(taskObj.command, taskObj.section);
  } else if(this.level > this.toLevel) {
    if(this.waiting.names[taskObj.command]) {
      if(taskObj.section === null) {
        //if section is being used then this variable is reset in the callback
        this.waiting.names[taskObj.command] = false;
      }
      this.waiting.callbacks[taskObj.command](taskObj.command, taskObj.section, taskObj.value);
    }
  }
}

IoHandler.prototype.runAllInputs = function () {
  while(this.input.length) {
    // var taskObj = this.input.first();
    // this.runInput(taskObj);
    // this.input.dequeue();
    this.runInput(this.input.dequeue());
  }
}

if(module) {
  module.exports = IoHandler
}
