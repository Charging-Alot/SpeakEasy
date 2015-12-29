var synaptic = require('../synaptic/src/synaptic.js');
var Neuron = require('../synaptic/src/neuron.js')
var Layer = synaptic.Layer;
var Network = synaptic.Network;

var weights = [ 
  -0.0733711616601795,
  0.03829572834074496,
  0.05767388842068613,
  -0.008777539199218157,
  0.019310780474916106,
  0.09771623467095197,
  0.07201561317779123,
  -0.006101550720632079 
]
var biases = [ 
  0.05782533055171371,
  -0.019654044089838868,
  0.06503446158021689,
  0.010771379200741643,
  0.05458700209856035,
  -0.024711737316101795,
  -0.04195384504273534,
  0.08664298541843893 
]
  // var weights = [];
  // var biases = [];
  // for(var k = 0; k < 8; ++k) {
  //   weights.push(Math.random()*0.2 - 0.1)
  //   biases.push(Math.random()*0.2 - 0.1)
  // }
  // console.log('var weights =', weights);
  // console.log('var biases =', biases);

// var layers = [];
// layers.push(new Layer(1));
// layers.push(new Layer(1));

// layers[0].list[0].bias = 0;
// layers[1].list[0].bias = biases[2];

// layers[0].list[0].project(layers[1].list[0], weights[0]);

// var net = new Network({
//   input: layers[0],
//   output: layers[1]
// })

// console.log(net.activate([1]));

// layers = [];
// layers.push(new Layer(2));
// layers.push(new Layer(2));
// layers.push(new Layer(2));

// layers[0].list[0].bias = 0;
// layers[0].list[1].bias = 0;

// layers[1].list[0].bias = biases[2];
// layers[1].list[1].bias = biases[3];

// layers[2].list[0].bias = biases[4];
// layers[2].list[1].bias = biases[5];

// layers[0].list[0].project(layers[1].list[0], weights[0]);
// layers[0].list[0].project(layers[1].list[1], weights[1]);
// layers[0].list[1].project(layers[1].list[0], weights[2]);
// layers[0].list[1].project(layers[1].list[1], weights[3]);
// var conn1 = layers[1].list[0].project(layers[2].list[0], weights[4]);
// var conn2 = layers[1].list[1].project(layers[2].list[1], weights[5]);

// layers[1].list[0].gate(conn1)
// layers[1].list[1].gate(conn2)

// net = new Network({
//   input: layers[0],
//   hidden: {
//     0: layers[1]
//   },
//   output: layers[2]
// })

// console.log(net.layers.input.list[0].activation, net.layers.input.list[1].activation)
// console.log(net.layers.hidden[0].list[0].activation, net.layers.hidden[0].list[1].activation)
// console.log(net.layers.output.list[0].activation, net.layers.output.list[1].activation)
// console.log(net.activate([1,1]))

// neurons = []

// for(var i = 0; i < 6; ++i) {
//   neurons.push(new Neuron)
//   neurons[i].bias = biases[i]
// }
//   neurons[0].project(neurons[2], weights[0])
//   neurons[0].project(neurons[3], weights[1])
//   neurons[1].project(neurons[2], weights[2])
//   neurons[1].project(neurons[3], weights[3])
//   var c1 = neurons[2].project(neurons[4], weights[4])
//   var c2 = neurons[3].project(neurons[5], weights[5])

//   neurons[2].gate(c1);
//   neurons[3].gate(c2);

//   var activations = [];
//   activations[0] = neurons[0].activate(1);
//   activations[1] = neurons[1].activate(1);
//   activations[2] = neurons[2].activate();
//   activations[3] = neurons[3].activate();
//   activations[4] = neurons[4].activate();
//   activations[5] = neurons[5].activate();

// console.log(activations)

// var squash = function (x) {
//   return 1/(1 + Math.exp(-x))
// }

// var activations = [1, 1];

// var gains = [1, 1, 1, 1, 1, 1];

// var states = [0, 0, 0, 0, 0, 0]

// activations[2] = squash(biases[2] + activations[0] * weights[0] + gains[0] + activations[1] * weights[2] + gains[2]);
// gains[4] = activations[2];
// activations[3] = squash(biases[3] + activations[0] * weights[1] + gains[1] + activations[1] * weights[3] + gains[3]);
// gains[5] = activations[3];
// activations[4] = squash(biases[4] + activations[2] * weights[4] * gains[4])
// activations[5] = squash(biases[5] + activations[3] * weights[5] * gains[5])

// console.log(activations)

// console.log(squash(1 + 0.3*0.5*0.7 + 0.4*0.6*0.8))

var layers = [];
layers.push(new Layer(1));
layers.push(new Layer(1));
// layers.push(new Layer(2));

layers[0].list[0].bias = 0;
layers[1].list[0].bias = biases[2];

var conn = layers[0].list[0].project(layers[1].list[0], weights[0]);

var net = new Network({
  input: layers[0],
  output: layers[1]
})

// layers[0].list[0].activation = 1;
// layers[1].list[0].activation = 0.4914076236469172;

