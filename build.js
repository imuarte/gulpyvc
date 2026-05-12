const esbuild = require('esbuild');
const fs = require('fs');

const banner = `// ==UserScript==
// @name         GulpyVC
// @namespace    gulpyvc
// @version      1.0.0
// @description  Voice chat for gulper.io
// @author       imuarte
// @match        *://gulper.io/*
// @updateURL    https://raw.githubusercontent.com/imuarte/gulpyvc/master/dist/gulpyvc.user.js
// @downloadURL  https://raw.githubusercontent.com/imuarte/gulpyvc/master/dist/gulpyvc.user.js
// @license      MIT
// @grant        none
// ==/UserScript==
`;

const outFile = 'dist/gulpyvc.user.js';

async function build() {
    const result = await esbuild.build({
        entryPoints: ['src/index.js'],
        bundle: true,
        write: false,
        minify: false,
        target: 'es2020',
        sourcemap: false,
        legalComments: 'none',
        loader: { '.svg': 'text' },
        outfile: outFile,
    });

    const code = result.outputFiles[0].text;
    fs.writeFileSync(outFile, `${banner}${code}`, 'utf8');
    console.log('Build ready: ' + outFile);
}

build().catch(e => { console.error(e); process.exit(1); });
