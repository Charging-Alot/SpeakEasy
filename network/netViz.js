var synaptic = require('./synaptic/src/synaptic.js');
var LSTM = synaptic.Architect.LSTM;

var net = new LSTM(1, 1, 1);

var printNet = function(n) {
  var nodeArr = net.toJSON();
  var neurons = nodeArr.neurons;
  var connections = nodeArr.connections
  console.log('neurons')
  // for(var i = 0; i < neurons.length; i++) {
  //   console.log(i, neurons[i]);
  // }
  console.log('connections')
  for(var i = 0; i < connections.length; i++) {
    console.log(i, connections[i]);
  }
}

// printNet(net);
// net.activate([1]);
// console.log('111111111111111111111111111111111111111111111111111111111111111111111111');
// printNet(net)

// net.activate([0]);
// console.log('222222222222222222222222222222222222222222222222222222222222222222222222');
// printNet(net)

// console.log('TRACETRACETRACETRACETRACETRACETRACETRACETRACETRACETRACETRACE');
function checkTrace () {
  var neurons = net.neurons();
  neurons.forEach(function (neuron, index) {
    console.log('neuron:', neuron.neuron.ID) 
    // console.log(neuron.neuron)
    // for(connection in neuron.neuron.connections.inputs) {
    //   console.log('connection: ', neuron.neuron.connections.inputs[connection].ID)
    //     console.log('from: ', neuron.neuron.connections.inputs[connection].from.ID)
    //     console.log('to: ', neuron.neuron.connections.inputs[connection].to.ID)
    // }
    console.log('trace.influences:', neuron.neuron.trace.influences)
    // var types = {'inputs':true, 'gated': true, 'projected': true}
    // for(t in types) {
    //   for(i in neuron.neuron.connections[t]) {
    //     console.log('connection', neuron.neuron.connections[t][i].ID)
    //     console.log('t, i', t, i)
    //     console.log('connections', t, i, neuron.neuron.connections[t][i].from.ID);
    //     console.log('connections', t, i, neuron.neuron.connections[t][i].to.ID)
    //   }
    // }
  })
}
console.log('START');
checkTrace()
// net.activate([0, 0]);
// console.log('ACTIVATE NET')
// checkTrace()
// net.propagate(0.1, [1,1]);
// console.log('PROPAGATE NET')
// checkTrace()
// console.log('START');
// checkTrace()
// net.activate([0,0]);
// console.log('ACTIVATE NET')
// checkTrace()
// net.propagate(0.1, [1,1]);
// console.log('PROPAGATE NET')
// checkTrace()

// printNet(net.connections);

var n = new synaptic.Neuron();

console.log('ACTIVATE!', n.activate(1))
console.log('PROPAGATE!', n.propagate(1))
