describe('Neuron Constructor', function () {
  it('when not provided input should create a neuron with the correct fields', function () {
    var n = new Neuron;
    expect(n.node).to.eql({});
    expect(n.gatedNodes).to.eql({});
    expect(n.connections.inputs).to.eql([]);
    expect(n.connections.outputs).to.eql([]);
    expect(n.connections.gated).to.eql([]);
  });
  it('when provided input, should initialize all inputs provided', function () {
    var n = new Neuron({
      node: {
        id: 1
      },
      connections: {
        inputs: [
          {
            id: 2
          },
          {
            id:3
          }
        ],
        outputs: [
          {
            id: 4
          }
        ]
      },
    })
    expect(n.node.id).to.eql(1);
    expect(n.connections.inputs[0].id).to.eql(2);
    expect(n.connections.inputs[1].id).to.eql(3);
    expect(n.connections.inputs[2]).to.eql(undefined);
    expect(n.connections.outputs[0].id).to.eql(4);
    expect(n.connections.outputs[1]).to.eql(undefined);
    expect(n.connections.gated).to.eql([]);
    expect(n.gatedNodes).to.eql({})
    n = new Neuron({
      gatedNodes: {
        3: {
          id:1
        }
      }
    })
    expect(n.gatedNodes[3].id).to.eql(1);
    expect(n.node).to.eql({})
  });
  it('when update is called, replaces all properties in the input, and no others', function () {
    var n = new Neuron()
    n.node.id = 5;
    n.node.layerId = 0;
    n.connections.inputs.push({id:7}, {id:12})
    n.connections.outputs.push({id:3})
    n.update('derp', 3, {
      node: {
        id: 4
      },
      connections: {
        inputs: [
          {weight: 0.3},
          {weight: 0.5}
        ]
      }
    })
    expect(n.node.id).to.eql(4)
    expect(n.node.layerId).to.eql(0)
    expect(n.connections.inputs[0].id).to.eql(7)
    expect(n.connections.inputs[1].id).to.eql(12)
    expect(n.connections.inputs[0].weight).to.eql(0.3)
    expect(n.connections.inputs[1].weight).to.eql(0.5)
    expect(n.connections.outputs[0].id).to.eql(3)
    expect(n.connections.outputs[0].weight).to.eql(undefined)
  });
})

