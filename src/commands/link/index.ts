import path from 'path';
import fs from 'fs';
import fsEx from 'fs-extra';
import { PACKS, PLUGINS } from '../../constants';
import {
  currentPath,
  currentPkgPath,
  localPluginsPath,
  localPacksPath,
  localPath,
} from '../../utils/path';
import { predicates, validate } from '../../utils/validate';
import { label, text } from 'chalk-ex';
import fileUrl from 'file-url';
import { getApplication, setApplication } from '../../utils/application';
import ensurePkgPath from '../../utils/ensurePkgPath';
import { prompts, rimraf } from '../../deps';

export default async function link(type: 'plugins' | 'packs') {
  if (!type || ![PLUGINS, PACKS].includes(type)) {
    const selected = await prompts({
      type: 'select',
      name: 'type',
      choices: [
        { title: PLUGINS, value: PLUGINS },
        { title: PACKS, value: PACKS },
      ],
      message: 'link as:',
    });
    type = selected.type;
  }

  const pkg = await fsEx.readJson(currentPkgPath);
  if (!pkg) {
    return console.log(label.error, `${currentPkgPath} isn't exist!`);
  }

  const rootPath = type === PLUGINS ? localPluginsPath : localPacksPath;
  await fsEx.ensureDir(localPath);
  await fsEx.ensureDir(rootPath);

  const pkgErr = validate(
    pkg,
    text.orange(currentPkgPath),
    type === PLUGINS ? predicates.pluginsPackage : predicates.packsPackage
  );
  if (pkgErr) {
    return console.log(label.error, pkgErr);
  }

  if (type === PLUGINS) {
    const entryPath = path.resolve(currentPath, pkg.exports);
    if (!fs.existsSync(entryPath)) {
      return console.log(label.error, `${entryPath} isn't exist!`);
    }
    const registryModule = await import(fileUrl(entryPath));
    const registry = registryModule.default;
    const registryErr = validate(
      registry,
      text.orange(entryPath),
      predicates.command
    );
    if (registryErr) {
      return console.log(label.error, registryErr);
    }
  }

  ensurePkgPath(rootPath, pkg.name);

  const linkPath = path.resolve(rootPath, pkg.name);

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
    const index = appJson[type].findIndex((item) => item.name === pkg.name);
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
