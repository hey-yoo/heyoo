import { Command } from 'commander';
import { text } from 'std-terminal-logger';
import run from './commands/run';

const program = new Command();

program.name('hey').version('v1.0.0').usage(text.green('[command]'));
// .description(packageJson.description);

program
  .command('run [command]')
  .description(text.purple('run customize command'))
  .action(run);

program.parse(process.argv);