// net.propagate(0.01, [3]);
layers[0].list[0].activate(1);
layers[1].list[0].activate();
console.log('activation 0', layers[0].list[0].activation)
console.log('activation 1', layers[1].list[0].activation)
layers[1].list[0].propagate(0.1, 1)
layers[0].list[0].propagate(0.1)

console.log('weight', conn.weight)
console.log('bias 0', layers[0].list[0].bias)
console.log('bias 1', layers[1].list[0].bias)

console.log('error res 0', layers[0].list[0].error.responsibility)
console.log('error res 1', layers[1].list[0].error.responsibility)

console.log('error proj 0', layers[0].list[0].error.projected)
console.log('error proj 1', layers[1].list[0].error.projected)

console.log('error gate 0', layers[0].list[0].error.gated)
console.log('error gate 1', layers[1].list[0].error.gated)

console.log('eligibilities 0', layers[0].list[0].trace.elegibility)
console.log('eligibilities 1', layers[1].list[0].trace.elegibility)



// bigger backpropagation
console.log('MONSTER BACKPROP');
neurons = []

for(var i = 0; i < 8; ++i) {
  neurons.push(new Neuron)
  neurons[i].bias = biases[i]
}
  var connections = []
  connections.push(neurons[0].project(neurons[2], weights[0]))
  connections.push(neurons[0].project(neurons[3], weights[1]))
  connections.push(neurons[1].project(neurons[2], weights[2]))
  connections.push(neurons[1].project(neurons[3], weights[3]))
  connections.push(neurons[2].project(neurons[4], weights[4]))
  connections.push(neurons[3].project(neurons[5], weights[5]))
  connections.push(neurons[4].project(neurons[6], weights[6]))
  connections.push(neurons[5].project(neurons[7], weights[7]))

  neurons[2].gate(connections[6]);
  neurons[3].gate(connections[7]);

  var activations = [];
  activations[0] = neurons[0].activate(1);
  activations[1] = neurons[1].activate(1);
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

  neurons[6].propagate(0.1, 1)
  neurons[7].propagate(0.1, 1)
  neurons[4].propagate(0.1)
  neurons[5].propagate(0.1)
  neurons[2].propagate(0.1)
  neurons[3].propagate(0.1)
  neurons[0].propagate(0.1)
  neurons[1].propagate(0.1)

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
// console.log('PROJECTED ERRORS', projErr)
// console.log('GATED ERRORS', gateErr)
console.log('var newBiases =', newBiases)
console.log('var newWeights =', newWeights)

console.log('SELF CONNECTION TEST');

var neurons = [];

for(var i = 0; i < 4; ++i) {
  neurons.push(new Neuron)
  neurons[i].bias = biases[i]
}

  var connections = []
  connections.push(neurons[0].project(neurons[1], weights[0]))
  connections.push(neurons[0].project(neurons[2], weights[1]))
  connections.push(neurons[1].project(neurons[3], weights[2]))
  connections.push(neurons[2].project(neurons[3], weights[3]))

  connections.push(neurons[2].project(neurons[2], 1))

  neurons[1].gate(connections[4]);

  // for(var q = 0; q < connections.length; ++q) {
  //   console.log(connections[q].weight, weights[q])
  // }

  var activations = [];
  activations[0] = neurons[0].activate(1);
  activations[1] = neurons[1].activate();
  activations[2] = neurons[2].activate();
  activations[3] = neurons[3].activate();

  var errors = [];
  var newWeights = [];
  var newBiases = [];
  var projErr = [];
  var gateErr = [];
  var elegibility = [];
  var extended = [];

  neurons[3].propagate(0.1, 1)
  neurons[1].propagate(0.1)
  neurons[2].propagate(0.1)
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
// console.log('PROJECTED ERRORS', projErr)
// console.log('GATED ERRORS', gateErr)
console.log('var newBiases =', newBiases)
console.log('var newWeights =', newWeights)

console.log('SECOND ORDER BASIC');

var neurons = [];

for(var i = 0; i < 5; ++i) {
  neurons.push(new Neuron)
  neurons[i].bias = biases[i]
}

  var connections = []
  connections.push(neurons[0].project(neurons[1], weights[0]))
  connections.push(neurons[1].project(neurons[2], weights[1]))
  connections.push(neurons[2].project(neurons[3], weights[2]))
  connections.push(neurons[3].project(neurons[4], weights[3]))

  var activations = [];
  activations[0] = neurons[0].activate(1);
  activations[1] = neurons[1].activate();
  activations[2] = neurons[2].activate();
  activations[3] = neurons[3].activate();
  activations[4] = neurons[4].activate();

  var errors = [];
  var newWeights = [];
  var newBiases = [];
  var projErr = [];
  var gateErr = [];
  var elegibility = [];
  var extended = [];

  neurons[4].propagate(0.1, 1)
  neurons[3].propagate(0.1)
  neurons[2].propagate(0.1)
  neurons[1].propagate(0.1)
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
// console.log('PROJECTED ERRORS', projErr)
// console.log('GATED ERRORS', gateErr)
console.log('var newBiases =', newBiases)
console.log('var newWeights =', newWeights)



