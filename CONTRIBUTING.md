# Contributing to this project

1) `npm run install:all` in base directory  
(thanks to @williamlucacosta)

2) DEV (from `view` directory):

    - `npm run build` will build programs' logic and electron (rendering will have webpack-watch=true)
    - `npm run build:logic`
    - `npm run build:view` (also copies some needed file)
    - `npm run start` to start builded app with electron

3) Production (from base directory):

    - `npm run build:prod` normal build plus **electron-forge make** to build final executive
    - `npm run start` same start as before but through **electron-forge start**
