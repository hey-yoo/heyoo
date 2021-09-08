import path from 'path';
import fs from 'fs';
import { getApplication } from '../../utils/application';
import { currentPath, localPacksPath } from '../../utils/path';
import { fsExtra } from 'hey-yoo-utils';
import { PACKAGE } from '../../constants';

export default function getScript(packs: string, script: string): string {
  const appJson = getApplication();

  let packsPath = '';
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
    if (!pkg || !pkg.exports) {
      return '';
    }
    tagPath = path.resolve(packsPath, pkg.exports, `${script}.js`);
    if (!fs.existsSync(tagPath)) {
      return '';
    }
  }

  return tagPath;
}
