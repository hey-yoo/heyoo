import path from 'path';
import { Command } from 'commander';
import { log, label, text } from 'std-terminal-logger';
import commands from './commands';
import registry from './utils/registry';
import { validate, predicates } from './utils/validate';
import { pluginsConfig } from './types';
import { ART_WORD_HEY_YOO, RESERVED_WORD } from './constants';
import { pathExtra, fsExtra } from 'hey-yoo-utils';
import { getAllPluginsConfig } from './utils/getConfig';

const { __dirname } = pathExtra.getGlobalPath(import.meta.url);

async function hey() {
  const packageJson = fsExtra.readJson(
    path.resolve(__dirname, '../package.json')
  );

  const program = new Command();

  program
    .name('hey')
    .version(packageJson?.version || '')
    .usage(text.green('[command]')).description(`${ART_WORD_HEY_YOO}

${packageJson?.description}`);

  let outsideCommandConfigs = (await getAllPluginsConfig()) as pluginsConfig[];
  outsideCommandConfigs = outsideCommandConfigs.filter((item) => {
    const validateErr = validate(item, item.name, predicates.pluginsConfig);
    if (validateErr) {
      log(label.error, validateErr);
      return false;
    }
    return !item.registry.some(
      (reg) => RESERVED_WORD.indexOf(reg.command) > -1
    );
  });

  registry(
    program,
    commands.concat(
      ...outsideCommandConfigs
        .map((item) => item.registry)
        // TODO: filter out the same command
        .reduce((accumulate, current) => accumulate.concat(current), [])
    )
  );

  program.parseAsync(process.argv);
}

hey();
