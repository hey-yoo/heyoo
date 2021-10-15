import path from 'path';
import { exec } from 'child_process';
import { Buffer } from 'buffer';
import fs from 'fs';
import { fsExtra } from 'hey-yoo-utils';
import { label, text } from 'chalk-ex';
import ora from 'ora';
import axios from 'axios';
import { getApplication, setApplication } from '../../utils/application';
import { PACKAGE, PKG_MANAGER } from '../../constants';
import { localPath, localPluginsPath } from '../../utils/path';
import { packageManager, plugins } from '../../types';
import ensurePkgPath from '../../utils/ensurePkgPath';
import { getSetting, setSetting } from '../../utils/setting';
import {
  prompts,
  downloadGitRepo as download,
  decompress,
  rimraf,
} from '../../deps';

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
async function installPkg(pkg: string, version: string, plugins: plugins[], packageManager: packageManager): Promise<plugins | undefined> {
  const pkgData = await fetchPkg(pkg);
  if (!pkgData) {
    return;
  }
  if (!version) {
    version = pkgData['dist-tags'].latest;
  }

  ensurePkgPath(localPluginsPath, pkg);
  const outputPath = path.resolve(localPluginsPath, pkg);

  const existPlugins = plugins.find(item => item.name === pkg);
  if (existPlugins) {
    if (existPlugins.version === version) {
      console.log(
        label.warn,
        text.blue(pkg),
        text.white(version),
        `is already ${existPlugins.type}ed`
      );
      return;
    }
    rimraf.sync(outputPath);
  }

  const url = pkgData.versions[version].dist.tarball;
  const pkgArrBuf = await downloadPkg(url);
  if (!pkgArrBuf) {
    return;
  }

  await unzip(Buffer.from(pkgArrBuf), localPluginsPath)

  const packagePath = path.resolve(localPluginsPath, 'package');
  fs.renameSync(packagePath, outputPath);

  await installDeps(outputPath, packageManager);

  return {
    name: pkg,
    version,
    type: 'install',
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
async function installGitRepo(repo: string, version: string, plugins: plugins[], packageManager: packageManager): Promise<plugins | undefined> {
  const pkgJson = await fetchGitRepo(repo);
  if (!pkgJson) {
    return;
  }
  if (!version) {
    version = pkgJson.version;
  }

  ensurePkgPath(localPluginsPath, pkgJson.name);
  const outputPath = path.resolve(localPluginsPath, pkgJson.name);

  const existPlugins = plugins.find(item => item.name === repo);
  if (existPlugins) {
    if (existPlugins.version === version) {
      console.log(
        label.warn,
        text.blue(repo),
        text.white(version),
        `is already ${existPlugins.type}ed`
      );
      return;
    }
    rimraf.sync(outputPath);
  }

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
    type: 'install',
  };
}

export default async function install(plugins: string, options) {
  let setting = getSetting();
  if (!setting.packageManager || PKG_MANAGER.indexOf(setting.packageManager) === -1) {
    const { packageManager } = await prompts({
      type: 'select',
      name: 'packageManager',
      choices: PKG_MANAGER.map((item) => ({
        title: item,
        value: item,
      })),
      message: 'what package manager you want to use:'
    });
    setting.packageManager = packageManager;
    setSetting(setting);
  }

  fsExtra.ensureDir(localPath);
  fsExtra.ensureDir(localPluginsPath);

  let name = plugins;
  let version;
  if (plugins.indexOf('@') > 0) {
    [name, version] = plugins.split('@');
  }

  let appJson = getApplication();
  let newPlugins;
  if (options.git) {
    newPlugins = await installGitRepo(name, '', appJson.plugins, setting.packageManager);
  } else {
    newPlugins = await installPkg(name, version, appJson.plugins, setting.packageManager);
  }

  if (newPlugins) {
    const oldPluginsIndex = appJson.plugins.findIndex(item => item.name === newPlugins.name);
    if (oldPluginsIndex > -1) {
      appJson.plugins[oldPluginsIndex] = newPlugins;
    } else {
      appJson.plugins.push(newPlugins);
    }
    setApplication(appJson);

    console.log(
      label.green('INSTALLED'),
      `${text.white('[')}${text.blueGray('plugins')}${text.white(']')}`,
      text.blue(newPlugins.name),
      text.white(newPlugins.version)
    );
  }
}
