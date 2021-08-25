import { command } from '../types';
import run from './run';
import { text } from 'std-terminal-logger';

const commands = [
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
