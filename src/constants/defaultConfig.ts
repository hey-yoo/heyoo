import { application, heyConfig } from '../types';

export const DEFAULT_HEY_CONFIG: heyConfig = {
  packs: '',
};

export const DEFAULT_APPLICATION: application = {
  packageManager: '',
  plugins: [],
  packs: [],
  template: {
    plugins: [],
    packs: [],
  },
};
