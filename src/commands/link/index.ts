import path from 'path';
import fs from 'fs';
import prompts from 'prompts';
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
    predicates.registry
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
        fsExtra.remove(linkPath);
      }
    }
  }

  return fs.symlink(currentPath, linkPath, 'junction', function (err) {
    if (err) {
      return console.log(label.error, `Failed to link ${type} ${pkg.name}`);
    }

    let appJson = getApplication();
    if (appJson[type].linked.indexOf(pkg.name) === -1) {
      appJson[type].linked.push(pkg.name);
      setApplication(appJson);
    }

    console.log(
      label.green('LINK COMPLETED'),
      `${text.white('[')}${text.blueGray(type)}${text.white(']')}`,
      text.blue(`${pkg.name}`),
      text.white(pkg.version)
    );
  });
}
