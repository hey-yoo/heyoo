import { command } from '../types';
import link from './link';
import unlink from './unlink';
import run from './run';
import install from './install';

const commands: command[] = [
  {
    command: 'install <plugins>',
    action: install,
    option: [
      ['--git', 'download a git repository as a plugins'],
    ],
    description: 'install the npm package as a plugins'
  },
  {
    command: 'link',
    action: link,
    description: 'makes the current local plugins or packs accessible',
  },
  {
    command: 'unlink',
    action: unlink,
    description: 'unlink the local plugins or packs',
  },
  {
    command: 'run',
    action: run,
    option: [
      ['-d, --debug', 'run with [debug] mode'],
      ['--preset [keys]', 'command preset key list'],
    ],
    description: 'run packs command',
  },
];

export default commands;