describe('Pleb Constructor', function () {
  it('on update, should initialize a completely new neuron without any old values.', function () {
    var neurons = {
      activationStep: {
        node: {
          state: 1
        },
        connections: {
          inputs: [
            {
              id:0,
              weight: 0.3,
              gain: 0.5,
              activation: 0.7
            },
            {
              id:1,
              weight: 0.4,
              gain:0.6,
              activation: 0.8
            }
          ]
        }
      },
      influenceStep: {
        node: {
          id: 1,
          layerId: 2
        },
        connections: {
          gated: [
            {
              toNodeId: 1,
              toLayerId: 3,
              weight: 0.78,
              activation: 0.7
            },
            {
              toNodeId: 1,
              toLayerId: 3,
              weight: 0.2,
              activation:0.5
            }
          ]
        },
        gatedNodes: {
          1: {
            id: 1,
            layerId: 3,
            prevState: 0.8,
            selfConnection: {
              gateId: 1,
              gateLayer: 2,
              wieght: 0.67,
              gain: 0.4,
            }
          }
        }
      },
      ElegibilityStep: {
        node: {
          elegibilities: [
            0.3,
            0.4
          ],
          selfConnection: {
            weight: 0.5,
            gain: 0.1
          }
        },
        connections : {
          inputs: [
            {
              id:5,
              activation: 0.8,
              gain: 0.3 
            },
            {
              id:9,
              activation: 0.43,
              gain: 0.44
            }
          ]
        }
      },
      extendedElegibilityStep: {
        node:{
          derivative:0.9,
          elegibilities: [
            0.3,
            0.6
          ],
          extendedElegibilities: {
            1: [.3, .4]
          }
        },
        gatedNodes: {
          1: {
            selfConnection: {
              weight: 0.2,
              gain: 0.5
            },
            influence: 3
          }
        }
      }
    }
    var n = new Pleb(undefined, function (toLevel, obj) {
      console.log('sent: ', obj, ' to: ', toLevel)
    });
    var freshNeuron;
    for(var i in neurons) {
      n.update('derp', null, neurons.activationStep);
      freshNeuron = new Neuron(neurons.activationStep);
      expect(n.node).to.eql(freshNeuron.node);
      expect(n.connections).to.eql(freshNeuron.connections);
      expect(n.gatedNodes).to.eql(freshNeuron.gatedNodes);
    }
  });
  it('on activationStep, should send an object containing the correct state, activation and derivative', function () {
    var n = new Pleb({
      node: {
        state: 1
      },
      connections: {
        inputs: [
          {
            id:0,
            weight: 0.3,
            gain: 0.5,
            activation: 0.7
          },
          {
            id:1,
            weight: 0.4,
            gain:0.6,
            activation: 0.8
          }
        ]
      },
      inputNodes: [ 
        {
          activation: 0.7,
        },
        {
          activation: 0.8
        }
      ]
    }, function (toLevel, taskObj) {
      expect(taskObj.value.node.state).to.eql(1.297);
      expect(taskObj.value.node.activation).to.eql(0.785329655012861);
      expect(taskObj.value.node.derivative).to.eql(0.16858698797024174);
    });
    n.activationStep();
  });
  it('on influenceStep, should send an object containing the correct influence for each gated node', function () {
    var n = new Pleb({
        node: {
          id: 1,
          layerId: 2
        },
        connections: {
          gated: [
            {
              toNodeId: 1,
              toLayerId: 3,
              weight: 0.78,
              activation: 0.7
            },
            {
              toNodeId: 1,
              toLayerId: 3,
              weight: 0.2,
              activation:0.5
            }
          ]
        },
        gatedNodes: {
          1: {
            id: 1,
            layerId: 3,
            prevState: 0.8,
            selfConnection: {
              gateId: 1,
              gateLayer: 2,
              wieght: 0.67,
              gain: 0.4,
            }
          }
        }
    }, function (toLevel, taskObj) {
      expect(taskObj.value.node.influences[1]).to.eql(0.8 + 0.78*0.7 + 0.2*0.5)
    })
    n.influenceStep();
  });
  it('on elegibilityStep, should send an object containing the correct elegibility for each input connection', function () {
    var n = new Pleb({
      node: {
        elegibilities: [
          0.3,
          0.4
        ],
        selfConnection: {
          weight: 0.5,
          gain: 0.1
        }
      },
      connections : {
        inputs: [
          {
            id:5,
            activation: 0.8,
            gain: 0.3 
          },
          {
            id:9,
            activation: 0.43,
            gain: 0.44
          }
        ]
      },
      inputNodes: [
        {
          activation: 0.8
        },
        {
          activation:0.43
        }
      ]
    }, function (toLevel, taskObj) {
      var el0 = 0.3*0.5*0.1 + 0.8*0.3;
      var el1 = 0.4*0.5*0.1 + 0.43*0.44;
      expect(taskObj.value.node.elegibilities).to.eql([el0, el1])
    })
    n.elegibilityStep();
  });
  it('on extendedElegibilityStep, should send an object containing, the correct elegibilities for every input connection for every gated Node', function () {
    var n = new Pleb({
      node:{
        derivative:0.9,
        elegibilities: [
          0.3,
          0.6
        ],
        influences: {
          1: 3
        },
        extendedElegibilities: {
          1: [0.3, 0.4]
        }
      },
      gatedNodes: {
        1: {
          selfConnection: {
            weight: 0.2,
            gain: 0.5
          },
        }
      }
    }, function (toLayerId, taskObj) {
      var exEl0 = 0.3 * 0.2 * 0.5 + 0.9 * 0.3 * 3;
      var exEl1 = 0.4 * 0.2 * 0.5 + 0.9 * 0.6 * 3;
      expect(taskObj.value.node.extendedElegibilities[1]).to.eql([exEl0, exEl1])
    });
    n.extendedElegibilityStep(1)
  });
  it('on projectedErrorStep, should send an object containing the correct projected Error', function () {
    var sentSomething = false;
    var n = new Pleb({
      node: {
        derivative: 37
      },
      connections: {
        outputs: [
          {
            errorResponsibility: 4,
            gain: 90,
            weight: 1000
          },
          {
            errorResponsibility: 20,
            gain: 21,
            weight: 23
          }
        ]
      },
      outputNodes: [
        {
          errorResponsibility: 4
        },
        {
          errorResponsibility: 20
        }
      ]
    }, function (toLevel, taskObj) {
      sentSomething = true;
      if(taskObj.command === 'projectedErrorStep') {
        expect(taskObj.value.node.errorProjected).to.eql((4*90*1000 + 20*21*23) * 37)
      } else {
        expect('YOUR KUNGFU IS WEAK').to.eql(true)
      }
    })
    n.projectedErrorStep();
    expect(sentSomething).to.eql(true)
  })
  it('on gatedErrorStep, should send an object containing the correct gated error', function () {
    var sentSomething = false;
    var n = new Pleb({
      node: {
        id: 1,
        layerId: 1,
        derivative: 42
      },
      connections: {
        gated: [
          {
            toNodeId: 3,
            weight: 76,
            activation: 67
          },
          {
            toNodeId: 4,
            weight: 83,
            activation: 32
          }
        ]
      },
      gatedNodes: {
        3: {
          id: 3,
          prevState: 65,
          selfConnection: {
            gateId: 1,
            gateLayerId: 1
          },
          errorResponsibility: 34
        },
        4: {
          id: 4,
          prevState: 2,
          selfConnection: {
            gateId: 3,
            gateLayerId: 6
          },
          errorResponsibility: 23
        }
      }
    }, function (toLevel, taskObj) {
      sentSomething = true
      expect(taskObj.command).to.eql('gatedErrorStep')
      expect(taskObj.value.node.errorGated).to.eql(((65+76*67)*34 + 83*32*23)*42 )
    })
    n.gatedErrorStep();
    expect(sentSomething).to.eql(true)
  })
  it('on learningStep, should send an object containing the correct weights for each input connection', function () {
    var sentSomething = false;
    var n = new Pleb({
      rate: 62,
      maxGradient: 1000000,
      node: {
        errorProjected: 76,
        errorResponsibility: 82,
        elegibilities: [
          3,
          94
        ],
        extendedElegibilities: {
          1: [56, 43]
        }
      },
      connections: {
        inputs: [
          {
            weight: 5,
          },
          {
            weight: 7,
          }
        ]
      },
      gatedNodes: {
        1: {
          errorResponsibility: 9
        }
      }
    }, function (toLevel, taskObj) {
      sentSomething = true;
      expect(taskObj.command).to.eql('learningStep')
      var gradient = 76  * 3 + 9 * 56;
      expect(taskObj.value.connections.inputs[0].weight).to.eql(5 + gradient*62)
      gradient = 76 * 94 + 9 * 43;
      expect(taskObj.value.connections.inputs[1].weight).to.eql(7 + gradient*62)
    })
    n.learningStep()
    expect(sentSomething).to.eql(true);
  })
  it('as above on learning step, but includes correct behavior with stricter gradient clipping', function () {
    var sentSomething = false;
    var n = new Pleb({
      rate: 62,
      maxGradient: 5,
      node: {
        errorProjected: 76,
        errorResponsibility: 82,
        elegibilities: [
          3,
          94
        ],
        extendedElegibilities: {
          1: [56, 43]
        }
      },
      connections: {
        inputs: [
          {
            weight: 5,
          },
          {
            weight: 7,
          }
        ]
      },
      gatedNodes: {
        1: {
          errorResponsibility: 9
        }
      }
    }, function (toLevel, taskObj) {
      sentSomething = true;
      expect(taskObj.command).to.eql('learningStep')
      var gradient = 76  * 3 + 9 * 56;
      expect(taskObj.value.connections.inputs[0].weight).to.eql(5 + 5*62)
      gradient = 76 * 94 + 9 * 43;
      expect(taskObj.value.connections.inputs[1].weight).to.eql(7 + 5*62)
    })
    n.learningStep()
    expect(sentSomething).to.eql(true);
  })
  it('should run the right command when a well formed taskObj is recieved by the io handler', function () {
    n = new Pleb({
      node:{
        derivative:0.9,
        elegibilities: [
          0.3,
          0.6
        ],
        extendedElegibilities: {
          1: [0.3, 0.4]
        }
      },
      gatedNodes: {
        1: {
          selfConnection: {
            weight: 0.2,
            gain: 0.5
          },
          influence: 3
        }
      }
    }, function (toLayerId, taskObj) {
    });
    var activated = false;
    n.activationStep = function () {
      activated = true;
    }
    n.toManager.addToIn({command: 'activationStep', section: 1, value: 3});
    expect(activated).to.eql(true)
  })
})

