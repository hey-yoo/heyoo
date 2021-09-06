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

export interface linked {
  name: string;
  version: string;
}

export interface installed extends linked {
  repo?: string;
}

export interface application {
  packageManager: 'npm' | 'pnpm' | 'yarn' | '';
  plugins: {
    registry: string[];
    installed: installed[];
    linked: linked[];
  };
  packs: {
    linked: linked[];
  };
  template: {
    plugins: string[];
    packs: string[];
  };
}
