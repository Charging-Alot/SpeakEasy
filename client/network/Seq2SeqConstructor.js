if(module) {
  var Mother = require('./MotherConstructor.js').Mother;
  var MakeLSTMNetwork = require('./LSTMNetworkConstructor.js').MakeLSTMNetwork;
  var fs = require('fs');
}

var Seq2SeqServer = function (arrayOfLayerSizes, send) {
  this.enc = new Mother(null, send);
  this.enc.model = MakeLSTMNetwork(arrayOfLayerSizes, 0.1, 5)
  this.dec = new Mother(null, send);
  this.dec.model = MakeLSTMNetwork(arrayOfLayerSizes, 0.1, 5)
  this.saveTo = this.enc
  this.callResponseList = [];
  this.callResponseCounter = -1;
}

Seq2SeqServer.prototype.input = function (object) {
  this.saveTo.input(object)
}

Seq2SeqServer.prototype.trainCallResponse = function (call, response, callback) {
  var i = 0;
  this.call = call;
  this.response = response;
  this.trainCall(0, this.trainResponse.bind(this, 0, callback));
}

Seq2SeqServer.prototype.trainCall = function (index, callback) {
  console.log('call')
  this.saveTo = this.enc
  if(index < this.call.length) {
    this.enc.activate(this.call[index], 
      this.enc.backPropagate.bind(this.enc, this.response[this.call.length - 1 - index], 
        this.trainCall.bind(this, index + 1, 
          callback.bind(this)
          )
        )
      );
  } else {
    callback.call(this);
  }
}

Seq2SeqServer.prototype.trainResponse = function (index, callback) {
  console.log('response')
  this.saveTo = this.dec
  if(index === 0) {
    this.setDecoderState()
  }
  if(index < this.response.length - 1) {
    this.dec.activate(this.response[index], 
      this.dec.backPropagate.bind(this.dec, this.response[index + 1], 
        this.trainResponse.bind(this, index + 1,
          callback.bind(this)
          )
        )
      );
  } else {
    this.dec.activate(this.response[index], callback.bind(this))
    // callback.call(this);
  }
}

Seq2SeqServer.prototype.setDecoderState = function () {
  for(var i = 0; i < this.enc.model.layers.length; ++i) {
    for(var j = 0; j < this.enc.model.layers[i].length; ++j) {

      if(this.enc.model.layers[i][j].type === 'network') {

        for(var k = 0; k < this.enc.model.layers[i][j].layers.length; ++k) {
          for(var l = 0; l < this.enc.model.layers[i][j].layers[k].length; ++l) {
            this.enc.model.layers[i][j].layers[k][l].node.state = this.dec.model.layers[i][j].layers[k][l].node.state
          }
        }

      } else {

        this.dec.model.layers[i][j].node.state = this.enc.model.layers[i][j].node.state;

      }
    }
  }
}

Seq2SeqServer.prototype.getNewPairs = function () {
  console.log('done!!!')
}

Seq2SeqServer.prototype.trainPairs = function (callback) {
  console.log('training #', this.callResponseCounter)
  if(this.callResponseCounter < this.callResponseList.length - 1) {
    ++this.callResponseCounter;
    this.trainCallResponse(
      this.callResponseList[this.callResponseCounter].call, 
      this.callResponseList[this.callResponseCounter].response, 
      this.trainPairs.bind(this, callback)
      )
  } else if(callback) {
    callback();
  } else {
    this.getNewPairs();
  }
}

Seq2SeqServer.prototype.loadPairs = function () {
  console.log('loading!!!')
  var calls = JSON.parse(fs.readFileSync('./encoder'));
  var responses = JSON.parse(fs.readFileSync('./decoder'));
  this.transposeArrays(calls, responses)
}

Seq2SeqServer.prototype.transposeArrays = function (calls, responses) {
  for(var i = 0; i < calls.length; ++i) {
    for(var j = 0; j < calls[i].length; ++j) {
      if(!this.callResponseList[j]) {
        this.callResponseList[j] = {call: [], response: []};
      }
      this.callResponseList[j].call[i] = calls[i][j];
    }
  }
  for(var k = 0; k < responses.length; ++k) {
    for(var l = 0; l < responses[k].length; ++l) {
      this.callResponseList[l].response[k] = responses[k][l];
    }
  }
}

if(module) {
  exports.Seq2SeqServer = Seq2SeqServer
}

