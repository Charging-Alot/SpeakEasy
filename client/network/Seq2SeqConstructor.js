if(module) {
  var Mother = require('./MotherConstructor.js').Mother;
  var MakeLSTMNetwork = require('./LSTMNetworkConstructor.js').MakeLSTMNetwork;
  var fs = require('fs');
}
/*
 * Sequence to Sequence Server Constructor
 * Creates a controller for sequence to sequence translation.
 * Specifically trains a model similar to tensorFlow's encoder/decoder setup using a basic lstm network.
 * Should be called with the new keyword.
 *
 * @param {arrayOfLayerSizes} array of numbers - Array of numbers indicating the size of each layer.
 * @param {sendFunction} function - A function which takes a number indicating the level the message is meant to go to, followed by a string containing the message to be sent
 */
var Seq2SeqServer = function (arrayOfLayerSizes, sendFunction) {
  this.enc = new Mother(null, sendFunction);
  this.enc.model = MakeLSTMNetwork(arrayOfLayerSizes, 0.1, 5)
  this.dec = new Mother(null, sendFunction);
  this.dec.model = MakeLSTMNetwork(arrayOfLayerSizes, 0.1, 5)
  this.saveTo = this.enc
  this.callResponseList = [];
  this.callResponseCounter = -1;
}
/*
 * Takes a string containing a task object in json and routes it to the input queue for either the encoder or decoder.
 *
 * @param {jsonString} string - String containing the task object to be used as input.
 */
Seq2SeqServer.prototype.input = function (jsonString) {
  this.saveTo.input(jsonString)
}

/*
 * Takes an array of activations for the call and an array of activations for the response and does a single step of training, then calls the callback when that step has been completed.
 * 
 * @param {call} Array of arrays of numbers - Array of activations for the encoder
 * @param {response} Array of arrays of numbers - Array of activations for the decoder (also acts as expected values for the encoder and decoder)
 * @param {callback} Function - Function to be called when this training step is complete
 */
Seq2SeqServer.prototype.trainCallResponse = function (call, response, callback) {
  var i = 0;
  this.call = call;
  this.response = response;
  this.trainCall(0, this.trainResponse.bind(this, 0, callback));
}

/*
 * Activates and backpropagates through the encoder from the given index to the end of the current call.
 * 
 * @param {index} number - Index in this.call to train from until the end of this.call
 * @param {callback} function - Function to be called after the last element of this.call has been trained
 */
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

/*
 * Activates and backPropagates through the decoder from the given index to the end of the response.
 *
 * @param {index} number - Index in this.response to train from until the end of this.response
 * @param {callback} function - Function to be called after the last element of this.response has been trained
 */
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

/*
 * Sets the initial state in each node of the decoder to be same as the parallel nodes in the encoder.
 */
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

/*
 * Iterates through all call/response pairs in the call/response list training each pair.
 *
 * @param {callback} function - Function to be called after all pairs have been trained
 */
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

/*
 * Loads the JSON objects in encoder and decoder, transposes their contents and then stores them in the call/response list
 */
Seq2SeqServer.prototype.loadPairs = function () {
  console.log('loading!!!')
  var calls = JSON.parse(fs.readFileSync('./encoder'));
  var responses = JSON.parse(fs.readFileSync('./decoder'));
  this.transposeArrays(calls, responses)
}

/*
 * Transposes the calls array and responses array and adds them to the call/response list
 *
 * @param {calls} array of arrays of arrays of numbers - contains input arrays for encoder indexed by ordinal position in their call and then by which call that they are part of
 * @param {responses} array of arrays of arrays of numbers - contains input arrays for decoder indexed by ordinal position in their response and then by which response that they are part of
 */
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

