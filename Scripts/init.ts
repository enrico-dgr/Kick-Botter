import fs from 'fs';

import * as CONSTAMTS from './CONSTANTS';

const init = () => {
  fs.existsSync(CONSTAMTS.BUILD_PATH)
    ? undefined
    : fs.mkdirSync(CONSTAMTS.BUILD_PATH, { recursive: false });
};

export default init;
