// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

import { resolve } from 'path';
import { convertSlashesForWindows, ProjectTask } from '../ProjectTask';
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

describe('ProjectTask', () => {
  describe('with simple \'my-task\' task', () => {
    const rushFilename: string = resolve(__dirname, 'repo', 'rush.json');
    const rushConfiguration: RushConfiguration = RushConfiguration.loadFromConfigurationFile(rushFilename);
    const packageChangeAnalyzer: PackageChangeAnalyzer = new PackageChangeAnalyzer(rushConfiguration);

    it('executes the task', () => {
      const project: RushConfigurationProject = rushConfiguration.projectsByName.get('a')!;
      const writer: ITaskWriter = Interleaver.registerTask('foo');
      const projectTask: ProjectTask = new ProjectTask({
        rushProject: project,
        rushConfiguration,
        commandToRun: 'my-task',
        customParameterValues: [],
        isIncrementalBuildAllowed: false,
        ignoreMissingScript: false,
        packageChangeAnalyzer
      });
      expect.assertions(1);
      return expect(projectTask.execute(writer)).resolves.toEqual('SUCCESS');
    });
  });
});
