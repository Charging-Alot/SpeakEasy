var UpdateQueue = function (fromUpstream, level, updateFunction, model) {
  //don't forget to bind the update function!
  Queue.call(this);
  this.tolevel = level;
  this.fromUpstream = fromUpstream;
  this.updateModel = updateFunction;
  this.model = model
}
UpdateQueue.prototype = Object.create(Queue);
UpdateQueue.prototype.constructor = UpdateQueue;

UpdateQueue.prototype.runQueue = function () {
  for(var i = 0; i < this.length; ++i) {
    this.runUpdate(this.dequeue);
  }
}

UpdateQueue.prototype.addUpdate = function (command, newModel) {
  if(this.fromUpstream) {
    this.enqueue({command: command, partialNeuron})
  } else {
    this.runUpdate(command, partialNeuron)
  }
}

UpdateQueue.prototype.runUpdate = function (command, newModel) {
  this.updateFunction(partialNeuron)
  if(command !== 'update') {
    model[command];
  }
}
