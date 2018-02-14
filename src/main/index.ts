import * as sd from "schema-decorator";
//TODO restrict member names? http://jsonapi.org/format/#document-member-names

export const assertDictionary : sd.AssertDelegate<{ [field : string] : any }> = (name : string, mixed : any) : { [field : string] : any } => {
    if (!(mixed instanceof Object)) {
        throw new Error(`Expected ${name} to be an Object; received ${typeof mixed}(${mixed})`);
    }
    if (
        (mixed instanceof Date) ||
        (mixed instanceof Array) ||
        (mixed instanceof Function) ||
        (mixed instanceof Boolean) ||
        (mixed instanceof Number) ||
        (mixed instanceof String) ||
        (mixed instanceof Symbol)
    ) {
        throw new Error(`Expected ${name} to be an Object`);
    }
    return mixed;
};

//http://jsonapi.org/format
//The following is made with the v1.0 spec
export interface Meta {
    [field : string] : any
}
export const assertMeta : sd.AssertDelegate<Meta> = assertDictionary;
//http://jsonapi.org/format/#document-links
export class Link {
    //a string containing the link’s URL.
    @sd.assert(sd.string())
    href : string = "http://example.com";
    //a meta object containing non-standard meta-information about the link.
    @sd.assert(sd.maybe(assertMeta))
    meta?: null|Meta;
}
export interface LinkCollection {
    [field : string] : undefined|null|string|Link,
    //MAY have
    self? : null|string|Link,
    related? : null|string|Link,
    //MAY provide links to traverse a paginated data set (“pagination links”).
    first? : null|string|Link,
    last? : null|string|Link,
    prev? : null|string|Link,
    next? : null|string|Link,
}
export const assertStringOrLink : sd.AssertDelegate<string|Link> = sd.or<string|Link>(
    sd.string(),
    sd.nested(Link)
);
export const assertLinkCollection : sd.AssertDelegate<LinkCollection> = (name : string, mixed : any) : LinkCollection => {
    mixed = assertDictionary(name, mixed);
    for (let field in mixed) {
        if (mixed.hasOwnProperty(field)) {
            mixed[field] = assertStringOrLink(`${name}[${field}]`, mixed[field]);
        }
    }
    return mixed;
};
export interface ErrorLinkCollection extends LinkCollection {
    about : string|Link
}
export const assertErrorLinkCollection : sd.AssertDelegate<ErrorLinkCollection> = sd.and(
    assertLinkCollection,
    (name : string, mixed : any) => {
        if (mixed.about != undefined) {
            return mixed;
        } else {
            throw new Error(`Expected ${name} to have field "about"`);
        }
    }
);
export class ErrorSource {
    //https://tools.ietf.org/html/rfc6901
    @sd.assert(sd.maybe(sd.string()))
    pointer? : null|string;
    //a string indicating which URI query parameter caused the error.
    @sd.assert(sd.maybe(sd.string()))
    parameter? : null|string;
}
//http://jsonapi.org/format/#errors-processing
export class ErrorObject {
    //a unique identifier for this particular occurrence of the problem.
    @sd.assert(sd.maybe(sd.string()))
    id? : null|string;
    @sd.assert(sd.maybe(assertErrorLinkCollection))
    links?: null|ErrorLinkCollection;
    //the HTTP status code applicable to this problem, expressed as a string value.
    @sd.assert(sd.maybe(sd.string()))
    status?: null|string;
    //an application-specific error code, expressed as a string value.
    @sd.assert(sd.maybe(sd.string()))
    code?: null|string;
    //a short, human-readable summary of the problem that SHOULD NOT change from occurrence to occurrence of the problem, except for purposes of localization.
    @sd.assert(sd.maybe(sd.string()))
    title? : null|string;
    //a human-readable explanation specific to this occurrence of the problem. Like title, this field’s value can be localized.
    @sd.assert(sd.maybe(sd.string()))
    detail? : null|string;
    @sd.assert(sd.maybe(sd.nested(ErrorSource)))
    source? : null|ErrorSource;
    @sd.assert(sd.maybe(assertMeta))
    meta? : null|Meta;
}
//http://jsonapi.org/format/#document-resource-object-attributes
export interface AttributeCollection {
    /*
        TODO restrict this
        Complex data structures involving JSON objects and arrays are allowed as attribute values.
        However, any object that constitutes or is contained in an attribute
        MUST NOT contain a `relationships` or `links` member,
        as those members are reserved by this specification for future use.
    */
    [field : string] : any;
}
export const assertAttributeCollection : sd.AssertDelegate<AttributeCollection> = assertDictionary;

