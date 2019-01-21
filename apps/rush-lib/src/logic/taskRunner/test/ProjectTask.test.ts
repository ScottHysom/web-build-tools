// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

// Mock child_process.spawn so we can verify tasks are (or are not) invoked as we expect
jest.mock('child_process');

import { resolve } from 'path';
import { convertSlashesForWindows, ProjectTask } from '../ProjectTask';
import { SpawnOptions } from 'child_process';
import { RushConfiguration } from '../../../api/RushConfiguration';
import { RushConfigurationProject } from '../../../api/RushConfigurationProject';
import { PackageChangeAnalyzer } from '../../PackageChangeAnalyzer';
import { Interleaver, ITaskWriter } from '@microsoft/stream-collator';

describe('convertSlashesForWindows()', () => {
  it('converted inputs', () => {
    expect(convertSlashesForWindows('./node_modules/.bin/tslint -c config/tslint.json'))
      .toEqual('.\\node_modules\\.bin\\tslint -c config/tslint.json');
    expect(convertSlashesForWindows('/blah/bleep&&/bloop')).toEqual('\\blah\\bleep&&/bloop');
    expect(convertSlashesForWindows('/blah/bleep')).toEqual('\\blah\\bleep');
    expect(convertSlashesForWindows('/blah/bleep --path a/b')).toEqual('\\blah\\bleep --path a/b');
    expect(convertSlashesForWindows('/blah/bleep>output.log')).toEqual('\\blah\\bleep>output.log');
    expect(convertSlashesForWindows('/blah/bleep<input.json')).toEqual('\\blah\\bleep<input.json');
    expect(convertSlashesForWindows('/blah/bleep|/blah/bloop')).toEqual('\\blah\\bleep|/blah/bloop');
  });
  it('ignored inputs', () => {
    expect(convertSlashesForWindows('/blah\\bleep && /bloop')).toEqual('/blah\\bleep && /bloop');
    expect(convertSlashesForWindows('cmd.exe /c blah')).toEqual('cmd.exe /c blah');
    expect(convertSlashesForWindows('"/blah/bleep"')).toEqual('"/blah/bleep"');
  });
});

/**
 * Interface definition for a test context for the ProjectTask.
 */
interface IProjectTestContext {
  projectTask: ProjectTask;
  writer: ITaskWriter;
}

/**
 * Helper to set up a test context for the ProjectTask.
 */
function getProjectTestContext(projectName: string, taskName: string): IProjectTestContext {
  const rushFilename: string = resolve(__dirname, 'repo', 'rush.json');
  const rushConfiguration: RushConfiguration = RushConfiguration.loadFromConfigurationFile(rushFilename);
  const packageChangeAnalyzer: PackageChangeAnalyzer = new PackageChangeAnalyzer(rushConfiguration);
  const project: RushConfigurationProject = rushConfiguration.projectsByName.get(projectName)!;
  const writer: ITaskWriter = Interleaver.registerTask(taskName);
  const projectTask: ProjectTask = new ProjectTask({
    rushProject: project,
    rushConfiguration,
    commandToRun: taskName,
    customParameterValues: [],
    isIncrementalBuildAllowed: false,
    ignoreMissingScript: false,
    packageChangeAnalyzer
  });

  return {
    projectTask,
    writer
  };
}

/**
 * See `__mocks__/child_process.js`.
 */
interface IMockSpawnConfig {
  emitError: boolean;
  returnCode: number;
}

/**
 * Configure the `child_process` `spawn` mock for these tests. This relies on the mock implementation
 * in `__mocks__/child_process.js`.
 */
function mockSpawnResponse(options?: IMockSpawnConfig): jest.Mock {
  // tslint:disable-next-line: no-any
  const cpMocked: any = require('child_process');
  cpMocked.__setSpawnResponse(options);

  const spawnMock: jest.Mock = cpMocked.spawn;
  spawnMock.mockName('spawn');
  return spawnMock;
}

describe('ProjectTask', () => {
  describe('running \'my-task\' task', () => {
    let context: IProjectTestContext;
    let spawnMock: jest.Mock;

    beforeEach(() => {
      context = getProjectTestContext('a', 'my-task');
      spawnMock = mockSpawnResponse();
    });

    afterEach(() => {
      // Reset so we can re-register a task with the same name for the tests
      Interleaver.reset();
    });

    it('runs the task once', () => {
      expect.hasAssertions();
      return context.projectTask.execute(context.writer)
        .then(() => {
          expect(spawnMock).toHaveBeenCalledTimes(1);
        });
    });

    it('returns SUCCESS', () => {
      expect.hasAssertions();
      return expect(context.projectTask.execute(context.writer)).resolves.toEqual('SUCCESS');
    });

    describe('environment variables', () => {
      it('adds \'rush_command\'', () => {
        expect.hasAssertions();
        debugger;
        return context.projectTask.execute(context.writer)
          .then(() => {
            const optionsParam: SpawnOptions = spawnMock.mock.calls[0][2];
            expect(optionsParam).toEqual(expect.objectContaining({ env: expect.any(Object) }));
            expect(optionsParam.env).toEqual(expect.objectContaining({ rush_command: expect.any(String) }));
            expect(optionsParam.env.rush_command).toEqual('my-task');
          });
      });
    });
  });
});
