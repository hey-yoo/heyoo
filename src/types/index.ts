export type actionFn = (...args: any[]) => void | Promise<void>;

export interface command {
  command: string;
  action: actionFn;
  option?: string[][];
  requiredOption?: string[][];
  argument?: string[][];
  description?: string;
}

export interface projectConfig {
  type: 'project';
  packs: string;
}

export interface installedPlugins {
  name: string;
  version: string;
  repo?: string;
}

export interface application {
  packageManager: 'npm' | 'pnpm' | 'yarn' | '';
  plugins: {
    registry: string[];
    installed: installedPlugins[];
    linked: string[];
  };
  packs: {
    linked: string[];
  };
  template: {
    plugins: string[];
    packs: string[];
  };
}
