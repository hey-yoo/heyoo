import path from 'path';
import { label, text } from 'chalk-ex';
import { getApplication, setApplication } from '../../utils/application';
import { localPluginsPath } from '../../utils/path';
import { rimraf } from '../../deps';

export default async function uninstall(plugins: string) {
  let appJson = getApplication();

  const index = appJson.plugins.findIndex(item => item.name === plugins && item.type === 'install');
  if (index > -1) {
    const waitUninstallPlugins = appJson.plugins[index];
    rimraf.sync(path.resolve(localPluginsPath, waitUninstallPlugins.name));

    const version = waitUninstallPlugins.version;

    appJson.plugins.splice(index, 1);
    setApplication(appJson);

    console.log(
      label.green('UNINSTALLED'),
      `${text.white('[')}${text.blueGray('plugins')}${text.white(']')}`,
      text.blue(plugins),
      text.white(version)
    );
  } else {
    console.log(label.warn, `Can't find the [plugins] ${plugins}`);
  }
}
