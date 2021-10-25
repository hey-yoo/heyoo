import { env } from 'process';
import fs from 'fs';
import fsEx from 'fs-extra';
import { application } from '../../types';
import { applicationPath } from '../path';
import { DEFAULT_APPLICATION } from '../../constants';
import { recursive } from 'merge';

export function getApplication(): application {
  if (!fs.existsSync(applicationPath)) {
    return DEFAULT_APPLICATION;
  }
  return env.HEYOO_APPLICATION
    ? JSON.parse(env.HEYOO_APPLICATION)
    : (fsEx.readJsonSync(applicationPath) as application);
}

export function setApplication(appJson: application) {
  let _appStorage = env.HEYOO_APPLICATION
    ? JSON.parse(env.HEYOO_APPLICATION)
    : ({} as application);
  appJson = recursive(_appStorage, appJson);
  env.HEYOO_APPLICATION = JSON.stringify(appJson);
  fs.writeFileSync(applicationPath, JSON.stringify(appJson, null, 2), {
    encoding: 'utf8',
  });
}
