import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import ora from 'ora';
import { label, text } from 'std-terminal-logger';
import { fsExtra } from 'hey-yoo-utils';
import { DEFAULT_SETTING, PACKAGE, PACKS, PLUGINS } from '../../constants';
import { predicates, validate } from '../../utils/validate';
import { currentPath } from '../../utils/path';
import { getSetting } from '../../utils/setting';

const require = createRequire(import.meta.url);
const prompts = require('prompts');
const download = require('download-git-repo');
const rimraf = require('rimraf');

const COVER = 'COVER';
const IS_EMPTY = 'IS_EMPTY';
const sshRepoReg = /^git@.*:((.|[\n\r])*)\.git$/;
const httpsRepoReg = /^https:\/\/.*\.(com|cn)\/((.|[\n\r])*)\.git$/;

function getRepoUrl(repo: string): string {
  if (sshRepoReg.test(repo)) {
    return `git+ssh://${repo}`;
  } else if (httpsRepoReg.test(repo)) {
    return `git+${repo}`;
  }
  return '';
}

function getRepoName(repo: string): string {
  if (sshRepoReg.test(repo)) {
    const matched = repo.match(sshRepoReg);
    if (matched) {
      return matched[1];
    }
  } else if (httpsRepoReg.test(repo)) {
    const matched = repo.match(httpsRepoReg);
    if (matched) {
      return matched[2];
    }
  }
  return '';
}

async function downloadTemplate(template: string, dest: string): Promise<boolean> {
  const loading = ora(`template downloading`).start();

  const isSuccess = await new Promise<boolean>((resolve, reject) => {
    download(template, dest, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  }).catch(() => {
    loading.stop().clear();
    console.log(label.error, text.red('Fail to download template'));
  });

  if (isSuccess) {
    loading.succeed();
  }

  return typeof isSuccess === 'boolean' ? isSuccess : false;
}

export default async function create(type) {
  if (!type || ![PLUGINS, PACKS].includes(type)) {
    const selected = await prompts({
      type: 'select',
      name: 'type',
      choices: [
        { title: PLUGINS, value: PLUGINS },
        { title: PACKS, value: PACKS },
      ],
      message: 'choose what you want to create:',
    });
    type = selected.type;
  }

  const appJson = getSetting();

  const templateChoices = (appJson.template[type] || DEFAULT_SETTING.template[type]).map((item) => {
    if (!validate(item, '', predicates.template)) {
      return {
        title: item.title,
        value: item.repo,
      };
    }
    return false;
  }).filter(Boolean);

  const { template } = await prompts({
    type: 'select',
    name: 'template',
    choices: templateChoices,
    message: `choose ${type} template:`
  });

  const { name } = await prompts({
    type: 'text',
    name: 'name',
    message: `${type} name:`,
    initial: '',
  });
  const { version } = await prompts({
    type: 'text',
    name: 'version',
    message: 'version:',
    initial: '1.0.0',
  });
  const { description } = await prompts({
    type: 'text',
    name: 'description',
    message: 'description:',
  });
  const { repository } = await prompts({
    type: 'text',
    name: 'repository',
    message: 'git repository:',
  });
  const { keywords } = await prompts({
    type: 'text',
    name: 'keywords',
    message: 'keywords:',
  });
  const { author } = await prompts({
    type: 'text',
    name: 'author',
    message: 'author:',
  });
  const { license } = await prompts({
    type: 'text',
    name: 'license',
    message: 'license:',
    initial: 'ISC',
  });

  const tagPath = path.resolve(currentPath, name);
  rimraf.sync(tagPath);
  fsExtra.ensureDir(tagPath);

  const isDownloadSuccess = await downloadTemplate(template, tagPath);
  if (!isDownloadSuccess) {
    return;
  }

  const repoName = getRepoName(repository);

  const customerPkg = {
    name,
    version,
    description,
    type: 'module',
    exports: './index.js',
    engines: {
      node: '^12.20.0 || ^14.13.1 || >=16.0.0'
    },
    scripts: {},
    repository: {
      type: 'git',
      url: getRepoUrl(repository),
    },
    keywords: (keywords || '').replace(/ /g, '').split(','),
    author,
    license,
    bugs: repoName ? {
      url: `https://github.com/${repoName}/issues`,
    } : '',
    homepage: repoName ? `https://github.com/${repoName}#readme` : '',
  };

  const pkgPath = path.resolve(tagPath, PACKAGE);
  let pkg = fsExtra.readJson(pkgPath);
  if (pkg) {
    const mission = [
      { key: 'name', type: COVER },
      { key: 'version', type: COVER },
      { key: 'description', type: COVER },
      { key: 'type', type: COVER },
      { key: 'exports', type: IS_EMPTY },
      { key: 'engines', type: COVER },
      { key: 'script', type: IS_EMPTY },
      { key: 'repository', type: COVER },
      { key: 'keywords', type: COVER },
      { key: 'author', type: COVER },
      { key: 'license', type: COVER },
      { key: 'bugs', type: COVER },
      { key: 'homepage', type: COVER },
    ];
    mission.forEach((item) => {
      if (
        item.type === COVER ||
        item.type === IS_EMPTY && pkg && !pkg[item.key]
      ) {
        if (pkg) {
          pkg[item.key] = customerPkg[item.key];
        }
      }
    });
  } else {
    pkg = customerPkg;
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), {
    encoding: 'utf8',
  });

  console.log(label.success, `Your ${type}(${name}) was created`);
}
