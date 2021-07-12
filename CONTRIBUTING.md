# Contributing to this project

1) At the moment you must `npm install` in dirs:

   - logic
   - view
   - view/KickBotter

    Pretty boring, will change soon (at least through shortcuts).
    Though I was thinking about keeping *node_modules* (dir/package.json) separated and grouping all production dependencies in `KickBotter/package.json`.

2) DEV (from `view` directory):

    - `npm run build` will build programs' logic and electron (rendering will have webpack-watch=true)
    - `npm run build:logic`
    - `npm run build:view` (also copies some needed file)
    - `npm run start` to start builded app with electron

3) Production (from `view` directory):

    - `npm run forge:build` normal build plus **electron-forge make** to build final executive
    - `npm run forge:start` same start as before but through **electron-forge start**
