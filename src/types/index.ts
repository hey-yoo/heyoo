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

export interface packs {
  name: string;
  version: string;
  type: 'install' | 'link';
}

export interface plugins extends packs {
  repo?: string;
}

export interface application {
  packageManager: 'npm' | 'pnpm' | 'yarn' | '';
  plugins: plugins[];
  packs: packs[];
  template: {
    plugins: string[];
    packs: string[];
  };
}
