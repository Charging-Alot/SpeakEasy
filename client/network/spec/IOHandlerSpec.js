describe('Queue', function(){

  it('should have the correct length after adding and removing elements', function(){
    var q = new Queue();
    expect(q.length).to.eql(0);
    q.enqueue(1);
    expect(q.length).to.eql(1);
    q.enqueue(2);
    expect(q.length).to.eql(2);
    q.dequeue()
    expect(q.length).to.eql(1);
    q.dequeue()
    expect(q.length).to.eql(0);
    q.dequeue()
    expect(q.length).to.eql(0);
    q.enqueue(3);
    expect(q.length).to.eql(1);
  });

  it('should return elements in the correct order when dequeued', function(){
    var q = new Queue();
    expect(q.dequeue()).to.eql(null);
    q.enqueue(1);
    expect(q.dequeue()).to.eql(1);
    expect(q.dequeue()).to.eql(null);
    q.enqueue(1);
    q.enqueue(2);
    expect(q.dequeue()).to.eql(1);
    expect(q.dequeue()).to.eql(2);
    expect(q.dequeue()).to.eql(null);
  })

});

describe('IOHandler Downstream Connection', function(){

  it('should queue commands in the correct order and should update before triggering the correct callbacks on response (without sections)', function(){
    var Obj = function (val) {
      this.value = val;
      this.update = function (command, section, value) {
        this.value = value;
        // console.log('update', this.value)
      }
      this.action1 = function () {
        // console.log('action1')
        this.value += 10;
      }
      this.action2 = function () {
        // console.log('action2')
        this.value += 100;
      }
    }
    var sentFirst = false
    var send = function (toLevel, taskObj) {
      // console.log('sent:', taskObj)
      expect(taskObj.value).to.eql(!sentFirst && taskObj.command === 'action1' ? 3 : 5)
      sentFirst = true
    }

    var testObj = new Obj(0);
    var IoOut = new IoHandler(1, 0, testObj, send);

    // var IoIn = new IoHandler(0, 1, testObj0.update.bind(testObj0), IoHandler.prototype.addToOut.bind(IoIn))

    var callback1Res = false;
    var callback2Res = false;
    var callback3Res = false;

    IoOut.addToOut('action1', null, 3, function () {
      // console.log('action1 callback');
      expect(callback1Res).to.eql(false);
      callback1Res = true;
      expect(callback2Res).to.eql(false);
      expect(callback3Res).to.eql(false);
      expect(testObj.value).to.eql(4)
    });

    expect(callback1Res).to.eql(false);
    expect(testObj.value).to.eql(0);

    IoOut.addToOut('action2', null, 5, function () {
      // console.log('action2 callback');
      expect(callback2Res).to.eql(false);
      callback2Res = true;
      expect(callback1Res).to.eql(true);
      expect(callback3Res).to.eql(false);
      expect(testObj.value).to.eql(6);
    });

    expect(callback2Res).to.eql(false);
    expect(testObj.value).to.eql(0);

    IoOut.runAllOutputs(function () {
      // console.log('runAll callback');
      expect(callback3Res).to.eql(false);
      callback3Res = true;
      expect(callback1Res).to.eql(true);
      expect(callback2Res).to.eql(true);
      testObj.value = 7
    });

    expect(callback3Res).to.eql(false);
    expect(testObj.value).to.eql(0);

    expect(IoOut.input.length).to.eql(0)
    IoOut.addToIn({command: 'action1', section: null, value: 4}) //runs
    IoOut.addToIn({command: 'action1', section: null, value: 20}) //queued
    expect(IoOut.input.length).to.eql(1)
    IoOut.addToIn({command: 'action2', section: null, value: 6}) //runs
    IoOut.addToIn({command: 'action2', section: null, value: 6}) //queued
  })

  it('should queue commands in the correct order and should update before triggering the correct callbacks on response (with sections)', function(){
    var Obj = function (val) {
      this.value = val;
      this.update = function (command, section, value) {
        this.value = value;
        // console.log('update', this.value)
      }
      this.action1 = function () {
        // console.log('action1')
        this.value += 10;
      }
      this.action2 = function () {
        // console.log('action2')
        this.value += 100;
      }
    }
    var sentFirst = false
    var send = function (toLevel, taskObj) {
      expect(taskObj.value).to.eql(!sentFirst && taskObj.command === 'action1' ? 3 : 5)
      sentFirst = true
    }

    var testObj = new Obj(0);
    var Io = new IoHandler(1, 0, testObj, send);

    // var IoIn = new IoHandler(0, 1, testObj0.update.bind(testObj0), IoHandler.prototype.addToOut.bind(IoIn))

    var callback1Res = false;
    var callback2Res = false;
    var callback3Res = false;

    var callbackCounter = 0

    var callback = function () {
      callbackCounter++
      if(callbackCounter === 1) {
      // console.log('action1 callback');
        expect(callback1Res).to.eql(false);
        callback1Res = true;
        expect(callback2Res).to.eql(false);
        expect(callback3Res).to.eql(false);
        expect(testObj.value).to.eql(4)
      } else {
        // console.log('action2 callback');
        expect(callback2Res).to.eql(false);
        callback2Res = true;
        expect(callback1Res).to.eql(true);
        expect(callback3Res).to.eql(false);
        expect(testObj.value).to.eql(6);
      }
    }

    Io.addToOut('action1', 1, 3, callback);

    expect(callback1Res).to.eql(false);
    expect(testObj.value).to.eql(0);

    Io.addToOut('action2', 2, 5, callback);

    expect(callback2Res).to.eql(false);
    expect(testObj.value).to.eql(0);

    Io.runAllOutputs(function () {
      // console.log('runAll callback');
      expect(callback3Res).to.eql(false);
      callback3Res = true;
      expect(callback1Res).to.eql(true);
      expect(callback2Res).to.eql(true);
      testObj.value = 7
    });

    expect(callback3Res).to.eql(false);
    expect(testObj.value).to.eql(0);

    expect(Io.input.length).to.eql(0)
    Io.addToIn({command: 'action1', section: null, value: 4}) //runs
    Io.addToIn({command: 'action1', section: null, value: 20}) //queued
    expect(Io.input.length).to.eql(1)
    Io.addToIn({command: 'action2', section: null, value: 6}) //runs
    Io.addToIn({command: 'action2', section: null, value: 6}) //queued
  })

});

describe('IOHandler Upstream Connection', function () {
  it('should update and make correct function call on command from upstream', function () {
    var Obj = function (val) {
      this.value = val;
      this.update = function (command, section, value) {
        this.value = value;
        // console.log('update', this.value)
      }
      this.run = function (command, section) {
        this[command](section);
      }
      this.action3 = function () {
        // console.log('action3')
        this.value += 10;
      }
      this.action4 = function () {
        // console.log('action4')
        this.value += 100;
      }
    }
    var testObj = new Obj;
    var sentFirst = false
    var send = function (toLevel, taskObj) {
      
    }
    Io = new IoHandler(0,1, testObj, send)
    Io.addToIn({command: 'action3', section: null, value: 7});
    expect(testObj.value).to.be.eql(17);
    Io.addToIn({command: 'action4', section: null, value: 9});
    expect(testObj.value).to.be.eql(109);
  })
})
