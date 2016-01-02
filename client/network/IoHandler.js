if (module) {
  var Queue = require('./Queue.js').Queue
}

/*
 * IoHandler Constructor.  
 * Creates an object which is associated with the input and output to one other tier in the distributed network.
 * Allows for setting callbacks for one or more commands at once using the output queue and stalling input using the input queue.
 * Should be called with the new keyword.
 *
 * @param {level} number - level indicating the tier of this IoHandler's controller (0 = pleb, 1 = manager, 2 = mother)
 * @param {toLevel} number - level indicating the tier of the controller sending and recieving commands to and from this one
 * @param {controller} object - the pleb, manager or mother object this object is attached to
 * @param {sendFunction} function - a function which takes a number indicating the level the message is meant to go to, followed by a string containing the message to be sent
 * @return IoHandler object
 */
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

/*
 * Queues the command object with it's intended call back to the output queue.
 *
 * @param {command} string - string indicating what the downstream controller should do upon recieving the command or indicating to the upstream controller what command was just executed
 * @param {section} number - a value indicating the index or key that this particular command object corresponds to.  Usually a node id
 * @param {value} object - the object that the command should be executed on
 * @param {callback} function - the function to be run when a command is recieved from this controller with the same command and section as the one just sent
 */
IoHandler.prototype.addToOut = function (command, section, value, callback) {
  this.output.enqueue({
    'command': command,
    'section': section,
    'value': value,
    'callback': callback
  });
}

/*
 * Sets the callback for a command to the IoHandler's waiting object.
 * If a callback is specified as an argument, it will bind each queued task's callback to the passed in callback as an argument and store the resulting function in the waiting object instead.
 * After setting the callback, it sends the task object to the next controller using the send function provided at instantiation.
 *
 * @param {taskObj} object - An object with three properties: 'command' with a string value, 'section' with a null or number value and 'value' which contains the object to be worked on
 * @param {callback} function - If defined, will have this task's callback bound to it and be called instead of the callback in the queue when the other controller responds to the command
 */
IoHandler.prototype.runOutput = function (taskObj, callback) {
  //callback argument is used to wrap the callback in taskObj instead of storing just
  //the one in taskObj.  must take a callback as it's first argument.
  //Mostly used for counting responses in runAllOutputs.
  //if there are response callbacks, set them to the waiting objects
  if (callback) {
    this.waiting.names[taskObj.command] = true;
    this.waiting.callbacks[taskObj.command] = callback.bind(this, taskObj.callback);
  } else if (taskObj.callback) {
    this.waiting.names[taskObj.command] = true;
    this.waiting.callbacks[taskObj.command] = taskObj.callback;
  }

  this.send(this.toLevel, JSON.stringify({
    command: taskObj.command,
    section: taskObj.section,
    value: taskObj.value
  }));
}
/*
 * Runs all commands that have been queued and sets the callbacks for each so that the callback argument is called after all of the queued commands have returned.
 *
 * @param {callback} function - The function to be called after all queued commands have been returned by the other controller
 */
IoHandler.prototype.runAllOutputs = function (callback) {
  var numFinished = 0;
  var len = this.output.length;

  if (!this.output.length) {
    callback();
    return;
  }

  while (this.output.length) {
    var taskObj = this.output.dequeue();
    if (callback) {
      this.runOutput(taskObj, function (taskCallback, command, section, value) {
        if (taskCallback) {
          taskCallback(command, section, value);
        }
        ++numFinished;
        if (numFinished === len) {
          if (taskObj.section !== null) {
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
/*
 * If the controller is waiting for this taskObj or it comes from upstream, it runs that command, otherwise it queues it.
 *
 * @param {taskObj} object - object to be queued
 */
IoHandler.prototype.addToIn = function (taskObj) {
  if (this.level < this.toLevel) {
    this.runInput(taskObj);
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
    if (this.waiting.names[taskObj.command]) {
      this.runInput(taskObj);
    } else {
      this.input.enqueue(taskObj);
    }
  }
}


/*
 * Updates the controller, then, if the task came from upstream runs the command, otherwise it calls the appropriate callback from the waiting list.
 *
 * @param {taskObj} object - Object containing command, section and value properties.
 */
IoHandler.prototype.runInput = function (taskObj) {
  // if (typeof taskObj === 'string') {
  //   taskObj = JSON.parse(taskObj)
  // }
  this.contoller.update(taskObj.command, taskObj.section, taskObj.value);
  if (this.level < this.toLevel && taskObj.command !== 'update') {
    this.contoller.run(taskObj.command, taskObj.section);
  } else if (this.level > this.toLevel) {
    if (this.waiting.names[taskObj.command]) {
      if (taskObj.section === null) {
        //if section is being used then this variable is reset in the callback
        this.waiting.names[taskObj.command] = false;
      }
      this.waiting.callbacks[taskObj.command](taskObj.command, taskObj.section, taskObj.value);
    }
  }
}
/*
 * Runs all inputs that are in the queue.
 */
IoHandler.prototype.runAllInputs = function () {
  while (this.input.length) {
    // var taskObj = this.input.first();
    // this.runInput(taskObj);
    // this.input.dequeue();
    this.runInput(this.input.dequeue());
  }
}

if (module) {
  exports.IoHandler = IoHandler
}
