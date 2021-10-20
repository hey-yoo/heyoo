export interface npmPkgInfo {
  _id: string;
  _rev: string;
  name: string;
  'dist-tags': {
    latest: string;
  };
  versions: {
    [key: string]: string | number | boolean;
  }[];
  description: string;
  homepage: string;
  keywords: string[];
  repository: {
    type: string;
    url: string;
  };
  author: string;
  license: string;
}
