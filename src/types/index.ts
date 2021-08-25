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
  registry: command[];
}

export interface packConfig {
  name: string;
  version: string;
  commands: string[];
}

export interface projectConfig {
  packs: string;
}
