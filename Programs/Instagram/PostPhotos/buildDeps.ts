import fs from 'fs';
import { join } from 'path';

import { Models } from './postPhotos';

const buildDeps = (dirPath: string): Models.Deps => {
  const files: string[] = fs.readdirSync(dirPath);
  const imgs: string[] = files.filter((file) => file.match(/\.jpe?g$/));

  let photos: Models.Photo[] = [];

  imgs.forEach((img) => {
    const description = join(dirPath, img.replace(/\.jpe?g$/, ".txt"));
    photos.push({
      imagesSystemPath: join(dirPath, img),
      description: fs.existsSync(description) ? description : "",
    });
  });
  return { photos };
};

export default buildDeps;
