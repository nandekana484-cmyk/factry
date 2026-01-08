"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
exports.get = get;
exports.all = all;
exports.createUserSync = createUserSync;
exports.findUserByEmail = findUserByEmail;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = require("path");
const fs_1 = __importDefault(require("fs"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dataDir = (0, path_1.join)(process.cwd(), 'data');
if (!fs_1.default.existsSync(dataDir))
    fs_1.default.mkdirSync(dataDir, { recursive: true });
const dbPath = (0, path_1.join)(dataDir, 'database.sqlite');
const db = new better_sqlite3_1.default(dbPath);
function run(sql, params) {
    const stmt = db.prepare(sql);
    if (params === undefined)
        return stmt.run();
    if (Array.isArray(params))
        return stmt.run(...params);
    return stmt.run(params);
}
function get(sql, params) {
    const stmt = db.prepare(sql);
    if (params === undefined)
        return stmt.get();
    if (Array.isArray(params))
        return stmt.get(...params);
    return stmt.get(params);
}
function all(sql, params) {
    const stmt = db.prepare(sql);
    if (params === undefined)
        return stmt.all();
    if (Array.isArray(params))
        return stmt.all(...params);
    return stmt.all(params);
}
function createUserSync(email, passwordPlain, role = 'user') {
    const hash = bcryptjs_1.default.hashSync(passwordPlain, 10);
    const stmt = db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)');
    return stmt.run(email, hash, role);
}
function findUserByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}
exports.default = db;