describe('manager Constructor', function () {
  it('on update, with a command of "activate" or "backPropagate", should create a completely new neuron', function () {
    var testUpdate = function (command) {
      var n = new Manager({
        node: {
          id:0
        },
        connections: {
          inputs: [
            {id: 1},
            {id: 2}
          ],
          outputs:[
            {id: 3}
          ],
          gated: [
            {id: 4}
          ]
        },
        gatedNodes: {
          5: {id: 5}
        }
      }, function () {});
      n.update(command, 3, {
        node: {
          id: 6
        },
        connections: {
          inputs: [
            {id: 7}
          ],
          outputs: [
            {id: 8},
            {id: 9}
          ],
          gated: [

          ]
        },
        gatedNodes:{
          10: {id: 10}
        }
      })
      expect(n.node.id).to.eql(6)
      expect(n.connections.inputs[0].id).to.eql(7)
      expect(n.connections.inputs[1]).to.eql(undefined)
      expect(n.connections.outputs[0].id).to.eql(8)
      expect(n.connections.outputs[1].id).to.eql(9)
      expect(n.connections.gated[5]).to.eql(undefined)
      expect(n.gatedNodes[10].id).to.eql(10)
      expect(n.gatedNodes[5]).to.eql(undefined)
    }
    testUpdate('activate')
    testUpdate('backPropagate')
  })
  it('on update, with any other command, should only change the values associated with that command', function () {
    var testUpdate = function (command) {
      var n = new Manager({
        node: {
          id:0
        },
        connections: {
          inputs: [
            {id: 1},
            {id: 2}
          ],
          outputs:[
            {id: 3}
          ],
          gated: [
            {id: 4}
          ]
        },
        gatedNodes: {
          5: {id: 5}
        }
      }, function () {});
      n.update(command, 3, {
        node: {
          id: 6,
          layerId:11
        },
        connections: {
          inputs: [
            {id: 7}
          ],
          outputs: [
            {id: 8},
            {id: 9}
          ],
          gated: [

          ]
        },
        gatedNodes:{
          10: {id: 10}
        }
      })
      expect(n.node.id).to.eql(6)
      expect(n.node.layerId).to.eql(11)
      expect(n.connections.inputs[0].id).to.eql(7)
      expect(n.connections.inputs[1].id).to.eql(2)
      expect(n.connections.outputs[0].id).to.eql(8)
      expect(n.connections.outputs[1].id).to.eql(9)
      expect(n.connections.gated[0].id).to.eql(4)
      expect(n.gatedNodes[10].id).to.eql(10)
      expect(n.gatedNodes[5].id).to.eql(5)
    }
    testUpdate('sfeyvbevbe')
  })
  it('on activate, should queue and send correct information to plebs, after should send updated model to mother', function () {
    var n = new Manager({
      node: {
        id: 0,
        layerId: 1,
        state: 2,
        bias: 2.5,
        prevState: 3,
        activation: 4,
        selfConnection: {weight: 5, gain: 6, gateId: 0, gateLayer: 0},
        elegibilities: [7, 8],
        extendedElegibilities: {
          9: [10, 11],
          12: [13, 14]
        },
        influences: {
          9: 100,
          12: 1000,
        }
      },
      connections: {
        inputs: [
          {
            id: 15,
            toNodeId: 16,
            toLayerId: 17,
            fromNodeId: 18,
            fromLayerId: 19,
            gatNodeId: 20,
            gateLayerId: 21,
            activation: 22,
            gain: 23,
            weight: 24
          }
        ],
        outputs: [
          {
            id: 25,
            toNodeId: 26,
            toLayerId: 27,
            fromNodeId: 28,
            fromLayerId: 29,
            gatNodeId: 30,
            gateLayerId: 31,
            activation: 32,
            gain: 33,
            weight: 34
          }
        ],
        gated: [
          {
            id: 45,
            toNodeId: 9,
            toLayerId: 47,
            fromNodeId: 48,
            fromLayerId: 49,
            gatNodeId: 50,
            gateLayerId: 51,
            activation: 52,
            gain: 53,
            weight: 54
          },
          {
            id: 55,
            toNodeId: 12,
            toLayerId: 57,
            fromNodeId: 58,
            fromLayerId: 59,
            gatNodeId: 60,
            gateLayerId: 61,
            activation: 62,
            gain: 63,
            weight: 64
          }
        ]
      },
      gatedNodes: {
        9: {
          id: 9,
          layerId: 47,
          state: 65,
          prevState: 66,
          activation: 67,
          selfConnection: {weight: 68, gain: 69, gateId: 0, gateLayer: 1},
          elegibilities: [70, 71],
          extendedElegibilities: {
          }
        },
        12: {
          id: 9,
          layerId: 57,
          state: 72,
          prevState: 73,
          activation: 74,
          selfConnection: {weight: 75, gain: 76, gateId: 0, gateLayer: 1},
          elegibilities: [75, 76],
          extendedElegibilities: {
          }
        }
      }
    }, function (toLevel, taskObj) {
      counter++;
      if(taskObj.command === 'activationStep') {
        expect(taskObj.value.node.state).to.eql(n.node.state);
        expect(taskObj.value.connections.inputs).to.eql(n.connections.inputs);
        n.toPleb.addToIn(taskObj) //just to trigger callback
      } else if (taskObj.command === 'influenceStep') {
        expect(taskObj.value.node.id).to.eql(n.node.id);
        expect(taskObj.value.node.layerId).to.eql(n.node.layerId);
        expect(taskObj.value.gatedNodes).to.eql(n.gatedNodes);
        expect(taskObj.value.connections.gated).to.eql(n.connections.gated);
        n.toPleb.addToIn(taskObj) //just to trigger callback
      } else if (taskObj.command === 'elegibilityStep') {
        expect(taskObj.value.node.elegibilities).to.eql(n.node.elegibilities);
        expect(taskObj.value.node.selfConnection).to.eql(n.node.selfConnection);
        expect(taskObj.value.connections.inputs).to.eql(n.connections.inputs);
        n.toPleb.addToIn(taskObj) //just to trigger callback
      } else if (taskObj.command === 'extendedElegibilityStep') {
        expect(taskObj.value.node.extendedElegibilities[taskObj.section]).to.eql(n.node.extendedElegibilities[taskObj.section])
        expect(taskObj.value.gatedNodes[taskObj.section]).to.eql(n.gatedNodes[taskObj.section])
        expect(taskObj.value.node.derivative).to.eql(n.node.derivative);
        expect(taskObj.value.node.elegibilities).to.eql(n.node.elegibilities);
        n.toPleb.addToIn(taskObj) //just to trigger callback
      } else if (taskObj.command === 'activate'){
        expect(taskObj.value.node.state).to.eql(n.node.state);
        expect(taskObj.value.node.activation).to.eql(n.node.activation);
        expect(taskObj.value.node.derivative).to.eql(n.node.derivative);
      } else {
        expect('YOUR KUNGFU IS WEAK').to.eql(true);
      }
    })
    var counter = 0;
    n.activate();
    expect(counter).to.eql(6);
  })
  it('the same but for backPropagation', function () {
    var n = new Manager({
      rate: 500,
      maxGradient: 20,
      node: {
        id: 0,
        layerId: 1,
        state: 2,
        bias: 2.5,
        prevState: 3,
        activation: 4,
        selfConnection: {weight: 5, gain: 6, gateId: 0, gateLayer: 0},
        elegibilities: [7, 8],
        extendedElegibilities: {
          9: [10, 11],
          12: [13, 14]
        },
        influences: {
          9: 100,
          12: 1000,
        }
      },
      connections: {
        inputs: [
          {
            id: 15,
            toNodeId: 16,
            toLayerId: 17,
            fromNodeId: 18,
            fromLayerId: 19,
            gatNodeId: 20,
            gateLayerId: 21,
            activation: 22,
            gain: 23,
            weight: 24
          }
        ],
        outputs: [
          {
            id: 25,
            toNodeId: 26,
            toLayerId: 27,
            fromNodeId: 28,
            fromLayerId: 29,
            gatNodeId: 30,
            gateLayerId: 31,
            activation: 32,
            gain: 33,
            weight: 34
          }
        ],
        gated: [
          {
            id: 45,
            toNodeId: 9,
            toLayerId: 47,
            fromNodeId: 48,
            fromLayerId: 49,
            gatNodeId: 50,
            gateLayerId: 51,
            activation: 52,
            gain: 53,
            weight: 54
          },
          {
            id: 55,
            toNodeId: 12,
            toLayerId: 57,
            fromNodeId: 58,
            fromLayerId: 59,
            gatNodeId: 60,
            gateLayerId: 61,
            activation: 62,
            gain: 63,
            weight: 64
          }
        ]
      },
      gatedNodes: {
        9: {
          id: 9,
          layerId: 47,
          state: 65,
          prevState: 66,
          activation: 67,
          selfConnection: {weight: 68, gain: 69, gateId: 0, gateLayer: 1},
          elegibilities: [70, 71],
          extendedElegibilities: {
          }
        },
        12: {
          id: 9,
          layerId: 57,
          state: 72,
          prevState: 73,
          activation: 74,
          selfConnection: {weight: 75, gain: 76, gateId: 0, gateLayer: 1},
          elegibilities: [75, 76],
          extendedElegibilities: {
          }
        }
      }
    }, function (toLevel, taskObj) {
      counter++;
      if(taskObj.command === 'projectedErrorStep') {
        expect(taskObj.value.node.derivative).to.eql(n.node.derivative);
        expect(taskObj.value.connections.outputs).to.eql(n.connections.outputs);
        n.toPleb.addToIn(taskObj) //just to trigger callback
      } else if (taskObj.command === 'gatedErrorStep') {
        expect(taskObj.value.node.id).to.eql(n.node.id);
        expect(taskObj.value.node.layerId).to.eql(n.node.layerId);
        expect(taskObj.value.node.derivative).to.eql(n.node.derivative);
        expect(taskObj.value.gatedNodes).to.eql(n.gatedNodes);
        expect(taskObj.value.connections.gated).to.eql(n.connections.gated);
        n.toPleb.addToIn(taskObj) //just to trigger callback
      } else if (taskObj.command === 'learningStep') {
        expect(taskObj.value.node.elegibilities).to.eql(n.node.elegibilities);
        expect(taskObj.value.node.extendedElegibilities).to.eql(n.node.extendedElegibilities);
        expect(taskObj.value.node.errorProjected).to.eql(n.node.errorProjected);
        expect(taskObj.value.rate).to.eql(n.rate);
        expect(taskObj.value.maxGradient).to.eql(n.maxGradient);
        expect(taskObj.value.gatedNodes).to.eql(n.gatedNodes);
        expect(taskObj.value.connections.inputs).to.eql(n.connections.inputs);
        n.toPleb.addToIn(taskObj) //just to trigger callback
      }  else if (taskObj.command === 'backPropagate'){
        expect(taskObj.value.node.id).to.eql(n.node.id)
        expect(taskObj.value.node.layerId).to.eql(n.node.layerId);
        expect(taskObj.value.node.errorProjected).to.eql(n.node.errorProjected);
        expect(taskObj.value.node.errorResponsibility).to.eql(n.node.errorResponsibility);
        expect(taskObj.value.node.errorGated).to.eql(n.node.errorGated);
        expect(taskObj.value.connections.inputs).to.eql(n.connections.inputs);
        expect(taskObj.value.connections.outputs).to.eql(n.connections.outputs)
      } else {
        expect('YOUR KUNGFU IS WEAK').to.eql(true);
      }
    })
    var counter = 0;
    n.backPropagate();
    expect(counter).to.eql(4);
  })
})

