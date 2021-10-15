import { settingPath } from '../../utils/path';
import { open } from '../../deps';

export default function setting() {
  open(settingPath);
}
