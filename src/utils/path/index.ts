import process from 'process';
import path from 'path';
import { pathExtra } from 'hey-yoo-utils';
import {
  APPLICATION,
  LOCAL_PATH,
  PACKAGE,
  PACKS,
  PLUGINS,
  SETTING,
} from '../../constants';

export const { __dirname, __filename } = pathExtra.getGlobalPath(
  import.meta.url
);
export const basePath = path.resolve(__dirname, '../');
export const pkgPath = path.resolve(basePath, PACKAGE);
export const settingPath = path.resolve(basePath, SETTING);
export const applicationPath = path.resolve(basePath, APPLICATION);
export const localPath = path.resolve(basePath, LOCAL_PATH);
export const localPluginsPath = path.resolve(localPath, PLUGINS);
export const localPacksPath = path.resolve(localPath, PACKS);

export const currentPath = process.cwd();
export const currentPkgPath = path.resolve(currentPath, PACKAGE);
