"use strict";
/**
 * Docker Watch Reload
 * Watch source files and automatically rebuild Docker containers on change.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = exports.buildAndRestart = exports.createWatcher = exports.parseCompose = void 0;
var compose_js_1 = require("./compose.js");
Object.defineProperty(exports, "parseCompose", { enumerable: true, get: function () { return compose_js_1.parseCompose; } });
var watcher_js_1 = require("./watcher.js");
Object.defineProperty(exports, "createWatcher", { enumerable: true, get: function () { return watcher_js_1.createWatcher; } });
var builder_js_1 = require("./builder.js");
Object.defineProperty(exports, "buildAndRestart", { enumerable: true, get: function () { return builder_js_1.buildAndRestart; } });
var config_js_1 = require("./config.js");
Object.defineProperty(exports, "loadConfig", { enumerable: true, get: function () { return config_js_1.loadConfig; } });
//# sourceMappingURL=index.js.map