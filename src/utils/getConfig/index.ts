import path from 'path';
import fs from 'fs';
import fsEx from 'fs-extra';
import fileUrl from 'file-url';
import {
  HEY_CONFIG_FILENAME,
  ALLOW_EXTENSION,
  JS_EXT,
  JSON_EXT,
} from '../../constants';

export function getPriorityPath(pathList: string[]): string | undefined {
  if (!Array.isArray(pathList) || pathList.length === 0) {
    return;
  }
  let priority;
  for (let i = 0; i < pathList.length; i++) {
    if (fs.existsSync(pathList[i])) {
      priority = pathList[i];
      break;
    }
  }
  return priority;
}

export async function getConfig<T>(basePath: string): Promise<T | undefined> {
  let configPath = getPriorityPath(
    ALLOW_EXTENSION.map((ext) =>
      path.resolve(basePath, `${HEY_CONFIG_FILENAME}${ext}`)
    )
  );
  if (!configPath) {
    return;
  }
  const cfgExt = path.extname(configPath);
  let config;
  if (cfgExt === JS_EXT) {
    config = await import(fileUrl(configPath));
    config = config.default;
  } else if (cfgExt === JSON_EXT) {
    config = await fsEx.readJson(configPath);
  }
  return config;
}
