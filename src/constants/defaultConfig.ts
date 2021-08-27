import { pluginsConfig, packConfig, projectConfig } from '../types';

export const DEFAULT_PLUGINS_CONFIG = {
  name: 'PLUGINS_NAME',
  version: '1.0.0',
  type: 'plugins',
  registry: [],
} as pluginsConfig;

export const DEFAULT_PACKS_CONFIG = {
  name: 'PACKS_NAME',
  version: '1.0.0',
  type: 'packs',
  commands: ['dev'],
} as packConfig;

export const DEFAULT_PROJECT_CONFIG = {
  type: 'project',
  packs: '',
} as projectConfig;
