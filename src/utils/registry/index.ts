import { Command } from 'commander';
import { command } from '../../types';

/**
batch registry commands
*/
export default function registry(program: Command, commands: command[]) {
  commands.forEach((item) => {
    let _program = program.command(item.command).action(item.action);
    if (Array.isArray(item.option)) {
      item.option.forEach((opt) => {
        const [flags, description, defaultValue] = opt;
        _program = _program.option(flags, description, defaultValue);
      });
    }
    if (Array.isArray(item.requiredOption)) {
      item.requiredOption.forEach((opt) => {
        const [flags, description, defaultValue] = opt;
        _program = _program.requiredOption(flags, description, defaultValue);
      });
    }
    if (Array.isArray(item.argument)) {
      item.argument.forEach((arg) => {
        _program = _program.argument(arg);
      });
    }
    if (item.description) {
      _program = _program.description(item.description);
    }
  });
}
