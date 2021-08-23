export interface commandItem {
  command: string;
  action: (...args: any[]) => void | Promise<void>;
  option?: string[][];
  requiredOption?: string[][];
  argument?: string[];
  description?: string;
}

export interface heyConfig {
  name: string;
  version: string;
  registry: commandItem[];
}
