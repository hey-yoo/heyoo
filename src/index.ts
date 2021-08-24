import path from 'path';
import { Command } from 'commander';
import { log, label, text } from 'std-terminal-logger';
import commands from './commands';
import registry from './utils/registry';
import requirePackageJson from './utils/requirePackageJson';
import { validate, predicates } from './utils/validate';
import { heyConfig } from './types';
import { ART_WORD_HEY_YOO, RESERVED_WORD } from './constants';
import { pathExtra } from 'hey-yoo-utils';

const { __dirname } = pathExtra.getGlobalPath(import.meta.url);
const packageJson = requirePackageJson(
  path.resolve(__dirname, '../package.json')
);

const program = new Command();

program
  .name('hey')
  .version(packageJson?.version || '')
  .usage(text.green('[command]'))
  .description(`${text.amber(ART_WORD_HEY_YOO)}

${packageJson?.description}`);

const outsideCommandConfigs = [] as heyConfig[];

registry(
  program,
  /**
  Filter out external commands that do not meet the requirements
  */
  commands.concat(
    // @ts-ignore
    outsideCommandConfigs.filter((item) => {
      const validateErr = validate(item, item.name, predicates.heyConfig);
      if (validateErr) {
        log(label.error, validateErr);
        return false;
      }
      return !item.registry.some(
        (reg) => RESERVED_WORD.indexOf(reg.command) > -1
      );
    })
  )
);

program.parseAsync(process.argv);
