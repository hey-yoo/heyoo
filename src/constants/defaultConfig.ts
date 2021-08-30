import {
  pluginsConfig,
  packConfig,
  projectConfig,
  application,
} from '../types';

export const DEFAULT_PLUGINS_CONFIG = {
  type: 'plugins',
  registry: [],
} as pluginsConfig;

export const DEFAULT_PACKS_CONFIG = {
  type: 'packs',
  commands: ['dev'],
} as packConfig;

export const DEFAULT_PROJECT_CONFIG = {
  type: 'project',
  packs: '',
} as projectConfig;

export const DEFAULT_APPLICATION = {
  plugins: {
    registry: [],
    installed: [],
    linked: [],
  },
  packs: {
    linked: [],
  },
  template: {
    plugins: [],
    packs: [],
  },
} as application;
