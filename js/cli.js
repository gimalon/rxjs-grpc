"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var minimist = require("minimist");
var protobuf = require("protobufjs");
var tmp = require("tmp");
var mz_1 = require("mz");
var bluebird_1 = require("bluebird");
var jscodeshift = require('jscodeshift');
var pbjs = bluebird_1.promisify(require('protobufjs/cli/pbjs').main);
var pbts = bluebird_1.promisify(require('protobufjs/cli/pbts').main);
var createTempDir = bluebird_1.promisify(function (callback) {
    tmp.dir({ unsafeCleanup: true }, function (error, name, removeCallback) {
        callback(error, { name: name, removeCallback: removeCallback, fd: -1 });
    });
});
function bootstrap() {
    main(process.argv.slice(2))
        .then(function (code) { return process.exit(code); })
        .catch(function (error) {
        console.error(error);
        process.exit(1);
    });
}
exports.bootstrap = bootstrap;
function main(args) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, protoFiles, out, ts;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = minimist(args, {
                        alias: {
                            out: 'o'
                        },
                        string: ['out']
                    }), protoFiles = _a._, out = _a.out;
                    if (protoFiles.length === 0) {
                        printUsage();
                        return [2 /*return*/, 1];
                    }
                    return [4 /*yield*/, buildTypeScript(protoFiles)];
                case 1:
                    ts = _b.sent();
                    if (!out) return [3 /*break*/, 3];
                    return [4 /*yield*/, mz_1.fs.writeFile(out, ts)];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    process.stdout.write(ts);
                    _b.label = 4;
                case 4: return [2 /*return*/, 0];
            }
        });
    });
}
exports.main = main;
function buildTypeScript(protoFiles) {
    return __awaiter(this, void 0, void 0, function () {
        var tempDir, jsFile, jsonDescriptor, root, js, _a, tsFile, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, createTempDir()];
                case 1:
                    tempDir = _c.sent();
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, , 9, 10]);
                    return [4 /*yield*/, call(tempDir.name, pbjs, protoFiles, 'js', ['keep-case'], {
                            target: 'static-module',
                            wrap: 'commonjs',
                        })];
                case 3:
                    jsFile = _c.sent();
                    return [4 /*yield*/, call(tempDir.name, pbjs, protoFiles, 'js', ['keep-case'], { target: 'json' })];
                case 4:
                    jsonDescriptor = _c.sent();
                    root = protobuf.loadSync(jsonDescriptor);
                    _a = transformJavaScriptSource;
                    return [4 /*yield*/, mz_1.fs.readFile(jsFile, 'utf8')];
                case 5:
                    js = _a.apply(void 0, [_c.sent(), root]);
                    return [4 /*yield*/, mz_1.fs.writeFile(jsFile, js)];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, call(tempDir.name, pbts, [jsFile], 'ts')];
                case 7:
                    tsFile = _c.sent();
                    _b = transformTypeScriptSource;
                    return [4 /*yield*/, mz_1.fs.readFile(tsFile, 'utf8')];
                case 8: return [2 /*return*/, _b.apply(void 0, [_c.sent()])];
                case 9:
                    tempDir.removeCallback();
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.buildTypeScript = buildTypeScript;
function buildTypeScriptFromSources(protoSources) {
    return __awaiter(this, void 0, void 0, function () {
        var tempDir, protoFiles, _i, protoSources_1, source, file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createTempDir()];
                case 1:
                    tempDir = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 8, 9]);
                    protoFiles = [];
                    _i = 0, protoSources_1 = protoSources;
                    _a.label = 3;
                case 3:
                    if (!(_i < protoSources_1.length)) return [3 /*break*/, 6];
                    source = protoSources_1[_i];
                    file = tempDir.name + "/" + Math.random() + ".proto";
                    return [4 /*yield*/, mz_1.fs.writeFile(file, source)];
                case 4:
                    _a.sent();
                    protoFiles.push(file);
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [4 /*yield*/, buildTypeScript(protoFiles)];
                case 7: return [2 /*return*/, _a.sent()];
                case 8:
                    tempDir.removeCallback();
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.buildTypeScriptFromSources = buildTypeScriptFromSources;
function printUsage() {
    console.log('Usage: rxjs-grpc -o [output] file.proto');
    console.log('');
    console.log('Options:');
    console.log('  -o, --out    Saves to a file instead of writing to stdout');
    console.log('');
}
function transformJavaScriptSource(source, root) {
    var ast = jscodeshift(source);
    // Fix fields with enum type
    fixEnums(ast, root);
    // Change constructors to interfaces and remove their parameters
    constructorsToInterfaces(ast);
    // Clean method signatures
    cleanMethodSignatures(ast);
    // Add the ClientFactory and ServerBuilder interfaces
    getNamepaceDeclarations(ast)
        .closestScope()
        .forEach(function (path) { return addFactoryAndBuild(jscodeshift(path.node)); });
    // Render AST
    return ast.toSource();
}
function fixEnums(ast, root) {
    for (var _i = 0, _a = collectMessages(ast); _i < _a.length; _i++) {
        var message = _a[_i];
        var type = root.lookupType(message.reference);
        for (var _b = 0, _c = type.fieldsArray; _b < _c.length; _b++) {
            var field = _c[_b];
            var enumType = field.resolve().resolvedType;
            if (enumType instanceof protobuf.Enum) {
                fixEnumField(message, field);
            }
        }
    }
}
function fixEnumField(message, field) {
    // remove the initial dot
    var fullType = field.resolvedType.fullName.substring(1);
    // enumType
    message.scope
        .find(jscodeshift.AssignmentExpression, {
        left: {
            type: 'MemberExpression',
            object: {
                type: 'MemberExpression',
                property: {
                    name: 'prototype'
                }
            },
            property: {
                name: field.name
            }
        }
    })
        .closest(jscodeshift.ExpressionStatement)
        .filter(function (p) { return p.node.comments; })
        .forEach(function (path) {
        path.node.comments.forEach(function (comment) {
            comment.value = comment.value.replace(/^([\s]*\*[\s]*@type[\s]+\{)number(\}|\|)/gm, function (_, prefix, postfix) { return "" + prefix + fullType + postfix; });
        });
        jscodeshift(path).replaceWith(path.node);
    });
}
function transformTypeScriptSource(source) {
    // Remove imports
    source = source.replace(/^import.*?$\n?/mg, '');
    // Add our imports
    source = "import { Observable } from 'rxjs';\n" + source;
    // Fix generic type syntax
    source = source.replace(/Observable\.</g, 'Observable<');
    // Export interfaces, enums and namespaces
    source = source.replace(/^(\s+)(interface|enum|namespace)(\s+)/mg, '$1 export $2$3');
    return source;
}
function addFactoryAndBuild(ast) {
    var services = collectServices(ast);
    var declaration = getNamepaceDeclarations(ast);
    var namespace = getNamepaceName(declaration);
    var ownServices = services
        .filter(function (service) { return service.reference.startsWith(namespace); })
        .filter(function (service) {
        var relative = service.reference.substring(namespace.length + 1);
        return !relative.includes('.');
    });
    declaration.insertBefore(sourceToNodes(buildClientFactorySource(namespace, ownServices)));
    declaration.insertBefore(sourceToNodes(buildServerBuilderSource(namespace, ownServices)));
}
function collectServices(ast) {
    var services = [];
    ast
        .find(jscodeshift.FunctionDeclaration)
        .filter(function (p) { return p.node.comments; })
        .filter(function (p) { return p.node.params.length > 1; })
        .forEach(function (p) {
        var reference = getReference(p);
        if (reference) {
            services.push({ reference: reference, name: p.node.id.name });
        }
    });
    return services;
}
function collectMessages(ast) {
    var messages = [];
    ast
        .find(jscodeshift.FunctionDeclaration)
        .filter(function (p) { return p.node.comments; })
        .filter(function (p) { return p.node.params.length === 1; })
        .forEach(function (p) {
        var reference = getReference(p);
        if (reference) {
            messages.push({
                reference: reference,
                name: p.node.id.name,
                scope: jscodeshift(p.parent).closestScope()
            });
        }
    });
    return messages;
}
function getReference(commentedNodePath) {
    return commentedNodePath.node.comments
        .map(function (comment) { return /@exports\s+([^\s]+)/.exec(comment.value); })
        .map(function (match) { return match ? match[1] : undefined; })
        .filter(function (match) { return match; })[0];
}
function constructorsToInterfaces(ast) {
    ast
        .find(jscodeshift.FunctionDeclaration)
        .forEach(function (path) {
        path.node.comments.forEach(function (comment) {
            comment.value = comment.value.replace(/@constructor/g, '@interface');
            comment.value = comment.value.replace(/^[\s\*]+@extends.*$/gm, '');
            comment.value = comment.value.replace(/^[\s\*]+@param.*$/gm, '');
            comment.value = comment.value.replace(/^[\s\*]+@returns.*$/gm, '');
        });
        jscodeshift(path).replaceWith(path.node);
    });
}
function cleanMethodSignatures(ast) {
    ast
        .find(jscodeshift.ExpressionStatement)
        .filter(function (path) { return path.node.comments; })
        .forEach(function (path) {
        if (path.node.expression.type === 'AssignmentExpression') {
            var left = jscodeshift(path.node.expression.left).toSource();
            // do not remove enums
            if (path.node.comments.some(function (comment) { return /@enum/.test(comment.value); })) {
                return;
            }
            // Remove static methods and converter methods, we export simple interfaces
            if (!/\.prototype\./.test(left) || /\.(toObject|toJSON)/.test(left)) {
                path.node.comments = [];
            }
        }
        var returnType;
        path.node.comments.forEach(function (comment) {
            // Remove callback typedefs, as we use Observable instead of callbacks
            if (/@typedef\s+\w+_Callback/.test(comment.value)) {
                comment.value.replace(/@param\s+\{([^\}]+)\}[^\n]*response/g, function (_, type) {
                    returnType = type;
                });
                comment.value = '';
            }
            // Change signature of service methods
            if (/@param\s+[^\n]*_Callback/.test(comment.value)) {
                comment.value = comment.value.replace(/^[\s\*]+@param\s+[^\n]*_Callback.*$\n?/gm, '');
                comment.value = comment.value.replace(/(@param\s*\{.*?)\|Object(\})/g, '$1$2');
                if (returnType) {
                    comment.value = comment.value.replace(/@returns.*$/gm, "@returns {Observable<" + returnType + ">}");
                }
            }
        });
        // Remove empty comments
        path.node.comments = path.node.comments.filter(function (x) { return x.value; });
        jscodeshift(path).replaceWith(path.node);
    });
}
function sourceToNodes(source) {
    return jscodeshift(source).paths()[0].node.program.body;
}
function buildClientFactorySource(namespace, services) {
    return "\n    /**\n     * Contains all the RPC service clients.\n     * @exports " + namespace + ".ClientFactory\n     * @interface\n     */\n    function ClientFactory() {}\n\n    " + services.map(function (service) { return "\n      /**\n       * Returns the " + service.name + " service client.\n       * @returns {" + service.reference + "}\n       */\n      ClientFactory.prototype.get" + service.name + " = function() {};\n    "; }).join('\n') + "\n  ";
}
function getNamepaceName(declarations) {
    var namespaceName = '';
    declarations.paths()[0].node.comments.forEach(function (comment) {
        comment.value.replace(/@exports\s+([^\s]+)/g, function (_, reference) {
            namespaceName = reference;
        });
    });
    return namespaceName;
}
function buildServerBuilderSource(namespace, services) {
    return "\n    /**\n     * Builder for an RPC service server.\n     * @exports " + namespace + ".ServerBuilder\n     * @interface\n     */\n    function ServerBuilder() {}\n\n    " + services.map(function (service) { return "\n      /**\n       * Adds a " + service.name + " service implementation.\n       * @param {" + service.reference + "} impl " + service.name + " service implementation\n       * @returns {" + namespace + ".ServerBuilder}\n       */\n      ServerBuilder.prototype.add" + service.name + " = function() {};\n    "; }).join('\n') + "\n  ";
}
function getNamepaceDeclarations(ast) {
    return ast
        .find(jscodeshift.VariableDeclaration)
        .filter(function (path) { return path.node.comments; })
        .filter(function (path) { return path.node.comments.some(function (comment) {
        return /@namespace/.test(comment.value);
    }); });
}
function call(tempDir, func, files, ext, flags, opts) {
    if (ext === void 0) { ext = 'js'; }
    if (flags === void 0) { flags = []; }
    if (opts === void 0) { opts = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var out, all, args;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    out = tempDir + "/" + Math.random() + "." + ext;
                    all = __assign({}, opts, { out: out });
                    args = Object.keys(all).map(function (name) { return ["--" + name, all[name]]; });
                    return [4 /*yield*/, func(flatten(args).concat(flags.map(function (name) { return "--" + name; }), files))];
                case 1:
                    _a.sent();
                    return [2 /*return*/, out];
            }
        });
    });
}
function flatten(arr) {
    return (_a = Array.prototype).concat.apply(_a, arr);
    var _a;
}
//# sourceMappingURL=cli.js.map