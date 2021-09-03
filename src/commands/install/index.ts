import { createRequire } from 'module';
import path from 'path';
import { exec } from 'child_process';
import { Buffer } from 'buffer';
import fs from 'fs';
import prompts from 'prompts';
import { fsExtra } from 'hey-yoo-utils';
import { label, text } from 'std-terminal-logger';
import ora from 'ora';
import axios from 'axios';
import { getApplication, setApplication } from '../../utils/application';
import { PACKAGE, PKG_MANAGER } from '../../constants';
import { localPath, localPluginsPath } from '../../utils/path';

const require = createRequire(import.meta.url);
const download = require('download-git-repo');
const decompress = require('decompress');

async function installDeps(rootPath: string, packageManager: string) {
  const pkg = fsExtra.readJson(path.resolve(rootPath, PACKAGE));
  if (pkg && pkg.dependencies && Object.keys(pkg.dependencies).length > 0) {
    const loading = ora(`install plugins dependencies...`).start();

    const isSuccess = await new Promise((resolve, reject) => {
      exec(`${packageManager} install`, {
        cwd: rootPath,
      }, (err) => {
        if (err) {
          reject(err);
        }
        resolve(true);
      });
    }).catch((err) => {
      loading.stop().clear();
      console.log(label.error, err.message);
    });

    if (isSuccess) {
      loading.succeed('dependencies install completed');
    }
  }
}

async function installPkg(plugins: string, packageManager: string) {
  let name = plugins;
  let version;
  if (plugins.includes('@')) {
    [name, version] = plugins.split('@');
  }

  const fetchLoading = ora('fetching plugins info...').start();

  const res = await axios({
    method: 'get',
    url: `https://registry.npmjs.org/${name}`,
    responseType: 'json',
    timeout: 20 * 1000,
  }).catch((err) => {
    fetchLoading.stop().clear();
    console.log(label.error, err.message, err?.response?.data || '');
  });
  if (!res || !res.data) {
    return;
  }

  fetchLoading.succeed('fetch info complete');

  if (!version) {
    version = res.data['dist-tags'].latest;
  }
  const url = res.data.versions[version].dist.tarball;

  const dLoading = ora(`downloading...`).start();

  const fileRes = await axios({
    method: 'get',
    url,
    responseType: 'arraybuffer',
  }).catch((err) => {
    dLoading.stop().clear();
    console.log(label.error, err.message, err?.response?.data || '');
  });
  if (!fileRes || !fileRes.data) {
    return;
  }

  dLoading.succeed('download complete');

  const unzipLoading = ora('unzipping...').start();

  await decompress(Buffer.from(fileRes.data), localPluginsPath);

  unzipLoading.succeed('unzip complete');

  const packagePath = path.resolve(localPluginsPath, 'package');
  const pluginsPath = path.resolve(localPluginsPath, name)

  fs.renameSync(packagePath, pluginsPath);

  await installDeps(pluginsPath, packageManager);

  console.log(label.success, text.green('plugins installation is complete'));
}

async function downloadGitRepo(plugins: string, packageManager: string) {
  const pluginsPath = path.resolve(localPluginsPath, path.basename(plugins));
  fsExtra.ensureDir(pluginsPath);

  const loading = ora(`downloading git repo...`).start();

  const isSuccess = await new Promise((resolve, reject) => {
    download(plugins, pluginsPath, (err) => {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  }).catch(() => {
    loading.stop().clear();
    console.log(label.error, text.red('Fail to download git repo'));
  });

  if (!isSuccess) {
    return;
  }

  loading.succeed('download complete');

  await installDeps(pluginsPath, packageManager);

  console.log(label.success, text.green('plugins installation is complete'));
}

export default async function install(plugins: string, options) {
  let appJson = getApplication();
  if (!appJson.packageManager || PKG_MANAGER.indexOf(appJson.packageManager) === -1) {
    const { packageManager } = await prompts({
      type: 'select',
      name: 'packageManager',
      choices: PKG_MANAGER.map((item) => ({
        title: item,
        value: item,
      })),
      message: 'what package manager you want to use:'
    });
    appJson.packageManager = packageManager;
    setApplication(appJson);
  }

  fsExtra.ensureDir(localPath);
  fsExtra.ensureDir(localPluginsPath);

  if (options.git) {
    downloadGitRepo(plugins, appJson.packageManager);
  } else {
    installPkg(plugins, appJson.packageManager);
  }
}
