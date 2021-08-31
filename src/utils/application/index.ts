import fs from 'fs';
import { fsExtra } from 'hey-yoo-utils';
import { application } from '../../types';
import { applicationPath } from '../path';
import { DEFAULT_APPLICATION } from '../../constants';

export function getApplication(): application {
  if (!fs.existsSync(applicationPath)) {
    return DEFAULT_APPLICATION;
  }
  return fsExtra.readJson(applicationPath) as application;
}

export function setApplication(appJson: application) {
  fs.writeFileSync(applicationPath, JSON.stringify(appJson, null, 2), {
    encoding: 'utf8',
  });
}
