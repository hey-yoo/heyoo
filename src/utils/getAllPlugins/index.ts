import path from 'path';
import fs from 'fs';
import { fsExtra } from 'hey-yoo-utils';
import fileUrl from 'file-url';
import { PACKAGE, RESERVED_WORD } from '../../constants';
import { command } from '../../types';
import { validate, predicates } from '../validate';
import { getApplication } from '../application';
import { localPluginsPath } from '../path';
import { label, log, text } from 'std-terminal-logger';

export async function getAllPlugins(): Promise<command[]> {
  const appJson = getApplication();

  const installed = appJson.plugins.installed.map((item) =>
    path.resolve(localPluginsPath, item)
  );
  const linked = appJson.plugins.linked
    .map((item) => {
      const linkPath = path.resolve(localPluginsPath, item);
      const lStats = fs.lstatSync(linkPath);
      if (lStats.isSymbolicLink()) {
        const actualPath = fs.readlinkSync(linkPath);
        const pkg = fsExtra.readJson(path.resolve(actualPath, PACKAGE));
        if (pkg && pkg.exports) {
          const actualPkgPath = path.resolve(actualPath, pkg.exports);
          return fs.existsSync(actualPkgPath) ? actualPkgPath : '';
        }
      }
      return '';
    })
    .filter(Boolean);

  const all = await Promise.all(
    [...installed, ...linked].map((item) => import(fileUrl(item)))
  );

  const allValidPlugins = all
    .map((item) => item.default)
    .filter((item) => {
      const validateErr = validate(
        item,
        text.orange('plugins'),
        predicates.registry
      );
      if (validateErr) {
        log(label.error, validateErr);
        return false;
      }
      return !item.some((reg) => RESERVED_WORD.indexOf(reg.command) > -1);
    });

  // TODO: filter out the same command

  return allValidPlugins.reduce(
    (accumulate, current) => accumulate.concat(current),
    []
  );
}
