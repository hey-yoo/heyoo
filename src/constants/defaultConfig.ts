import { projectConfig, application } from '../types';

export const DEFAULT_PROJECT_CONFIG = {
  type: 'project',
  packs: '',
} as projectConfig;

export const DEFAULT_APPLICATION = {
  packageManager: '',
  plugins: [],
  packs: [],
  template: {
    plugins: [],
    packs: [],
  },
} as application;
