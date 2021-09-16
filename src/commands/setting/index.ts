import { createRequire } from 'module';
import { settingPath } from '../../utils/path';

const require = createRequire(import.meta.url);
const open = require('open');

export default function setting() {
  open(settingPath);
}
