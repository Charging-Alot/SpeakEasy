var IoHandler = function (level, toLevel, updateFunction, sendFunction) {
  this.input = new Queue();
  this.output = new Queue();
  this.update = updateFunction;
  this.send = sendFunction;
  this.level = level;
  this.toLevel = toLevel;
  this.waiting = {};
  this.waiting.names = {};
  this.waiting.callbacks = {};
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
  this.output.send(this.toLevel, {
      command: taskObj.command,
      section: taskObj.section,
      value: taskObj.value
  });
  if(callback) {
    this.waiting.names[taskObj.command];
    this.waiting.callbacks(callback)
  }
  //if there are response callbacks, set them to the waiting objects
  if(callback) {
    this.waiting.names[taskObj.command] = true;
    this.waiting.callbacks[taskObj.command] = callback.bind(this, taskObj.callback);
  } else if(taskObj.callback) {
    this.waiting.names[taskObj.command] = true;
    this.waiting.callbacks[taskObj.command] = taskObj.callback;
  }
}

IoHandler.prototype.runAllOutputs = function (callback) {
  var numFinished = 0;
  var len = this.output.length;

  while(this.output.length) {
    var taskObj = this.output.dequeue();
    if(waitForResponse) {
      this.runOutput(taskObj, function (taskCallback, response) {
        if(taskCallback) {
          taskCallback(response);
        }
        ++numFinished;
        if(numFinished === len && callback) {
          if(task.obj.section === null) {
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
  if(this.input.length === 0 || this.waiting.names[taskObj.command]) {
    this.runInput(taskObj);
  } else {
    this.input.enqueue(taskObj);
  }
}

IOHandler.prototype.runInput = function (taskObj) {
  this.section = taskObj.section;
  this.command = taskObj.command;
  this.update(taskObj.command, taskObj.section, taskObj.value);
  if(this.level < this.toLevel && taskObj.command !== 'update') {
    this[taskObj.command]();
  } else if(this.level > this.toLevel) {
    if(this.waiting.names[taskObj.command]) {
      if(taskObj.section !== null) {
        //if section is being used then this variable is reset in the callback
        this.waiting.names[taskObj.command] = false;
      }
      this.waiting.callbacks[taskObj.command]();
    }
}

IoHandler.prototype.runAllInputs = function () {
  while(this.input.length) {
    var taskObj = this.input.dequeue();
    this.runInput(taskObj);
  }
}
