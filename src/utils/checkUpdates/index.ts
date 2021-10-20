import { getNpmPkgInfo } from '../../domain/npm';
import { getApplication, setApplication } from '../application';
import boxen from 'boxen';
import { getSetting } from '../setting';
import { text } from 'chalk-ex';

function getInstallCommand(pkgManager: string, pkg: string): string {
  return `${
    {
      npm: 'npm install',
      pnpm: 'pnpm add',
      yarn: 'yarn add',
    }[pkgManager]
  } -g ${pkg}`;
}

export async function checkUpdates(pkg: string, version: string) {
  const setting = getSetting();
  let appJson = getApplication();
  if (appJson.latest > version) {
    console.log(
      boxen(
        `Update available! ${text.red(version)} → ${text.green(appJson.latest)}.
Run ${text.blue(
          `${getInstallCommand(setting.packageManager, pkg)}`
        )} to update.`,
        {
          padding: 2,
          borderStyle: 'classic',
          borderColor: '#7A889A',
        }
      )
    );
  }

  const pkgInfo = await getNpmPkgInfo(pkg);
  if (pkgInfo) {
    appJson.latest = pkgInfo['dist-tags'].latest;
    setApplication(appJson);
  }
}
