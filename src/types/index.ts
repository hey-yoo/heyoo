export type actionFn = (...args: any[]) => void | Promise<void>;

export interface command {
  command: string;
  action: actionFn;
  option?: string[][];
  requiredOption?: string[][];
  argument?: string[];
  description?: string;
}

export interface pluginsConfig {
  name: string;
  version: string;
  type: 'plugins';
  registry: command[];
}

export interface packConfig {
  name: string;
  version: string;
  type: 'packs';
  commands: string[];
}

export interface projectConfig {
  type: 'project';
  packs: string;
}
