import fs from 'fs';
import { fsExtra } from 'hey-yoo-utils';
import { setting } from '../../types';
import { settingPath } from '../path';
import { DEFAULT_SETTING } from '../../constants';

export function getSetting(): setting {
  if (!fs.existsSync(settingPath)) {
    return DEFAULT_SETTING;
  }
  return fsExtra.readJson(settingPath) as setting;
}

export function setSetting(setJson: setting) {
  fs.writeFileSync(settingPath, JSON.stringify(setJson, null, 2), {
    encoding: 'utf8',
  });
}
