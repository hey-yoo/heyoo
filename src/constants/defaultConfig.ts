import { application, heyConfig, setting } from '../types';

export const DEFAULT_HEY_CONFIG: heyConfig = {
  packs: '',
};

export const DEFAULT_APPLICATION: application = {
  plugins: [],
  packs: [],
  latest: '',
};

export const DEFAULT_SETTING: setting = {
  packageManager: '',
  template: {
    plugins: [
      {
        title: 'typescript plugins',
        type: 'git',
        repo: 'hey-yoo/heyoo-template#plugins-ts-template',
      },
      {
        title: 'javascript plugins',
        type: 'git',
        repo: 'hey-yoo/heyoo-template#plugins-js-template',
      },
    ],
    packs: [
      {
        title: 'typescript packs',
        type: 'git',
        repo: 'hey-yoo/heyoo-template#packs-ts-template',
      },
      {
        title: 'javascript packs',
        type: 'git',
        repo: 'hey-yoo/heyoo-template#packs-js-template',
      },
    ],
  },
};

export const DEFAULT_PACKAGE = {
  name: '',
  version: '1.0.0',
  description: '',
  type: 'module',
  exports: './index.js',
  engines: {
    node: '^12.20.0 || ^14.13.1 || >=16.0.0',
  },
  scripts: {},
  repository: {
    type: 'git',
    url: '',
  },
  keywords: [],
  author: '',
  license: '',
  bugs: {
    url: '',
  },
  homepage: '',
};
