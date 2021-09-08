import process from 'process';
import { label, text } from 'std-terminal-logger';
import { getConfig } from '../../utils/getConfig';
import { currentPath } from '../../utils/path';
import { heyConfig } from '../../types';
import { predicates, validate } from '../../utils/validate';
import getScript from './getScript';
import { HEY_CONFIG_FILENAME } from '../../constants';
import exec from './exec';

export default async function run(script, options) {
  const config = await getConfig<heyConfig>(currentPath);
  if (!config) {
    console.log(label.error, `Can't find ${HEY_CONFIG_FILENAME} in ${currentPath}`);
    return;
  }
  const validateErr = validate(config, HEY_CONFIG_FILENAME, predicates.heyConfig);
  if (validateErr) {
    console.log(label.error, validateErr);
    return;
  }

  if (!config.register.find(item => item === script)) {
    console.log(label.error, `${HEY_CONFIG_FILENAME}'s register attribute doesn't have ${text.orange(script)} script`);
    return;
  }

  const scriptPath = getScript(config.packs, script);
  if (!scriptPath) {
    console.log(label.error, `${text.blue(config.packs)}'s ${text.orange(script)} script isn't exist`);
    return;
  }

  process.on('unhandledRejection', (err) => {
    if (err) {
      console.log(label.error, err);
    } else {
      console.log(label.orange('PROCESS EXIT'));
    }
  });

  exec(scriptPath);
}
