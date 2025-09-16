import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import fs from 'fs';
import path from 'path';
// docs: https://vitejs.dev/guide/build.html
export default defineConfig({
    base: '',
    root: 'site',
    publicDir: 'public',
    build: {
        outDir: './build/',
        emptyOutDir: false,
        rollupOptions: {
            input: { index: 'src/index.js' },
            output: {
                entryFileNames: `[name].js`,
                chunkFileNames: `[name].js`,
                assetFileNames: `[name].[ext]`,
            },
        },
        sourcemap: true,
    },
    plugins: [
        svelte(),
        {
            name: 'serve-static-files',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    // Handle root path redirect
                    if (req.url === '/') {
                        res.writeHead(302, { Location: '/index.html' });
                        res.end();
                        return;
                    }

                    // Handle static JSON files - serve directly from site directory
                    if (req.url === '/index.json' || req.url === '/extremes.json') {
                        const fileName = req.url.substring(1); // remove leading slash
                        const filePath = path.join(process.cwd(), 'site', fileName);

                        try {
                            if (fs.existsSync(filePath)) {
                                const content = fs.readFileSync(filePath, 'utf8');
                                res.setHeader('Content-Type', 'application/json');
                                res.setHeader('Cache-Control', 'no-cache');
                                res.end(content);
                                return;
                            }
                        } catch (error) {
                            console.error('Error serving JSON file:', error);
                        }
                    }

                    // Handle data files - serve from site/data/ directory
                    if (req.url.startsWith('/data/')) {
                        const filePath = path.join(process.cwd(), 'site', req.url);

                        try {
                            if (fs.existsSync(filePath)) {
                                const content = fs.readFileSync(filePath, 'utf8');
                                res.setHeader('Content-Type', 'application/json');
                                res.setHeader('Cache-Control', 'no-cache');
                                res.end(content);
                                return;
                            }
                        } catch (error) {
                            console.error('Error serving data file:', error);
                        }
                    }

                    next();
                });
            },
        },
    ],
});
