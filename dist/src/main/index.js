"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sd = require("schema-decorator");
//TODO restrict member names? http://jsonapi.org/format/#document-member-names
exports.assertDictionary = (name, mixed) => {
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
};
exports.assertMeta = exports.assertDictionary;
//http://jsonapi.org/format/#document-links
class Link {
    constructor() {
        //a string containing the link’s URL.
        this.href = "http://example.com";
    }
}
__decorate([
    sd.assert(sd.string())
], Link.prototype, "href", void 0);
__decorate([
    sd.assert(sd.maybe(exports.assertMeta))
], Link.prototype, "meta", void 0);
exports.Link = Link;
exports.assertStringOrLink = sd.or(sd.string(), sd.nested(Link));
exports.assertLinkCollection = (name, mixed) => {
    mixed = exports.assertDictionary(name, mixed);
    for (let field in mixed) {
        if (mixed.hasOwnProperty(field)) {
            mixed[field] = exports.assertStringOrLink(`${name}[${field}]`, mixed[field]);
        }
    }
    return mixed;
};
exports.assertErrorLinkCollection = sd.and(exports.assertLinkCollection, (name, mixed) => {
    if (mixed.about != undefined) {
        return mixed;
    }
    else {
        throw new Error(`Expected ${name} to have field "about"`);
    }
});
class ErrorSource {
}
__decorate([
    sd.assert(sd.maybe(sd.string()))
], ErrorSource.prototype, "pointer", void 0);
__decorate([
    sd.assert(sd.maybe(sd.string()))
], ErrorSource.prototype, "parameter", void 0);
exports.ErrorSource = ErrorSource;
//http://jsonapi.org/format/#errors-processing
class ErrorObject {
}
__decorate([
    sd.assert(sd.maybe(sd.string()))
], ErrorObject.prototype, "id", void 0);
__decorate([
    sd.assert(sd.maybe(exports.assertErrorLinkCollection))
], ErrorObject.prototype, "links", void 0);
__decorate([
    sd.assert(sd.maybe(sd.string()))
], ErrorObject.prototype, "status", void 0);
__decorate([
    sd.assert(sd.maybe(sd.string()))
], ErrorObject.prototype, "code", void 0);
__decorate([
    sd.assert(sd.maybe(sd.string()))
], ErrorObject.prototype, "title", void 0);
__decorate([
    sd.assert(sd.maybe(sd.string()))
], ErrorObject.prototype, "detail", void 0);
__decorate([
    sd.assert(sd.maybe(sd.nested(ErrorSource)))
], ErrorObject.prototype, "source", void 0);
__decorate([
    sd.assert(sd.maybe(exports.assertMeta))
], ErrorObject.prototype, "meta", void 0);
exports.ErrorObject = ErrorObject;
exports.assertAttributeCollection = exports.assertDictionary;
class ResourceIdentifier {
    constructor() {
        this.type = "";
        this.id = "";
    }
}
__decorate([
    sd.assert(sd.string())
], ResourceIdentifier.prototype, "type", void 0);
__decorate([
    sd.assert(sd.string())
], ResourceIdentifier.prototype, "id", void 0);
__decorate([
    sd.assert(sd.maybe(exports.assertMeta))
], ResourceIdentifier.prototype, "meta", void 0);
exports.ResourceIdentifier = ResourceIdentifier;
exports.assertResourceLinkage = sd.or(sd.nested(ResourceIdentifier), sd.array(sd.nested(ResourceIdentifier)));
class Relationship {
}
__decorate([
    sd.assert(sd.maybe(exports.assertLinkCollection))
], Relationship.prototype, "links", void 0);
__decorate([
    sd.assert(sd.maybe(exports.assertResourceLinkage))
], Relationship.prototype, "data", void 0);
__decorate([
    sd.assert(sd.maybe(exports.assertMeta))
], Relationship.prototype, "meta", void 0);
exports.Relationship = Relationship;
exports.assertRelationship = (name, mixed) => {
    mixed = sd.toClass(name, mixed, Relationship);
    if (mixed.links == undefined && mixed.data == undefined && mixed.meta == undefined) {
        throw new Error(`Expected ${name} to have at least one of the following; links, data, meta`);
    }
    return mixed;
};
class Resource {
    constructor() {
        this.type = "";
    }
}
__decorate([
    sd.assert(sd.maybe(sd.string()))
], Resource.prototype, "id", void 0);
__decorate([
    sd.assert(sd.string())
], Resource.prototype, "type", void 0);
__decorate([
    sd.assert(sd.maybe(exports.assertAttributeCollection))
], Resource.prototype, "attributes", void 0);
__decorate([
    sd.assert(sd.maybe(exports.assertRelationship))
], Resource.prototype, "relationships", void 0);
__decorate([
    sd.assert(sd.maybe(exports.assertLinkCollection))
], Resource.prototype, "links", void 0);
__decorate([
    sd.assert(sd.maybe(exports.assertMeta))
], Resource.prototype, "meta", void 0);
exports.Resource = Resource;
exports.assertServerResource = (name, mixed) => {
    mixed = sd.toClass(name, mixed, Resource);
    if (mixed.id == undefined) {
        throw new Error(`Expected ${name} to have an "id" field as it originates on the server`);
    }
    return mixed;
};
class JsonApi {
}
exports.JsonApi = JsonApi;
function createDocument(assertion) {
    class DocumentClass {
    }
    __decorate([
        sd.assert(sd.maybe(assertion.isCtor ?
            sd.nested(assertion.func) :
            assertion.func))
    ], DocumentClass.prototype, "data", void 0);
    __decorate([
        sd.assert(sd.maybe(sd.array(sd.nested(ErrorObject))))
    ], DocumentClass.prototype, "errors", void 0);
    __decorate([
        sd.assert(sd.maybe(exports.assertMeta))
    ], DocumentClass.prototype, "meta", void 0);
    __decorate([
        sd.assert(sd.maybe(sd.nested(JsonApi)))
    ], DocumentClass.prototype, "jsonapi", void 0);
    __decorate([
        sd.assert(sd.maybe(exports.assertLinkCollection))
    ], DocumentClass.prototype, "links", void 0);
    __decorate([
        sd.assert(sd.maybe(sd.array(sd.nested(Resource))))
    ], DocumentClass.prototype, "included", void 0);
    const assertDelegate = (name, mixed) => {
        mixed = sd.toClass(name, mixed, DocumentClass);
        if (mixed.data == undefined && mixed.errors == undefined && mixed.meta == undefined) {
            throw new Error(`Expected ${name} to have at least one of the following; data, errors, meta`);
        }
        if (mixed.data != undefined && mixed.errors != undefined) {
            throw new Error(`${name} cannot have both "data" and "errors" set`);
        }
        return mixed;
    };
    return {
        ctor: DocumentClass,
        assertDelegate: assertDelegate,
        assertion: {
            isCtor: false,
            func: assertDelegate,
        },
    };
}
exports.createDocument = createDocument;
function createDocumentWithCtor(ctor) {
    return createDocument({
        isCtor: true,
        func: ctor,
    });
}
exports.createDocumentWithCtor = createDocumentWithCtor;
function createDocumentWithDelegate(assertDelegate) {
    return createDocument({
        isCtor: false,
        func: assertDelegate,
    });
}
exports.createDocumentWithDelegate = createDocumentWithDelegate;
//1 `data`
//8 `meta`
//0-N `Resource`
//1 `AttributeCollection`
//# sourceMappingURL=index.js.map