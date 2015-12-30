var Queue = function () {
  this.storage = [];
  this.start = 0; //inclusive
  this.end = 0; //exclusive, has precedence over start
  this.length = 0;
}

Queue.prototype.first = function () {
  return this.storage[0];
}

Queue.prototype.enqueue = function (element) {
  this.storage[this.end] = element;
  ++this.end;
  ++this.length;
  // body...
};

Queue.prototype.dequeue = function () {
  if(this.length) {
    --this.length;
    if(!this.length) {
      //since we aren't deleting elements, we just clear the
      //whole thing when it's empty.
      var tmp = this.storage[this.start++]
      Queue.call(this);
      return tmp;
    }
      return this.storage[this.start++];
  } else {
    return null;
  }
}

if(module) {
  module.exports = Queue
}