describe('Mother Constructor', function () {
  it('Node Factory creates a valid node', function () {
    var n = Node(1,2);
    expect(n.id).to.eql(2)
    expect(n.layerId).to.eql(1)
    expect(n.state).to.eql(0)
    expect(n.prevState).to.eql(0)
    expect(n.activation).to.eql(0)

    expect(n.selfConnection.gateId).to.eql(-1)
    expect(n.selfConnection.gateLayer).to.eql(-1)
    expect(n.selfConnection.weight).to.eql(0)
    expect(n.selfConnection.gain).to.eql(1)

    expect(typeof n.bias).to.eql('number')
  })
  it('Connection Factory creates a valid connection', function () {
    var c = Connection(1,2,0,4,3);
    expect(c.id).to.eql(3);
    expect(c.toLayerId).to.eql(1);
    expect(c.fromLayerId).to.eql(2);
    expect(c.toNodeId).to.eql(0);
    expect(c.fromNodeId).to.eql(4);
    expect(c.gateNodeId).to.eql(-1);
    expect(c.gateLayerId).to.eql(-1);
    expect(c.activation).to.eql(0);
    expect(c.gain).to.eql(1)
    expect(typeof c.weight).to.eql('number')
  })
  it('createAllNodesInLayer should create a layer object with an id and an array of nodes', function () {
    var l = Mother.prototype.createAllNodesInLayer(3, 2) 
    expect(l.id).to.eql(3);
    expect(l.nodes.length).to.eql(2);
    expect(typeof l.nodes[0].bias).to.eql('number');
    expect(typeof l.nodes[1].bias).to.eql('number');
  })
  it('joinNodes should add a connection to the correct layer that points at the correct nodes', function () {
    var m = new Mother(function () {});
    m.appendNodeLayer(1);
    m.appendNodeLayer(1);
    m.appendNodeLayer(2);
    m.joinNodes(m.nodes[1].nodes[0], m.nodes[2].nodes[1])
    var c = m.connections[2][1][0]
    expect(c.id).to.eql(0)
    expect(c.toNodeId).to.eql(1)
    expect(c.toLayerId).to.eql(2)
    expect(c.fromNodeId).to.eql(0)
    expect(c.fromLayerId).to.eql(1)
  })
  it('joinNodes should update the nodes selfConnection when a node is joined to itself', function () {
    var m = new Mother(function () {})
    m.appendNodeLayer(1);
    var n = m.nodes[0].nodes[0];
    m.joinNodes(n, n);
    expect(n.selfConnection.id !== undefined).to.eql(true);
    expect(n.selfConnection.gain).to.eql(1);
    expect(n.selfConnection.weight).to.eql(1);
  })
  it('joinLayers, when allToAll is set to true, should create valid connections from all nodes in the first layer to all nodes in the second layer', function () {
    var m = new Mother(function () {})
    m.appendNodeLayer(2);
    m.appendNodeLayer(2);
    m.joinLayers(m.nodes[0], m.nodes[1], true);
    var connections = m.connections[1][0]
    expect(connections.length).to.eql(4);
    var expected = {
      0: {
        0: false,
        1: false
      },
      1: {
        0: false,
        1: false
      }
    }
    for(var i = 0; i < connections.length; ++i) {
      var conn = connections[i]
      expect(conn.toLayerId).to.eql(1)
      expect(conn.fromLayerId).to.eql(0)
      expect(expected[conn.toNodeId][conn.fromNodeId]).to.eql(false)
      expected[conn.toNodeId][conn.fromNodeId] = true;
    }
    expect(expected[0][0] && expected[0][1] && expected[1][0] && expected[1][1]).to.eql(true)
  })
  it('joinLayers, when allToAll is set to false, should create valid connections between all nodes with the same index in each layer', function () {
    var m = new Mother(function () {});
    m.appendNodeLayer(2);
    m.appendNodeLayer(2);
    m.joinLayers(m.nodes[0], m.nodes[1], false);
    var connections = m.connections[1][0];
    expect(connections.length).to.eql(2);
    for(var i = 0; i < connections.length; ++i) {
      var conn = connections[i]
      expect(conn.toLayerId).to.eql(1)
      expect(conn.fromLayerId).to.eql(0)
      expect(connections[0].toNodeId === connections[0].fromNodeId).to.eql(true)
    }
  })
  it("gateConnection should update connection with the gating node's infromation", function () {
    var m = new Mother(function () {});
    m.appendNodeLayer(1)
    m.appendNodeLayer(1)
    m.appendNodeLayer(1)
    m.joinLayers(m.nodes[0], m.nodes[2], false);

    var connection = m.connections[2][0][0];
    var node = m.nodes[1].nodes[0];
    m.gateConnection(connection, node);
    expect(connection.gateLayerId).to.eql(node.layerId);
    expect(connection.gateId).to.eql(node.id);
  });
  it('gateLayerOneToOne should gate connections going from fromLayer to toLayer with the node at the same index as the connection', function () {
    var m = new Mother(function () {})
    m.appendNodeLayer(2);
    m.appendNodeLayer(2);
    m.appendNodeLayer(2);
    m.joinLayers(m.nodes[0], m.nodes[2], false);
    m.gateLayerOneToOne(m.nodes[1], m.nodes[0].id, m.nodes[2].id);
    var connections = m.connections[2][0];
    for(var i = 0; i < connections.length; ++i) {
      expect(connections[i].gateId).to.eql(m.nodes[1].nodes[i].id)
      expect(connections[i].gateLayerId).to.eql(m.nodes[1].nodes[i].layerId)
    }
  })
  it('initNeurons should create a complete neuron object for every node in mother', function () {
    var m = new Mother(function () {})
    m.appendNodeLayer(2);
    m.appendNodeLayer(2);
    m.appendNodeLayer(2);
    m.joinLayers(m.nodes[0], m.nodes[1], true);
    m.joinLayers(m.nodes[0], m.nodes[2], false);
    m.gateLayerOneToOne(m.nodes[1], m.nodes[0].id, m.nodes[2].id);
    m.initNeurons()
    neurons2 = m.layers[2];
    neurons1 = m.layers[1];
    neurons0 = m.layers[0];

    expect(neurons0[0].connections.outputs.length).to.eql(3)
    expect(neurons0[0].connections.outputs[0]).to.equal(neurons1[0].connections.inputs[0])
    expect(neurons0[0].connections.outputs[1]).to.equal(neurons1[1].connections.inputs[0])
    expect(neurons0[0].connections.outputs[2]).to.equal(neurons2[0].connections.inputs[0])

    expect(neurons0[1].connections.outputs.length).to.eql(3)
    expect(neurons0[1].connections.outputs[0]).to.equal(neurons1[0].connections.inputs[1])
    expect(neurons0[1].connections.outputs[1]).to.equal(neurons1[1].connections.inputs[1])
    expect(neurons0[1].connections.outputs[2]).to.equal(neurons2[1].connections.inputs[0])

    expect(neurons1[0].connections.gated[0]).to.equal(neurons2[0].connections.inputs[0])
    expect(neurons1[1].connections.gated[0]).to.equal(neurons2[1].connections.inputs[0])
  })
  it('on update, if initNeurons has been called, updates the specified neuron and no others. connections are updated across all neurons associated with them', function () {
    var m = new Mother(function () {});
    m.appendNodeLayer(2);
    m.appendNodeLayer(2)
    m.appendNodeLayer(2);
    m.joinLayers(m.nodes[0], m.nodes[1], true);
    m.joinLayers(m.nodes[0], m.nodes[2], false);
    m.gateLayerOneToOne(m.nodes[1], 0, 2);
    m.initNeurons();

    m.update('activate', 0, {
      node: {
        id: 0,
        layerId: 2,
        state: 1
      },
      connections: {
        inputs: [
          {
            id: 0,
            toLayerId: 2,
            toNodeId: 0,
            fromLayerId: 0,
            fromNodeId: 0,
            activation: 2,
          },
          {
            id:1,
            toLayerId: 2,
            toNodeId: 0,
            fromLayerId: 0,
            fromNodeId: 1,
            activation: 0.5
          }
        ]
      }
    })
    expect(m.layers[2][0].node.state).to.eql(1);
    expect(m.layers[2][1].node.state).to.eql(0);
    expect(m.layers[2][0].connections.inputs[0].activation).to.eql(2);
    expect(m.layers[2][0].connections.inputs[1].activation).to.eql(0.5);
    expect(m.layers[2][0].connections.inputs[0]).to.eql(m.layers[0][0].connections.outputs[2])
    expect(m.layers[2][1].connections.inputs[0]).to.eql(m.layers[0][1].connections.outputs[2])
    expect(m.layers[2][0].connections.inputs[0]).to.eql(m.layers[1][0].connections.gated[0])
    expect(m.layers[2][1].connections.inputs[0]).to.eql(m.layers[1][1].connections.gated[0])
  })
  it('on activation, queues and sends each neuron not in the input layer', function () {
    // console.log('mother commands start')
    var sentSomething = false
    var counter = 0;
    var m = new Mother(function (toLevel, taskObj) {
      if(taskObj.command === 'activate') {
        counter++;
        var layer = 1;
        if(counter >= 3) {
          layer = 2;
        }
        expect(taskObj.value.node).to.eql(m.layers[layer][taskObj.section].node)
        expect(taskObj.value.gatedNodes).to.eql(m.layers[layer][taskObj.section].gatedNodes)
        expect(taskObj.value.connections).to.eql(m.layers[layer][taskObj.section].connections)
        m.toManager.addToIn(taskObj);
      } else {
        expect('YOUR KUNGFU IS WEAK!').to.eql(true);
      }
    });
    m.appendNodeLayer(2);
    m.appendNodeLayer(2);
    m.appendNodeLayer(2);
    m.joinLayers(m.nodes[0], m.nodes[1], true);
    m.joinLayers(m.nodes[1], m.nodes[2], true);
    m.initNeurons();
    m.activate([1,1], function () {
      sentSomething = true;
      expect(counter).to.eql(4);
    });
    expect(sentSomething).to.eql(true)
  });
  it('on backPropagation, queues and sends each neuron not in the output layer', function () {
    var counter = 0;
    var sentSomething = false;
    var m = new Mother(function (toLevel, taskObj) {
      console.log(taskObj.command)
      if(taskObj.command === 'backPropagate') {
        counter++;
        var layer = 1;
        if(counter >= 3) {
          layer = 0;
        }
        expect(taskObj.value.node).to.eql(m.layers[layer][taskObj.section].node)
        expect(taskObj.value.gatedNodes).to.eql(m.layers[layer][taskObj.section].gatedNodes)
        expect(taskObj.value.connections).to.eql(m.layers[layer][taskObj.section].connections)
        this.addToIn(taskObj);
      } else {
        expect('YOUR KUNGFU IS WEAK!').to.eql(true);
      }
    });
    m.appendNodeLayer(2);
    m.appendNodeLayer(2);
    m.appendNodeLayer(2);
    m.joinLayers(m.nodes[0], m.nodes[1], true);
    m.joinLayers(m.nodes[1], m.nodes[2], true);
    m.initNeurons();
    m.backPropagate([1,1], function () {
      sentSomething = true;
      expect(counter).to.eql(4);
    });
    expect(sentSomething).to.eql(true);
  });
})

