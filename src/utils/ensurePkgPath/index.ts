import path from 'path';
import { fsExtra } from 'hey-yoo-utils';

export default function ensurePkgPath(basePath: string, pkgName: string) {
  if (pkgName.includes('/')) {
    const pkgNameArr = pkgName.split('/');
    for (let i = 0; i < pkgNameArr.length - 1; i++) {
      basePath = path.resolve(basePath, pkgNameArr[i]);
      fsExtra.ensureDir(basePath);
    }
  }
}
