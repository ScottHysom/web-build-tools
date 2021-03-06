import { EOL } from 'os';
import { TaskRunner } from '../TaskRunner';
import { ITaskWriter } from '@microsoft/stream-collator';
import { TaskStatus } from '../TaskStatus';
import { ITaskDefinition } from '../ITask';
import { StringBufferTerminalProvider, Terminal } from '@microsoft/node-core-library';

function createDummyTask(name: string, action?: () => void): ITaskDefinition {
  return {
    name,
    isIncrementalBuildAllowed: false,
    execute: (writer: ITaskWriter) => {
      if (action) {
        action();
      }
      return Promise.resolve(TaskStatus.Success);
    }
  };
}

function checkConsoleOutput(terminalProvider: StringBufferTerminalProvider): void {
  expect(terminalProvider.getOutput()).toMatchSnapshot();
  expect(terminalProvider.getVerbose()).toMatchSnapshot();
  expect(terminalProvider.getWarningOutput()).toMatchSnapshot();
  expect(terminalProvider.getErrorOutput()).toMatchSnapshot();
}

describe('TaskRunner', () => {
  let terminalProvider: StringBufferTerminalProvider;
  let terminal: Terminal;
  let taskRunner: TaskRunner;

  beforeEach(() => {
    terminalProvider = new StringBufferTerminalProvider(true);
    terminal = new Terminal(terminalProvider);
  });

  describe('Constructor', () => {
    it('throwsErrorOnInvalidParallelism', () => {
      expect(() => new TaskRunner(false, 'tequila', false, terminal)).toThrowErrorMatchingSnapshot();
    });
  });

  describe('Dependencies', () => {
    beforeEach(() => {
      taskRunner = new TaskRunner(false, '1', false, terminal);
    });

    it('throwsErrorOnNonExistentTask', () => {
      expect(() => taskRunner.addDependencies('foo', []))
        .toThrowErrorMatchingSnapshot();
    });

    it('throwsErrorOnNonExistentDependency', () => {
      taskRunner.addTask(createDummyTask('foo'));
      expect(() => taskRunner.addDependencies('foo', ['bar']))
        .toThrowErrorMatchingSnapshot();
    });

    it('detectsDependencyCycle', () => {
      taskRunner.addTask(createDummyTask('foo'));
      taskRunner.addTask(createDummyTask('bar'));
      taskRunner.addDependencies('foo', ['bar']);
      taskRunner.addDependencies('bar', ['foo']);
      expect(() => taskRunner.execute()).toThrowErrorMatchingSnapshot();
    });

    it('respectsDependencyOrder', () => {
      const result: Array<string> = [];
      taskRunner.addTask(createDummyTask('two', () => result.push('2')));
      taskRunner.addTask(createDummyTask('one', () => result.push('1')));
      taskRunner.addDependencies('two', ['one']);
      return taskRunner
        .execute()
        .then(() => {
          expect(result.join(',')).toEqual('1,2');
          checkConsoleOutput(terminalProvider);
        })
        .catch(error => fail(error));
    });
  });

  describe('Error logging', () => {
    beforeEach(() => {
      taskRunner = new TaskRunner(false, '1', false, terminal);
    });

    const EXPECTED_FAIL: string = 'Promise returned by execute() resolved but was expected to fail';

    it('printedStderrAfterError', () => {
      taskRunner.addTask({
        name: 'stdout+stderr',
        isIncrementalBuildAllowed: false,
        execute: (writer: ITaskWriter) => {
          writer.write('Hold my beer...' + EOL);
          writer.writeError('Woops' + EOL);
          return Promise.resolve(TaskStatus.Failure);
        }
      });
      return taskRunner
        .execute()
        .then(() => fail(EXPECTED_FAIL))
        .catch(err => {
          expect(err.message).toMatchSnapshot();
          const allMessages: string = terminalProvider.getOutput();
          expect(allMessages).not.toContain('Hold my beer...');
          expect(allMessages).toContain('Woops');
          checkConsoleOutput(terminalProvider);
        });
    });
  });
});
