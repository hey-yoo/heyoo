import { command } from '../types';
import link from './link';
import unlink from './unlink';
import run from './run';
import install from './install';
import uninstall from './uninstall';
import list from './list';
import create from './create';
import setting from './setting';

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
    command: 'uninstall <plugins>',
    action: uninstall,
    description: 'uninstall the local plugins'
  },
  {
    command: 'list',
    action: list,
    description: 'get the list of local plugins and packs',
  },
  {
    command: 'link [type]',
    action: link,
    description: 'makes the current local plugins or packs accessible',
  },
  {
    command: 'unlink',
    action: unlink,
    description: 'unlink the local plugins or packs',
  },
  {
    command: 'run <script>',
    action: run,
    option: [
      ['-d, --debug', 'run with [debug] mode'],
      ['--preset [keys]', 'command preset key list'],
    ],
    description: 'run packs command',
  },
  {
    command: 'create [type]',
    action: create,
    description: 'create plugins or packs from template',
  },
  {
    command: 'setting',
    action: setting,
    description: 'open the setting file',
  },
];

export default commands;
