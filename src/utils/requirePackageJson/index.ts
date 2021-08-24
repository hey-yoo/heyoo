import { fsExtra } from 'hey-yoo-utils';

interface pkg {
  name: string;
  version: string;
  description: string;
  [key: string]: string;
}

export default function requirePackageJson(filepath: string): pkg | undefined {
  return fsExtra.readJson(filepath) as pkg | undefined;
}
