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

axios.defaults.timeout = 20 * 1000;

function logSuccess(plugins) {
  console.log(label.success, `installed ${plugins}`);
}

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

async function checkPkg(pkg: string) {
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
async function installPkg(plugins: string, packageManager: string) {
  let name = plugins;
  let version;
  if (plugins.includes('@')) {
    [name, version] = plugins.split('@');
  }

  const pkg = await checkPkg(name);
  if (!pkg) {
    return;
  }

  if (!version) {
    version = pkg['dist-tags'].latest;
  }
  const url = pkg.versions[version].dist.tarball;

  const pkgArrBuf = await downloadPkg(url);
  if (!pkgArrBuf) {
    return;
  }

  await unzip(Buffer.from(pkgArrBuf), localPluginsPath)

  const packagePath = path.resolve(localPluginsPath, 'package');
  const pluginsPath = path.resolve(localPluginsPath, name);

  fs.renameSync(packagePath, pluginsPath);

  await installDeps(pluginsPath, packageManager);

  logSuccess(plugins);
}

async function checkGitRepo(repo: string) {
  const loading = ora('check info').start();

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

  loading.succeed();

  if (res.data.size === 0) {
    console.log(label.warn, text.orange(`${repo} is an empty repo`));
    return;
  }

  return res.data;
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
async function installGitRepo(plugins: string, packageManager: string) {
  const repo = await checkGitRepo(plugins);
  if (!repo) {
    return;
  }

  const pluginsPath = path.resolve(localPluginsPath, repo.name);
  fsExtra.ensureDir(pluginsPath);

  const isDownload = await downloadGitRepo(plugins, pluginsPath);
  if (!isDownload) {
    return;
  }

  await installDeps(pluginsPath, packageManager);

  logSuccess(plugins);
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
    installGitRepo(plugins, appJson.packageManager);
  } else {
    installPkg(plugins, appJson.packageManager);
  }
}
