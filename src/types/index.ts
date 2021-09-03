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

export interface application {
  packageManager: 'npm' | 'pnpm' | 'yarn' | '';
  plugins: {
    registry: string[];
    installed: string[];
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
