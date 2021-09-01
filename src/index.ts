import { Command } from 'commander';
import { text } from 'std-terminal-logger';
import commands from './commands';
import registry from './utils/registry';
import { ART_WORD_HEY_YOO } from './constants';
import { fsExtra } from 'hey-yoo-utils';
import { getAllPlugins } from './utils/getAllPlugins';
import { pkgPath } from './utils/path';

async function hey() {
  const packageJson = fsExtra.readJson(pkgPath);

  const program = new Command();
  program
    .name('hey')
    .version(packageJson?.version || '')
    .usage(text.green('[command]')).description(`${ART_WORD_HEY_YOO}

${packageJson?.description}`);

  let pluginsCommands = await getAllPlugins();

  registry(program, commands.concat(pluginsCommands));

  program.parseAsync(process.argv);
}

hey();
