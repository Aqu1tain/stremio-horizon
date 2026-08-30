// Copyright (C) 2017-2026 Smart code 203358507

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const budget = require('../bundle-size-budget.json');

const root = path.resolve(__dirname, '..');
const buildDirectory = path.join(root, 'build');
const indexPath = path.join(buildDirectory, 'index.html');
const checkBudget = process.argv.includes('--check');

const formatBytes = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`;

if (!fs.existsSync(indexPath)) {
    throw new Error('Production build not found. Run `pnpm build` first.');
}

const html = fs.readFileSync(indexPath, 'utf8');
const scriptSources = Array.from(html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g), (match) => match[1])
    .filter((source) => !source.startsWith('//') && !/^https?:/.test(source) && source.endsWith('.js'));

if (scriptSources.length === 0) {
    throw new Error('No initial JavaScript entry point was found in build/index.html.');
}

const initialAssets = scriptSources.map((source) => {
    const filePath = path.join(buildDirectory, source);
    const contents = fs.readFileSync(filePath);
    return {
        source,
        raw: contents.length,
        gzip: zlib.gzipSync(contents, { level: 9 }).length,
        brotli: zlib.brotliCompressSync(contents, {
            params: {
                [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
            },
        }).length,
    };
});

const totals = initialAssets.reduce((result, asset) => ({
    raw: result.raw + asset.raw,
    gzip: result.gzip + asset.gzip,
    brotli: result.brotli + asset.brotli,
}), { raw: 0, gzip: 0, brotli: 0 });

console.log('Initial JavaScript');
initialAssets.forEach((asset) => {
    console.log(`- ${asset.source}: ${formatBytes(asset.raw)} raw, ${formatBytes(asset.gzip)} gzip, ${formatBytes(asset.brotli)} Brotli`);
});
console.log(`- total: ${formatBytes(totals.raw)} raw, ${formatBytes(totals.gzip)} gzip, ${formatBytes(totals.brotli)} Brotli`);

const wasmAssets = [];
const visit = (directory) => {
    fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            visit(entryPath);
        } else if (entry.name.endsWith('.wasm')) {
            wasmAssets.push(entryPath);
        }
    });
};
visit(buildDirectory);
const wasmBytes = wasmAssets.reduce((total, filePath) => total + fs.statSync(filePath).size, 0);
console.log(`Core WASM (tracked separately): ${formatBytes(wasmBytes)}`);

const initialScriptsDirectory = path.dirname(path.join(buildDirectory, initialAssets[0].source));
const emittedScripts = fs.readdirSync(initialScriptsDirectory);
const missingLazyRoutes = budget.requiredLazyRoutes.filter((route) => {
    return !emittedScripts.some((fileName) => new RegExp(`^${route}\\.[a-f0-9]+\\.js$`).test(fileName));
});

if (missingLazyRoutes.length > 0) {
    throw new Error(`Missing production lazy-route chunks: ${missingLazyRoutes.join(', ')}`);
}
console.log(`Lazy-route smoke check: ${budget.requiredLazyRoutes.join(', ')}`);

const serviceWorkerPath = path.join(buildDirectory, 'service-worker.js');
if (fs.existsSync(serviceWorkerPath)) {
    const serviceWorker = fs.readFileSync(serviceWorkerPath, 'utf8');
    const precachedAssets = Array.from(serviceWorker.matchAll(/url:"([^"]+)"/g), (match) => match[1]);
    const eagerlyCachedOptionalAssets = precachedAssets.filter((asset) => {
        return asset.includes('locale-') || asset.includes('legacy-icons.') || asset.endsWith('.map');
    });
    if (eagerlyCachedOptionalAssets.length > 0) {
        throw new Error(`Optional assets must be cached on demand: ${eagerlyCachedOptionalAssets.join(', ')}`);
    }
    console.log('Service-worker optional chunks: cached on demand');
}

if (checkBudget) {
    const exceeded = Object.entries(budget.initialJavaScript)
        .filter(([encoding, limit]) => totals[encoding] > limit)
        .map(([encoding, limit]) => `${encoding}: ${formatBytes(totals[encoding])} > ${formatBytes(limit)}`);

    if (exceeded.length > 0) {
        throw new Error(`Initial JavaScript budget exceeded:\n${exceeded.join('\n')}`);
    }
    console.log('Initial JavaScript budget: passed');
}
