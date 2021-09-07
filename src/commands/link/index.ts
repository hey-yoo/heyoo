import path from 'path';
import fs from 'fs';
import prompts from 'prompts';
import { createRequire } from 'module';
import { PACKS, PLUGINS } from '../../constants';
import {
  currentPath,
  currentPkgPath,
  localPluginsPath,
  localPacksPath,
  localPath,
} from '../../utils/path';
import { fsExtra } from 'hey-yoo-utils';
import { predicates, validate } from '../../utils/validate';
import { label, text } from 'std-terminal-logger';
import fileUrl from 'file-url';
import { getApplication, setApplication } from '../../utils/application';

const require = createRequire(import.meta.url);
const rimraf = require('rimraf');

export default async function link() {
  const { type } = await prompts({
    type: 'select',
    name: 'type',
    choices: [
      { title: PLUGINS, value: PLUGINS },
      { title: PACKS, value: PACKS },
    ],
    message: 'link as:',
  });

  const pkg = fsExtra.readJson(currentPkgPath);
  if (!pkg) {
    return console.log(label.error, `${currentPkgPath} isn't exist!`);
  }

  const pkgErr = validate(
    pkg,
    text.orange(currentPkgPath),
    predicates.packageJson
  );
  if (pkgErr) {
    return console.log(label.error, pkgErr);
  }

  const entryPath = path.resolve(currentPath, pkg.exports);
  if (!fs.existsSync(entryPath)) {
    return console.log(label.error, `${entryPath} isn't exist!`);
  }

  const registryModule = await import(fileUrl(entryPath));
  const registry = registryModule.default;

  const registryErr = validate(
    registry,
    text.orange(entryPath),
    // FIXME: predicates.packs
    predicates.command
  );
  if (registryErr) {
    return console.log(label.error, registryErr);
  }

  const linkPath = path.resolve(
    type === PLUGINS ? localPluginsPath : localPacksPath,
    pkg.name
  );

  fsExtra.ensureDir(localPath);
  fsExtra.ensureDir(localPluginsPath);

  if (fs.existsSync(linkPath)) {
    const lStats = fs.lstatSync(linkPath);
    if (lStats.isSymbolicLink()) {
      fs.unlinkSync(linkPath);
    } else {
      const stats = fs.statSync(linkPath);
      if (stats.isDirectory() || stats.isFile()) {
        rimraf.sync(linkPath);
      }
    }
  }

  return fs.symlink(currentPath, linkPath, 'junction', function (err) {
    if (err) {
      return console.log(label.error, `Failed to link ${type} ${pkg.name}`);
    }

    let appJson = getApplication();
    const index = appJson[type].findIndex(item => item.name === pkg.name);
    if (index === -1) {
      appJson[type].push({
        name: pkg.name,
        version: pkg.version,
        type: 'link',
      });
    } else {
      appJson[type][index] = {
        name: pkg.name,
        version: pkg.version,
        type: 'link',
      };
    }
    setApplication(appJson);

    console.log(
      label.green('LINKED'),
      `${text.white('[')}${text.blueGray(type)}${text.white(']')}`,
      text.blue(pkg.name),
      text.white(pkg.version)
    );
  });
}