describe('MONSTER END TO END TEST!!!', function () {
  var mother;
  var managers = []
  var biases = [
    0,
    0,
    -0.009895327035337687,
    -0.006141480477526787,
    -0.029357955278828743,
    -0.08668609405867755
  ]
  var weights = [
    -0.03437288929708303,
    0.069337324379012,
    -0.006118636578321457,
    0.038851925032213325,
    -0.08829510072246194,
    -0.003387802373617882,
  ]
  var manager

  var pleb

  beforeEach(function() {
    mother = new Mother(function (toLevel, taskObj) {
      // debugger;
      if(toLevel === 1) {
        manager.toMother.addToIn(taskObj)
      } else {
        expect('YOUR KUNGFU IS WEAK').to.eql(true);
      }
    });

    manager = new Manager(undefined, function (toLevel, taskObj) {
      // debugger
      if(toLevel === 2) {
        mother.toManager.addToIn(taskObj);
      } else if (toLevel === 0) {
        pleb.toManager.addToIn(taskObj);
      } else {
        expect('YOUR KUNGFU IS WEAK').to.eql(true);
      }
    });

    pleb = new Pleb(undefined, function (toLevel, taskObj) {
      // debugger
      if(toLevel === 1) {
        manager.toPleb.addToIn(taskObj);
      } else {
        expect('YOUR KUNGFU IS WEAK').to.eql(true);
      }
    })

    // mother.appendNodeLayer(2);
    // mother.appendNodeLayer(2);
    // mother.appendNodeLayer(2);
    // mother.joinLayers(mother.nodes[0], mother.nodes[1], true);
    // mother.joinLayers(mother.nodes[1], mother.nodes[2], false);
    // mother.gateLayerOneToOne(mother.nodes[0], 1, 2);
    // mother.nodes[0].nodes[0].bias = biases[0];
    // mother.nodes[0].nodes[1].bias = biases[1];
    // mother.nodes[1].nodes[0].bias = biases[2];
    // mother.nodes[1].nodes[1].bias = biases[3];
    // mother.nodes[2].nodes[0].bias = biases[4];
    // mother.nodes[2].nodes[1].bias = biases[5];
    // mother.connections[1][0][0].weight = weights[0];
    // mother.connections[1][0][1].weight = weights[1];
    // mother.connections[1][0][2].weight = weights[2];
    // mother.connections[1][0][3].weight = weights[3];
    // mother.connections[2][1][0].weight = weights[4];
    // mother.connections[2][1][1].weight = weights[5];
    // mother.initNeurons();
  });
  it('should have correct activation for output nodes after activation (smallest test case)', function () {
    //numbers compared to an identical network in synaptic but with gradient clipping added
    //the code for this can be found in synapticTest.js.
    var gotToCallback = false;
    mother.appendNodeLayer(1);
    mother.appendNodeLayer(1);
    mother.joinLayers(mother.nodes[0], mother.nodes[1], true);
    mother.initNeurons();
    mother.layers[0][0].node.bias = biases[0]
    mother.layers[1][0].node.bias = biases[1]
    mother.layers[0][0].connections.outputs[0].weight = weights[0]
    // debugger;
    mother.activate([1], function () {
      gotToCallback = true;
      // debugger;
      // expect(mother.layers[0][0].node.activation).to.eql(0.5016502674455081);
      expect(mother.layers[1][0].node.activation).to.eql(0.5289042292406864);
    })
    expect(gotToCallback).to.eql(true)
  });
  it('should have correct activation for output nodes after activation (slightly larger case with gates)', function () {
    var gotToCallback = false
    mother.appendNodeLayer(2);
    mother.appendNodeLayer(2);
    mother.appendNodeLayer(2);
    mother.joinLayers(mother.nodes[0], mother.nodes[1], true);
    mother.joinLayers(mother.nodes[1], mother.nodes[2], false);
    mother.gateLayerOneToOne(mother.nodes[1], 1, 2);
    mother.nodes[0].nodes[0].bias = biases[0];
    mother.nodes[0].nodes[1].bias = biases[1];
    mother.nodes[1].nodes[0].bias = biases[2];
    mother.nodes[1].nodes[1].bias = biases[3];
    mother.nodes[2].nodes[0].bias = biases[4];
    mother.nodes[2].nodes[1].bias = biases[5];
    mother.connections[1][0][0].weight = weights[0];
    mother.connections[1][0][1].weight = weights[1];
    mother.connections[1][0][2].weight = weights[2];
    mother.connections[1][0][3].weight = weights[3];
    mother.connections[2][1][0].weight = weights[4];
    mother.connections[2][1][1].weight = weights[5];
    mother.initNeurons();
    mother.activate([1,1], function () {
      gotToCallback = true
      var activations = [ 
      1,
      1,
      0.48740595117718055,
      0.5254898256884515,
      0.4874192204543708,
      0.47810860414632056 
      ]
      var i = 0
      expect(mother.layers[0][0].node.activation).to.eql(activations[i]);
      console.log(i++)
      expect(mother.layers[0][1].node.activation).to.eql(activations[i]);
      console.log(i++)
      expect(mother.layers[1][0].node.activation).to.eql(activations[i]);
      console.log(i++)
      expect(mother.layers[1][1].node.activation).to.eql(activations[i]);
      console.log(i++) //4
      expect(mother.layers[2][0].node.activation).to.eql(activations[i]);
      console.log(i++)
      expect(mother.layers[2][1].node.activation).to.eql(activations[i]);
      console.log(i++)
    })
    expect(gotToCallback).to.eql(true)
  })

})

