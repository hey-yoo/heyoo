export type actionFn = (...args: any[]) => void | Promise<void>;

export interface command {
  command: string;
  action: actionFn;
  option?: string[][];
  requiredOption?: string[][];
  argument?: string[][];
  description?: string;
}

export interface packs {
  name: string;
  version: string;
  type: 'install' | 'link';
}

export interface plugins extends packs {
  repo?: string;
}

export interface template {
  title: string;
  description?: string;
}

export interface gitTemplate extends template {
  type: 'git';
  repo: string;
}

export interface npmTemplate extends template {
  type: 'npm';
  pkg: string;
}

export interface application {
  plugins: plugins[];
  packs: packs[];
}

export type packageManager = 'npm' | 'pnpm' | 'yarn' | ''

export interface setting {
  packageManager: packageManager;
  template: {
    plugins: gitTemplate[];
    packs: gitTemplate[];
  };
}

export interface heyConfig {
  packs: string;
}
