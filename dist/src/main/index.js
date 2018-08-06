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
function toMetaAssertDelegate(metaF) {
    if (metaF == undefined) {
        return sd.undef();
    }
    else {
        //This should be fine because we checked it was not null
        const f = metaF;
        return sd.toAssertDelegateExact(f);
    }
}
exports.toMetaAssertDelegate = toMetaAssertDelegate;
function partialDocument(dataF, metaF) {
    return sd.toSchema({
        data: sd.maybe(dataF),
        errors: sd.maybe(sd.array(exports.errorObject)),
        meta: sd.maybe(toMetaAssertDelegate(metaF)),
        jsonapi: sd.maybe(exports.jsonApi),
        links: sd.maybe(exports.linkCollection),
        included: sd.maybe(sd.or(sd.array(exports.resource), sd.array(exports.serverResource)))
    });
}
exports.partialDocument = partialDocument;
function isOptional(f) {
    return sd.isOptional(f) || sd.isNullable(f);
}
exports.isOptional = isOptional;
function isBothOptional(f0, f1) {
    return isOptional(f0) && isOptional(f1);
}
exports.isBothOptional = isBothOptional;
function toDocumentDataAssertDelegate(dataF) {
    const result = isOptional(dataF) ?
        sd.toSchema({}) :
        sd.toSchema({
            data: sd.notMaybe(dataF)
        });
    return result;
}
exports.toDocumentDataAssertDelegate = toDocumentDataAssertDelegate;
function toDocumentMetaAssertDelegate(metaF) {
    const metaD = toMetaAssertDelegate(metaF);
    const result = isOptional(metaD) ?
        sd.toSchema({}) :
        sd.toSchema({
            meta: sd.notMaybe(metaD)
        });
    return result;
}
exports.toDocumentMetaAssertDelegate = toDocumentMetaAssertDelegate;
function document(dataF, metaF) {
    const metaD = toMetaAssertDelegate(metaF);
    if (isBothOptional(dataF, metaD)) {
        throw new Error(`'data' and 'meta' fields of a JSON API document cannot both be optional; makes it possible for both to be missing without setting 'errors'`);
    }
    const result = sd.intersect(partialDocument(dataF, metaD), toDocumentDataAssertDelegate(dataF), toDocumentMetaAssertDelegate(metaD));
    return result;
}
exports.document = document;
function serverDocument(dataF, metaF) {
    const result = sd.intersect(document(dataF, metaF), sd.toSchema({
        included: sd.maybe(sd.array(exports.serverResource))
    }));
    return result;
}
exports.serverDocument = serverDocument;
//# sourceMappingURL=index.js.map