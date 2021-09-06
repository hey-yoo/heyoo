import { getApplication, setApplication } from '../../utils/application';
import { fsExtra } from 'hey-yoo-utils';
import path from 'path';
import { localPluginsPath } from '../../utils/path';
import { label, text } from 'std-terminal-logger';

export default async function uninstall(plugins: string) {
  let appJson = getApplication();

  const index = appJson.plugins.installed.findIndex(item => item.name === plugins);
  if (index > -1) {
    const waitUninstallPlugins = appJson.plugins.installed[index];
    fsExtra.remove(path.resolve(localPluginsPath, waitUninstallPlugins.name));

    const version = waitUninstallPlugins.version;

    appJson.plugins.installed.splice(index, 1);
    setApplication(appJson);

    console.log(
      label.green('UNINSTALLED'),
      `${text.white('[')}${text.blueGray('plugins')}${text.white(']')}`,
      text.blue(`${plugins}`),
      text.white(version)
    );
  } else {
    console.log(label.warn, `Can't find the [plugins] ${plugins}`);
  }
}
