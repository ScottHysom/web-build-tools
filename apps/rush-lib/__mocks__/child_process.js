const EventEmitter = require('events');

const childProcess = jest.genMockFromModule('child_process');
childProcess.spawn.mockImplementation(spawn);
childProcess.__setSpawnResponse = __setSpawnResponse;

let mockSpawnConfig = initSpawnResponse();

/**
 * Helper to initialize how the `spawn` mock should behave.
 */
function initSpawnResponse(spawnConfig) {
  const config = spawnConfig || {};
  return {
    emitError: typeof config.emitError !== 'undefined' ? config.emitError : false,
    returnCode: typeof config.returnCode !== 'undefined' ? config.returnCode : 0
  };
}

/**
 * Initialize the `spawn` mock behavior.
 */
function __setSpawnResponse(spawnConfig) {
  mockSpawnConfig = initSpawnResponse(spawnConfig);
}

/**
 * Mock of `spawn`.
 */
function spawn(file, args, options) {
  const cpMock = new childProcess.ChildProcess();

  // Add working event emitters ourselves since `genMockFromModule` does not add them because they
  // are dynamically added by `spawn`.
  const cpEmitter = new EventEmitter();
  const cp = Object.assign({}, cpMock, {
    stdin: new EventEmitter(),
    stdout: new EventEmitter(),
    stderr: new EventEmitter(),
    on: cpEmitter.on,
    emit: cpEmitter.emit
  });

  setTimeout(() => {
    cp.stdout.emit('data', `${file} ${args}: Mock task is spawned`)

    if (mockSpawnConfig.emitError) {
      cp.stderr.emit('data', `${file} ${args}: A mock error occurred in the task`)
    }

    cp.emit('close', mockSpawnConfig.returnCode);
  }, 0);

  return cp;
}

module.exports = childProcess;
