import fs from 'fs';
import fsEx from 'fs-extra';
import { application } from '../../types';
import { applicationPath } from '../path';
import { DEFAULT_APPLICATION } from '../../constants';

export function getApplication(): application {
  if (!fs.existsSync(applicationPath)) {
    return DEFAULT_APPLICATION;
  }
  return fsEx.readJsonSync(applicationPath) as application;
}

export function setApplication(appJson: application) {
  fs.writeFileSync(applicationPath, JSON.stringify(appJson, null, 2), {
    encoding: 'utf8',
  });
}
