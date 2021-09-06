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
import { installedPlugins } from '../../types';

const require = createRequire(import.meta.url);
const download = require('download-git-repo');
const decompress = require('decompress');

axios.defaults.timeout = 20 * 1000;

async function installDeps(rootPath: string, packageManager: string) {
  const pkg = fsExtra.readJson(path.resolve(rootPath, PACKAGE));
  if (pkg && pkg.dependencies && Object.keys(pkg.dependencies).length > 0) {
    const loading = ora(`install dependencies`).start();

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
      loading.succeed();
    }
  }
}

async function fetchPkg(pkg: string) {
  const loading = ora('check info').start();

  const res = await axios({
    method: 'get',
    url: `https://registry.npmjs.org/${pkg}`,
    responseType: 'json',
  }).catch((err) => {
    loading.stop().clear();
    console.log(label.error, err.message, err?.response?.data || '');
  });
  if (!res || !res.data) {
    return;
  }

  loading.succeed();
  return res.data;
}
async function downloadPkg(pkgUrl) {
  const dLoading = ora(`download`).start();

  const fileRes = await axios({
    method: 'get',
    url: pkgUrl,
    responseType: 'arraybuffer',
  }).catch((err) => {
    dLoading.stop().clear();
    console.log(label.error, err.message, err?.response?.data || '');
  });
  if (!fileRes) {
    return;
  }

  dLoading.succeed();
  return fileRes.data;
}
async function unzip(input, output) {
  const loading = ora('unzip').start();

  await decompress(input, output);

  loading.succeed();
}
async function installPkg(pkg: string, version: string, packageManager: string): Promise<installedPlugins | undefined> {
  const pkgData = await fetchPkg(pkg);
  if (!pkgData) {
    return;
  }
  if (!version) {
    version = pkgData['dist-tags'].latest;
  }

  // TODO: 检查本地是否已安装该插件,如果已安装则需继续检查版本是否一致

  const url = pkgData.versions[version].dist.tarball;
  const pkgArrBuf = await downloadPkg(url);
  if (!pkgArrBuf) {
    return;
  }

  await unzip(Buffer.from(pkgArrBuf), localPluginsPath)

  const packagePath = path.resolve(localPluginsPath, 'package');
  const pluginsPath = path.resolve(localPluginsPath, pkg);

  fs.renameSync(packagePath, pluginsPath);

  await installDeps(pluginsPath, packageManager);

  return {
    name: pkg,
    version,
  };
}

async function fetchGitRepo(repo: string) {
  const loading = ora('fetch info').start();

  const res = await axios({
    method: 'get',
    url: `https://api.github.com/repos/${repo}`,
    responseType: 'json',
  }).catch((err) => {
    loading.stop().clear();
    console.log(label.error, err.message, err?.response?.data || '');
  });
  if (!res || !res.data) {
    return;
  }

  if (!res.data.size) {
    console.log(label.warn, text.orange('this repo is empty'));
  }

  const resPkg = await axios({
    method: 'get',
    url: `https://api.github.com/repos/${repo}/contents/package.json`,
    responseType: 'json',
  }).catch((err) => {
    loading.stop().clear();
    console.log(label.error, err.message, err?.response?.data || '');
  });
  if (!resPkg || !resPkg.data) {
    return;
  }

  if (!resPkg.data.content) {
    console.log(label.warn, text.orange(`this repo don't have package.json file`));
    return;
  }

  loading.succeed();

  const pkgJson = JSON.parse(Buffer.from(resPkg.data.content, resPkg.data.encoding).toString());

  if (!pkgJson.name || !pkgJson.version) {
    console.log(label.warn, text.orange('package.json must had these attributes(name, version)'));
    return;
  }

  return pkgJson;
}
async function downloadGitRepo(repo: string, dest: string) {
  const loading = ora(`download`).start();

  const isSuccess = await new Promise((resolve, reject) => {
    download(repo, dest, (err) => {
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

  loading.succeed();
  return true;
}
async function installGitRepo(repo: string, version: string, packageManager: string): Promise<installedPlugins | undefined> {
  const pkgJson = await fetchGitRepo(repo);
  if (!pkgJson) {
    return;
  }
  if (!version) {
    version = pkgJson.version;
  }

  // TODO: 检查本地是否已安装该插件

  const outputPath = path.resolve(localPluginsPath, pkgJson.name);
  fsExtra.ensureDir(outputPath);

  const isDownload = await downloadGitRepo(repo, outputPath);
  if (!isDownload) {
    return;
  }

  await installDeps(outputPath, packageManager);

  return {
    name: pkgJson.name,
    version,
    repo,
  };
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

  let name = plugins;
  let version;
  if (plugins.includes('@')) {
    [name, version] = plugins.split('@');
  }

  let newPlugins;
  if (options.git) {
    newPlugins = await installGitRepo(name, '', appJson.packageManager);
  } else {
    newPlugins = await installPkg(name, version, appJson.packageManager);
  }

  if (newPlugins) {
    const oldPluginsIndex = appJson.plugins.installed.findIndex(item => item.name === newPlugins.name);
    if (oldPluginsIndex > -1) {
      appJson.plugins.installed[oldPluginsIndex] = newPlugins;
    } else {
      appJson.plugins.installed.push(newPlugins);
    }
    setApplication(appJson);

    console.log(
      label.green('INSTALLED'),
      `${text.white('[')}${text.blueGray('plugins')}${text.white(']')}`,
      text.blue(`${newPlugins.name}`),
      text.white(newPlugins.version)
    );
  }
}
