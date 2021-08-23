import { Command } from 'commander';
import { commandItem } from '../../types';

/**
batch registry commands
*/
export default function registry(program: Command, commands: commandItem[]) {
  commands.forEach((item) => {
    program.command(item.command).action(item.action);
    if (Array.isArray(item.option)) {
      item.option.forEach((opt) => {
        const [flags, description, defaultValue] = opt;
        program.option(flags, description, defaultValue);
      });
    }
    if (Array.isArray(item.requiredOption)) {
      item.requiredOption.forEach((opt) => {
        const [flags, description, defaultValue] = opt;
        program.requiredOption(flags, description, defaultValue);
      });
    }
    if (Array.isArray(item.argument)) {
      item.argument.forEach((arg) => {
        program.argument(arg);
      });
    }
    if (item.description) {
      program.description(item.description);
    }
  });
}
