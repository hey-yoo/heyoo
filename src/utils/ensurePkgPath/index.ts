import path from 'path';
import fsEx from 'fs-extra';

export default function ensurePkgPath(basePath: string, pkgName: string) {
  if (pkgName.includes('/')) {
    const pkgNameArr = pkgName.split('/');
    for (let i = 0; i < pkgNameArr.length - 1; i++) {
      basePath = path.resolve(basePath, pkgNameArr[i]);
      fsEx.ensureDirSync(basePath);
    }
  }
}
