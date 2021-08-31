import { command } from '../types';
import link from './link';
import unlink from './unlink';
import run from './run';
import { text } from 'std-terminal-logger';

const commands = [
  {
    command: 'link',
    action: link,
  },
  {
    command: 'unlink',
    action: unlink,
  },
  {
    command: 'run',
    action: run,
    option: [
      ['-d, --debug', 'run customize command  with [debug] mode'],
      ['--preset [keys]', 'command preset key list'],
    ],
    description: text.purple('run customize command'),
  },
] as command[];

export default commands;
