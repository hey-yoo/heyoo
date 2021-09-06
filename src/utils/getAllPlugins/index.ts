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

interface plugins {
  name: string;
  path: string;
}

export async function getAllPlugins(): Promise<command[]> {
  const appJson = getApplication();

  const installed: plugins[] = appJson.plugins.installed.map((item) => ({
    name: item.name,
    path: path.resolve(localPluginsPath, item.name),
  }));
  const linked = appJson.plugins.linked
    .map((item) => {
      const linkPath = path.resolve(localPluginsPath, item);
      const lStats = fs.lstatSync(linkPath);
      if (lStats.isSymbolicLink()) {
        const actualPath = fs.readlinkSync(linkPath);
        const pkg = fsExtra.readJson(path.resolve(actualPath, PACKAGE));
        if (pkg && pkg.exports) {
          const actualPkgPath = path.resolve(actualPath, pkg.exports);
          if (fs.existsSync(actualPkgPath)) {
            return {
              name: item,
              path: actualPkgPath,
            };
          }
        }
      }
      return false;
    })
    .filter(Boolean) as plugins[];

  const pluginsPaths = [...installed, ...linked];

  const all = await Promise.all(
    pluginsPaths.map((item) => import(fileUrl(item.path)))
  );

  const allValidPlugins = all
    .map((item) => item.default)
    .filter((item, index) => {
      const validateErr = validate(
        item,
        `[${text.blueGray('plugins')}] ${text.orange(pluginsPaths[index].name)}`,
        predicates.command
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
