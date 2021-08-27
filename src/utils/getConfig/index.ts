import path from 'path';
import fs from 'fs';
import process from 'process';
import { fsExtra, pathExtra } from 'hey-yoo-utils';
import fileUrl from 'file-url';
import {
  HEY_CONFIG_FILENAME,
  ALLOW_EXTENSION,
  JS_EXT,
  JSON_EXT,
  LOCAL_PACKS_DIR_PATH,
  LOCAL_PLUGINS_DIR_PATH,
} from '../../constants';
import { pluginsConfig, packConfig, projectConfig } from '../../types';
import { predicates, validate } from '../validate';

const { __dirname } = pathExtra.getGlobalPath(import.meta.url);

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
    config = fsExtra.readJson(configPath);
  }
  return config;
}

export async function getPacksConfig(): Promise<packConfig | undefined> {
  let cfg = await getConfig<packConfig | projectConfig>(process.cwd());
  if (cfg?.type === 'packs') {
    return cfg;
  } else if (cfg?.type === 'project') {
    const packsName = cfg.packs;
    let packsPath = path.resolve(
      __dirname,
      `../${LOCAL_PACKS_DIR_PATH}/${packsName}`
    );
    if (!fs.existsSync(packsPath)) {
      packsPath = path.resolve(process.cwd(), `node_modules/${packsName}`);
      if (!fs.existsSync(packsPath)) {
        return;
      }
    }
    cfg = await getConfig<packConfig>(packsPath);
  }
  if (cfg && !validate(cfg, '', predicates.packsConfig)) {
    return cfg;
  }
}

export async function getAllPluginsConfig(): Promise<pluginsConfig[]> {
  const pluginsDirPath = path.resolve(
    __dirname,
    `../${LOCAL_PLUGINS_DIR_PATH}`
  );
  if (fs.existsSync(pluginsDirPath)) {
    const pluginsPaths = fs.readdirSync(pluginsDirPath);
    let all = await Promise.all(
      pluginsPaths.map((p) =>
        getConfig<pluginsConfig>(path.resolve(pluginsDirPath, p))
      )
    );
    return all.filter(Boolean) as pluginsConfig[];
  }
  return [];
}
