import { getApplication, setApplication } from '../../utils/application';
import { fsExtra } from 'hey-yoo-utils';
import path from 'path';
import { localPluginsPath } from '../../utils/path';
import { label } from 'std-terminal-logger';

export default async function uninstall(plugins: string) {
  let appJson = getApplication();

  const index = appJson.plugins.installed.findIndex(item => item.name === plugins);
  if (index > -1) {
    const waitUninstallPlugins = appJson.plugins.installed[index];
    fsExtra.remove(path.resolve(localPluginsPath, waitUninstallPlugins.name));

    const version = waitUninstallPlugins.version;

    appJson.plugins.installed.splice(index, 1);
    setApplication(appJson);

    console.log(label.success, `installed ${plugins}`, version);
  } else {
    console.log(label.warn, `Can't find the [plugins] ${plugins}`);
  }
}
