import process from 'process';
import fs from 'fs';
import { Command } from 'commander';
import { text } from 'std-terminal-logger';
import commands from './commands';
import registry from './utils/registry';
import { ART_WORD_HEY_YOO, DEFAULT_SETTING } from './constants';
import { fsExtra } from 'hey-yoo-utils';
import { getAllPlugins } from './utils/getAllPlugins';
import { pkgPath, settingPath } from './utils/path';
import chalk from 'chalk';
import { setSetting } from './utils/setting';

async function hey() {
  if (!fs.existsSync(settingPath)) {
    setSetting(DEFAULT_SETTING);
  }

  const packageJson = fsExtra.readJson(pkgPath);

  const program = new Command();
  program
    .name(text.pink('hey'))
    .usage(chalk.hex('#51cff7')('[command]'))
    .version(packageJson?.version || '')
    .description(`${ART_WORD_HEY_YOO}

${packageJson?.description}`);

  let pluginsCommands = await getAllPlugins();

  registry(program, commands.concat(pluginsCommands));

  program.parseAsync(process.argv);
}

hey();
