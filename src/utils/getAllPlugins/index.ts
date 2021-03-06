import path from 'path';
import fs from 'fs';
import fsEx from 'fs-extra';
import fileUrl from 'file-url';
import { PACKAGE, RESERVED_WORD } from '../../constants';
import { command } from '../../types';
import { validate, predicates } from '../validate';
import { getApplication } from '../application';
import { localPluginsPath } from '../path';
import { label, text } from 'chalk-ex';

interface localItem {
  name: string;
  path: string;
}

export async function getAllPlugins(): Promise<command[]> {
  const appJson = getApplication();

  const localPlugins: localItem[] = appJson.plugins
    .map((item) => {
      if (item.type === 'install') {
        return {
          name: item.name,
          path: path.resolve(localPluginsPath, item.name),
        };
      } else {
        const linkPath = path.resolve(localPluginsPath, item.name);
        const lStats = fs.lstatSync(linkPath);
        if (lStats.isSymbolicLink()) {
          const actualPath = fs.readlinkSync(linkPath);
          return {
            name: item.name,
            path: actualPath,
          };
        }
      }
      return false;
    })
    .filter(Boolean) as localItem[];

  const pluginsPaths = localPlugins
    .map((item) => {
      const pkg = fsEx.readJsonSync(path.resolve(item.path, PACKAGE));
      if (pkg && pkg.exports) {
        const actualPkgPath = path.resolve(item.path, pkg.exports);
        if (fs.existsSync(actualPkgPath)) {
          return {
            name: item.name,
            path: actualPkgPath,
          };
        }
      }
      return false;
    })
    .filter(Boolean) as localItem[];

  const all = await Promise.all(
    pluginsPaths.map((item) => import(fileUrl(item.path)))
  );

  const allValidPlugins = all
    .map((item) => item.default)
    .map((items, index) => {
      if (Array.isArray(items)) {
        items.forEach((item) => {
          if (item.description) {
            item.description = `[${text.blueGray(pluginsPaths[index].name)}] ${
              item.description
            }`;
          }
        });
      }
      return items;
    })
    .filter((item, index) => {
      const validateErr = validate(
        item,
        `[${text.blueGray('plugins')}] ${text.orange(
          pluginsPaths[index].name
        )}`,
        predicates.command
      );
      if (validateErr) {
        console.log(label.error, validateErr);
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
