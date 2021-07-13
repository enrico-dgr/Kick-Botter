# Contributing to this project

1) `npm run install:all` in base directory

2) DEV (from `view` directory):

    - `npm run build` will build main process before rendering process on watch-mode and source-maps on
    - `npm run start:dev` runs the previous command plus start the app with electron

3) Production (from base directory):

    - `npm run build:prod` has watch-mode off and source-maps off
    - `npm run start` same start as before but through **electron-forge start**
