var synaptic = require('../synaptic/src/synaptic.js');
var Neuron = require('../synaptic/src/neuron.js')
var Layer = synaptic.Layer;
var Network = synaptic.Network;

// console.log('\nBASIC LSTM\n')
// var weights = [];
// var biases = [];
// for(var k = 0; k < 8; ++k) {
//   weights.push(Math.random()*0.2 - 0.1)
//   biases.push(Math.random()*0.2 - 0.1)
// }

var weights = [ 0.0720500576775521,
  -0.0836279911454767,
  0.08654574961401523,
  -0.05911036999896169,
  0.03508460135199129,
  -0.0350149180740118,
  0.037777353543788195,
  -0.09014635630883278 ]
var biases = [ -0.0033765589352697106,
  0.049169979896396404,
  0.07471619490534068,
  0.08511151797138156,
  -0.07658589631319046,
  -0.03844784270040691,
  0.07349119186401368,
  -0.04294455344788731 ]

console.log('var weights =', weights);
console.log('var biases =', biases);

var neurons = [];

for(var i = 0; i < 8; ++i) {
  neurons.push(new Neuron)
  neurons[i].bias = biases[i]
}

neurons[5].bias = 0;

neurons[6].bias = 0;

neurons[4].squash = Neuron.squash.TANH

neurons[5].squash = Neuron.squash.TANH

neurons[6].squash = function (x) { return x}

  var connections = [];
  connections.push(neurons[0].project(neurons[1], weights[0]))
  connections.push(neurons[0].project(neurons[2], weights[1]))
  connections.push(neurons[0].project(neurons[3], weights[2]))
  connections.push(neurons[0].project(neurons[4], weights[3]))

  connections.push(neurons[4].project(neurons[5], 1)) //4
  connections.push(neurons[5].project(neurons[5], 1)) //5
  connections.push(neurons[5].project(neurons[6], 1)) //6
  connections.push(neurons[6].project(neurons[7], weights[4]))

  neurons[1].gate(connections[5])
  neurons[2].gate(connections[4])
  neurons[3].gate(connections[6])

  var activations = [];
  activations[0] = neurons[0].activate(1);
  activations[1] = neurons[1].activate();
  activations[2] = neurons[2].activate();
  activations[3] = neurons[3].activate();
  activations[4] = neurons[4].activate();
  activations[5] = neurons[5].activate();
  activations[6] = neurons[6].activate();
  activations[7] = neurons[7].activate();

  var errors = [];
  var newWeights = [];
  var newBiases = [];
  var projErr = [];
  var gateErr = [];
  var elegibility = [];
  var extended = [];

  neurons[7].propagate(0.1, 1)
  neurons[6].propagate(0.1)
  neurons[6].bias = 0;
  connections[6].weight = 1;
  neurons[5].propagate(0.1)
  neurons[5].bias = 0;
  connections[4].weight = 1;
  connections[5].weight = 1;
  neurons[1].propagate(0.1)
  neurons[2].propagate(0.1)
  neurons[3].propagate(0.1)
  neurons[4].propagate(0.1)
  neurons[0].propagate(0.1)

  for(var i = 0; i < neurons.length; ++i) {
    elegibility.push(neurons[i].trace.elegibility);
    extended.push(neurons[i].trace.extended);
    errors.push(neurons[i].error.responsibility);
    projErr.push(neurons[i].error.projected);
    gateErr.push(neurons[i].error.gated);
    newBiases.push(neurons[i].bias);
  }
  for(var j = 0; j < connections.length; ++j) {
    newWeights.push(connections[j].weight)
  }
console.log('var activations =', activations)
console.log('var elegibility = ', elegibility)
console.log('var extendedElegibility =', extended)
console.log('var errors =', errors)
console.log('var projError =', projErr)
console.log('var gateError =', gateErr)
console.log('var newBiases =', newBiases)
console.log('var newWeights =', newWeights)
