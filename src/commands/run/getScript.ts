import path from 'path';
import fs from 'fs';
import { label, text } from 'chalk-ex';
import { getApplication } from '../../utils/application';
import { currentPath, localPacksPath } from '../../utils/path';
import { fsExtra } from 'hey-yoo-utils';
import { PACKAGE } from '../../constants';
import { predicates, validate } from '../../utils/validate';

export default function getScript(packs: string, script: string): string {
  const appJson = getApplication();

  let packsPath: string;
  if (appJson.packs.find(item => item.name === packs)) {
    packsPath = fs.readlinkSync(path.resolve(localPacksPath, packs));
  } else {
    packsPath = path.resolve(currentPath, `node_modules/${packs}`);
    if (!fs.existsSync(packsPath)) {
      return '';
    }
  }

  let tagPath = path.resolve(packsPath, `${script}.js`);
  if (!fs.existsSync(tagPath)) {
    const pkg = fsExtra.readJson(path.resolve(packsPath, PACKAGE));
    const pkgErr = validate(
      pkg,
      text.orange(`${packs}/${PACKAGE}`),
      predicates.packsPackage
    );
    if (pkgErr) {
      console.log(label.error, pkgErr);
      return '';
    }
    tagPath = path.resolve(packsPath, pkg?.exports[`./${script}`]);
    if (!fs.existsSync(tagPath)) {
      return '';
    }
  }

  return tagPath;
}
