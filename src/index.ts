import { Command } from 'commander';
import { log, label, text } from 'std-terminal-logger';
import commands from './commands';
import registry from './utils/registry';
import { validate, predicates } from './utils/validate';
import { commandItem, heyConfig } from './types';
import { RESERVED_WORD } from './constants';

const program = new Command();

program.name('hey').version('v1.0.0').usage(text.green('[command]'));
// .description(packageJson.description);

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
