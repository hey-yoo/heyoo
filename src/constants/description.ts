import { text } from 'chalk-ex';

export default {
  create: text.red('create plugins or packs from template'),
  link: text.purple('makes the current local plugins or packs accessible'),
  unlink: text.indigo('unlink the local plugins or packs'),
  install: text.lightBlue('install the npm package as a plugins'),
  uninstall: text.teal('uninstall the plugins'),
  list: text.lightGreen('get the list of local plugins and packs'),
  run: text.yellow('run packs command'),
  setting: text.orange('open the setting file'),
};