export class ResourceIdentifier {
    @sd.assert(sd.string())
    type : string = "";
    @sd.assert(sd.string())
    id   : string = "";
    @sd.assert(sd.maybe(assertMeta))
    meta? : null|Meta;
}

export type ResourceLinkage = ResourceIdentifier | (ResourceIdentifier[]);

export const assertResourceLinkage : sd.AssertDelegate<ResourceLinkage> = sd.or<ResourceLinkage>(
    sd.nested(ResourceIdentifier),
    sd.array(sd.nested(ResourceIdentifier))
);

export class Relationship {
    //A “relationship object” MUST contain at least one of the following:
    @sd.assert(sd.maybe(assertLinkCollection))
    links? : null|LinkCollection;
    @sd.assert(sd.maybe(assertResourceLinkage))
    data? : null|ResourceLinkage;
    @sd.assert(sd.maybe(assertMeta))
    meta? : null|Meta;
}

export const assertRelationship : sd.AssertDelegate<Relationship> = (name : string, mixed : any) : Relationship => {
    mixed = sd.toClass(name, mixed, Relationship);
    if (mixed.links == undefined && mixed.data == undefined && mixed.meta == undefined) {
        throw new Error(`Expected ${name} to have at least one of the following; links, data, meta`);
    }
    return mixed;
};

export class Resource {
    //A resource object MUST contain at least the following top-level members:
    //Exception: The id member is not required when the resource object originates at the client and represents a new resource to be created on the server.
    @sd.assert(sd.maybe(sd.string()))
    id?: null|string;
    @sd.assert(sd.string())
    type: string = "";

    //In addition, a resource object MAY contain any of these top-level members:
    @sd.assert(sd.maybe(assertAttributeCollection))
    attributes? : null|AttributeCollection;
    @sd.assert(sd.maybe(assertRelationship))
    relationships? : null|Relationship;
    @sd.assert(sd.maybe(assertLinkCollection))
    links?: null|LinkCollection;
    @sd.assert(sd.maybe(assertMeta))
    meta?: null|Meta;
}

export const assertServerResource : sd.AssertDelegate<Resource> = (name : string, mixed : any) : Resource => {
    mixed = sd.toClass(name, mixed, Resource);
    if (mixed.id == undefined) {
        throw new Error(`Expected ${name} to have an "id" field as it originates on the server`);
    }
    return mixed;
};

export class JsonApi {
    version?: null|"1.0";
    meta? : null|Meta;
}
export interface Document<T=any> {
    //http://jsonapi.org/format/#document-top-level
    //A document MUST contain at least one of the following top-level members:
    //The members data and errors MUST NOT coexist in the same document.
    data?: null|T,
    errors? : null|(ErrorObject[]),
    meta? : null|Meta,

    //A document MAY contain any of these top-level members:
    jsonapi?: null|JsonApi,
    links? : null|LinkCollection,
    included? : null|(Resource[]),
}
export function createDocument<T> (assertion : sd.Assertion<T>) : {
    ctor : {new():Document<T>},
    assertDelegate : sd.AssertDelegate<Document<T>>,
    assertion : sd.Assertion<Document<T>>,
} {
    class DocumentClass implements Document<T> {
        @sd.assert(sd.maybe(assertion.isCtor ?
            sd.nested(assertion.func) :
            assertion.func
        ))
        data?: null|T;
        @sd.assert(sd.maybe(sd.array(sd.nested(ErrorObject))))
        errors? : null|(ErrorObject[]);
        @sd.assert(sd.maybe(assertMeta))
        meta? : null|Meta;
        @sd.assert(sd.maybe(sd.nested(JsonApi)))
        jsonapi?: null|JsonApi;
        @sd.assert(sd.maybe(assertLinkCollection))
        links? : null|LinkCollection;
        @sd.assert(sd.maybe(sd.array(sd.nested(Resource))))
        included? : null|(Resource[]);
    }
    const assertDelegate : sd.AssertDelegate<Document<T>> = (name : string, mixed : any) : Document<T> => {
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
        ctor : DocumentClass,
        assertDelegate : assertDelegate,
        assertion : {
            isCtor : false,
            func   : assertDelegate,
        },
    };
}
export function createDocumentWithCtor<T> (ctor : {new():T}) {
    return createDocument({
        isCtor : true,
        func : ctor,
    });
}
export function createDocumentWithDelegate<T> (assertDelegate : sd.AssertDelegate<T>) {
    return createDocument({
        isCtor : false,
        func : assertDelegate,
    });
}

//1 `data`
//8 `meta`
//0-N `Resource`
    //1 `AttributeCollection`
