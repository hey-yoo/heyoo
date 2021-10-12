import path from 'path';
import fs from 'fs';
import { getApplication, setApplication } from '../../utils/application';
import { fsExtra } from 'hey-yoo-utils';
import { currentPkgPath, localPacksPath, localPluginsPath } from '../../utils/path';
import { predicates, validate } from '../../utils/validate';
import { label, text } from 'std-terminal-logger';
import { PACKAGE, PACKS, PLUGINS } from '../../constants';

export default async function unlink(name) {
  let appJson = getApplication();
  let tagPkgPath = currentPkgPath;

  if (name) {
    let basePath;
    [PLUGINS, PACKS].forEach((type) => {
      if (basePath) {
        return;
      }
      const index = appJson[type].findIndex(item => item.name === name && item.type === 'link');
      if (index > -1) {
        basePath = {
          [PLUGINS]: localPluginsPath,
          [PACKS]: localPacksPath,
        }[type];
      }
    });
    if (!basePath) {
      return console.log(label.warn, 'No matching plugins or packs were found');
    }

    const waitUnlinkPath = path.resolve(basePath, name);
    const lStats = fs.lstatSync(waitUnlinkPath);
    if (lStats.isSymbolicLink()) {
      const actualPath = fs.readlinkSync(waitUnlinkPath);
      tagPkgPath = path.resolve(actualPath, PACKAGE);
    }
  }

  const pkg = fsExtra.readJson(tagPkgPath);
  if (!pkg) {
    return;
  }

  let type;
  const types = [PLUGINS, PACKS, ''];
  for (type of types) {
    if ((appJson[type] || []).find(item => item.name === pkg.name && item.type === 'link')) {
      break;
    }
  }

  if (type) {
    const pkgErr = validate(
      pkg,
      text.orange(currentPkgPath),
      type === PLUGINS ? predicates.pluginsPackage : predicates.packsPackage
    );
    if (pkgErr) {
      return console.log(label.error, pkgErr);
    }

    const pluginsLinkPath = path.resolve(type === PLUGINS ? localPluginsPath : localPacksPath, pkg.name);
    if (fs.existsSync(pluginsLinkPath)) {
      const stats = fs.lstatSync(pluginsLinkPath);
      if (stats.isSymbolicLink()) {
        fs.unlinkSync(pluginsLinkPath);
        console.log(
          label.green('UNLINKED'),
          `${text.white('[')}${text.blueGray(type)}${text.white(']')}`,
          text.blue(pkg.name),
          text.white(pkg.version)
        );

        appJson[type] = appJson[type].filter(
          (item) => item.name !== pkg.name
        );
        setApplication(appJson);
        return;
      }
    }
  }

  console.log(
    label.warn,
    text.orange(`No [${type}] ${pkg.name} need to unlink`)
  );
}
