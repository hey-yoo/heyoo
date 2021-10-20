import process from 'process';
import fs from 'fs';
import fsEx from 'fs-extra';
import { Command } from 'commander';
import { text } from 'chalk-ex';
import commands from './commands';
import registry from './utils/registry';
import { ART_WORD_HEY_YOO, DEFAULT_SETTING } from './constants';
import { getAllPlugins } from './utils/getAllPlugins';
import { pkgPath, settingPath } from './utils/path';
import chalk from 'chalk';
import { setSetting } from './utils/setting';
import { checkUpdates } from './utils/checkUpdates';

async function hey() {
  if (!fs.existsSync(settingPath)) {
    setSetting(DEFAULT_SETTING);
  }

  const packageJson = await fsEx.readJson(pkgPath);

  const program = new Command();
  program
    .name(text.pink('hey'))
    .usage(chalk.hex('#51cff7')('[command]'))
    .version(packageJson?.version || '').description(`${ART_WORD_HEY_YOO}

${text.blueGray(packageJson?.description)}`);

  let pluginsCommands = await getAllPlugins();

  registry(program, commands.concat(pluginsCommands));

  program.parseAsync(process.argv);

  checkUpdates('heyoo', packageJson.version);
}

hey();
