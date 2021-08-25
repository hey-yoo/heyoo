export interface command {
  command: string;
  action: (...args: any[]) => void | Promise<void>;
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
