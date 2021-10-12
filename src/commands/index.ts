import { command } from '../types';
import link from './link';
import unlink from './unlink';
import run from './run';
import install from './install';
import uninstall from './uninstall';
import list from './list';
import create from './create';
import setting from './setting';
import description from '../constants/description';

const commands: command[] = [
  {
    command: 'create [type]',
    action: create,
    description: description.create,
  },
  {
    command: 'link [type]',
    action: link,
    description: description.link,
  },
  {
    command: 'unlink [name]',
    action: unlink,
    description: description.unlink,
  },
  {
    command: 'install <plugins>',
    action: install,
    option: [
      ['--git', 'download a git repository as a plugins'],
    ],
    description: description.install,
  },
  {
    command: 'uninstall <plugins>',
    action: uninstall,
    description: description.uninstall,
  },
  {
    command: 'list',
    action: list,
    description: description.list,
  },
  {
    command: 'run <script>',
    action: run,
    option: [
      ['-d, --debug', 'run with [debug] mode'],
      ['--preset [keys]', 'command preset key list'],
    ],
    description: description.run,
  },
  {
    command: 'setting',
    action: setting,
    description: description.setting,
  },
];

export default commands;
