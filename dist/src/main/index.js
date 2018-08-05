"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sd = require("schema-decorator");
exports.anyDictionary = ((name, mixed) => {
    if (!(mixed instanceof Object)) {
        throw new Error(`Expected ${name} to be an Object; received ${typeof mixed}(${mixed})`);
    }
    if ((mixed instanceof Date) ||
        (mixed instanceof Array) ||
        (mixed instanceof Function) ||
        (mixed instanceof Boolean) ||
        (mixed instanceof Number) ||
        (mixed instanceof String) ||
        (mixed instanceof Symbol)) {
        throw new Error(`Expected ${name} to be an Object`);
    }
    return mixed;
});
exports.meta = exports.anyDictionary;
//http://jsonapi.org/format/#document-links
exports.link = sd.toSchema({
    //a string containing the link’s URL.
    href: sd.string(),
    //a meta object containing non-standard meta-information about the link.
    meta: sd.maybe(exports.meta),
});
exports.stringOrLink = sd.or(sd.string(), exports.link);
exports.linkCollection = sd.dictionary(sd.maybe(exports.stringOrLink));
exports.errorLinkCollection = sd.intersect(exports.linkCollection, sd.toSchema({
    about: exports.stringOrLink
}));
exports.errorSource = sd.toSchema({
    pointer: sd.maybe(sd.string()),
    parameter: sd.maybe(sd.string()),
});
exports.errorObject = sd.toSchema({
    id: sd.maybe(sd.string()),
    links: sd.maybe(exports.errorLinkCollection),
    status: sd.maybe(sd.string()),
    code: sd.maybe(sd.string()),
    title: sd.maybe(sd.string()),
    detail: sd.maybe(sd.string()),
    source: sd.maybe(exports.errorSource),
    meta: sd.maybe(exports.meta),
});
exports.attributeCollection = exports.anyDictionary;
exports.resourceIdentifier = sd.toSchema({
    type: sd.string(),
    id: sd.string(),
    meta: sd.maybe(exports.meta),
});
exports.resourceLinkage = sd.or(exports.resourceIdentifier, sd.array(exports.resourceIdentifier));
exports.partialRelationship = sd.toSchema({
    links: sd.maybe(exports.linkCollection),
    data: sd.maybe(exports.resourceLinkage),
    meta: sd.maybe(exports.meta),
});
exports.relationship = sd.or(sd.intersect(exports.partialRelationship, sd.toSchema({ links: exports.linkCollection })), sd.intersect(exports.partialRelationship, sd.toSchema({ data: exports.resourceLinkage })), sd.intersect(exports.partialRelationship, sd.toSchema({ meta: exports.meta })));
exports.resource = sd.toSchema({
    id: sd.maybe(sd.string()),
    type: sd.string(),
    attributes: sd.maybe(exports.attributeCollection),
    relationships: sd.maybe(exports.relationship),
    links: sd.maybe(exports.linkCollection),
    meta: sd.maybe(exports.meta),
});
exports.serverResource = sd.intersect(exports.resource, sd.toSchema({
    id: sd.string(),
}));
exports.jsonApi = sd.toSchema({
    version: sd.maybe(sd.literal("1.0")),
    meta: sd.maybe(exports.meta),
});
function partialDocument(dataF, metaF) {
    const r = sd.toSchema({
        data: sd.maybe(dataF),
        errors: sd.maybe(sd.array(exports.errorObject)),
        meta: sd.maybe(metaF),
        jsonapi: sd.maybe(exports.jsonApi),
        links: sd.maybe(exports.linkCollection),
        included: sd.maybe(sd.or(sd.array(exports.resource), sd.array(exports.serverResource)))
    });
    return r;
}
exports.partialDocument = partialDocument;
function document(dataF, metaF) {
    if (metaF == undefined) {
        //Kind of a hacky implementation
        metaF = sd.undef();
    }
    const dataOptional = (sd.isOptional(dataF) || sd.isNullable(dataF));
    const metaOptional = (sd.isOptional(metaF) || sd.isNullable(metaF));
    if (dataOptional && metaOptional) {
        throw new Error(`'data' and 'meta' fields of a JSON API document cannot both be optional; makes it possible for both to be missing without setting 'errors'`);
    }
    if (dataOptional) {
        return sd.intersect(partialDocument(dataF, metaF), sd.toSchema({
            meta: sd.notMaybe(metaF)
        }));
    }
    else if (metaOptional) {
        return sd.intersect(partialDocument(dataF, metaF), sd.toSchema({
            data: sd.notMaybe(dataF)
        }));
    }
    else {
        return sd.intersect(partialDocument(dataF, metaF), sd.toSchema({
            data: sd.notMaybe(dataF),
            meta: sd.notMaybe(metaF),
        }));
    }
}
exports.document = document;
function serverDocument(dataF, metaF) {
    if (metaF == undefined) {
        //Kind of a hacky implementation
        metaF = sd.undef();
    }
    const result = sd.intersect(document(dataF, metaF), sd.toSchema({
        included: sd.maybe(sd.array(exports.serverResource))
    }));
    return result;
}
exports.serverDocument = serverDocument;
//# sourceMappingURL=index.js.map