import axios from 'axios';
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

  axios
    .get(`https://registry.npmjs.org/${pkg}`, {
      timeout: 1000,
    })
    .then((res) => {
      if (res.data) {
        appJson.latest = res.data['dist-tags'].latest;
        setApplication(appJson);
      }
    })
    .catch(() => {});
}
