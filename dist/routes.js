"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterRoutes = void 0;
const http_errors_1 = require("http-errors");
const lib_1 = require("./lib");
function sendFile(file, res) {
    res.header('Content-Type', file.type || '');
    res.header('Cache-Control', 'public,immutable,max-age=31536000');
    res.status(200).send(file.data);
}
function RegisterRoutes(app) {
    app.get("/", async (req, res, next) => {
        var _a;
        try {
            const outpoint = await (0, lib_1.loadPointerFromDNS)(req.hostname);
            let file = await (0, lib_1.loadInscription)(outpoint);
            if (file.type === 'ord-fs/json' && !req.query['raw']) {
                (_a = req.res) === null || _a === void 0 ? void 0 : _a.redirect('index.html');
                return;
            }
            sendFile(file, res);
        }
        catch (err) {
            next(err);
        }
    });
    app.get("/:filename", loadFileOrOrdfs);
    app.get("/content/:filename", loadFileOrOrdfs);
    async function loadFileOrOrdfs(req, res, next) {
        var _a;
        const filename = req.params.filename;
        try {
            let pointer;
            let file;
            try {
                file = await (0, lib_1.loadInscription)(filename);
                if (file.type === 'ord-fs/json' && !req.params.raw) {
                    (_a = req.res) === null || _a === void 0 ? void 0 : _a.redirect(`/${filename}/index.html`);
                    return;
                }
            }
            catch (e) {
                console.error('Outpoint Error', filename, e);
                pointer = await (0, lib_1.loadPointerFromDNS)(req.hostname);
                const dirData = await (0, lib_1.loadInscription)(pointer);
                const dir = JSON.parse(dirData.data.toString('utf8'));
                if (!dir[filename]) {
                    throw new http_errors_1.NotFound();
                }
                pointer = dir[filename].slice(6);
                file = await (0, lib_1.loadInscription)(pointer);
            }
            sendFile(file, res);
        }
        catch (err) {
            next(err);
        }
    }
    app.get("/:pointer/:filename", loadFile);
    app.get("/content/:pointer/:filename", loadFile);
    async function loadFile(req, res, next) {
        try {
            let pointer = req.params.pointer;
            const filename = req.params.filename;
            const dirData = await (0, lib_1.loadInscription)(pointer);
            const dir = JSON.parse(dirData.data.toString('utf8'));
            if (!dir[filename]) {
                throw new http_errors_1.NotFound();
            }
            if (dir[filename].startsWith('ord://')) {
                pointer = dir[filename].slice(6);
            }
            else {
                pointer = dir[filename];
            }
            const file = await (0, lib_1.loadInscription)(pointer);
            sendFile(file, res);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.RegisterRoutes = RegisterRoutes;
//# sourceMappingURL=routes.js.map