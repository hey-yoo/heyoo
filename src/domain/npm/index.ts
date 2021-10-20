import axios from 'axios';
import { npmPkgInfo } from './types';
import { label } from 'chalk-ex';

export const getNpmPkgInfo = (pkg: string): Promise<npmPkgInfo | undefined> => {
  return new Promise((resolve) => {
    axios
      .get<npmPkgInfo>(`https://registry.npmjs.org/${pkg}`, {
        timeout: 2 * 1000,
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        console.log(label.error, err.message, err?.response?.data || '');
        resolve(undefined);
      });
  });
};
