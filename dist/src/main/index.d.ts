import * as sd from "schema-decorator";
export declare const assertDictionary: sd.AssertDelegate<{
    [field: string]: any;
}>;
export interface Meta {
    [field: string]: any;
}
export declare const assertMeta: sd.AssertDelegate<Meta>;
export declare class Link {
    href: string;
    meta?: null | Meta;
}
export interface LinkCollection {
    [field: string]: undefined | null | string | Link;
    self?: null | string | Link;
    related?: null | string | Link;
    first?: null | string | Link;
    last?: null | string | Link;
    prev?: null | string | Link;
    next?: null | string | Link;
}
export declare const assertStringOrLink: sd.AssertDelegate<string | Link>;
export declare const assertLinkCollection: sd.AssertDelegate<LinkCollection>;
export interface ErrorLinkCollection extends LinkCollection {
    about: string | Link;
}
export declare const assertErrorLinkCollection: sd.AssertDelegate<ErrorLinkCollection>;
export declare class ErrorSource {
    pointer?: null | string;
    parameter?: null | string;
}
export declare class ErrorObject {
    id?: null | string;
    links?: null | ErrorLinkCollection;
    status?: null | string;
    code?: null | string;
    title?: null | string;
    detail?: null | string;
    source?: null | ErrorSource;
    meta?: null | Meta;
}
export interface AttributeCollection {
    [field: string]: any;
}
export declare const assertAttributeCollection: sd.AssertDelegate<AttributeCollection>;
export declare class ResourceIdentifier {
    type: string;
    id: string;
    meta?: null | Meta;
}
export declare type ResourceLinkage = ResourceIdentifier | (ResourceIdentifier[]);
export declare const assertResourceLinkage: sd.AssertDelegate<ResourceLinkage>;
export declare class Relationship {
    links?: null | LinkCollection;
    data?: null | ResourceLinkage;
    meta?: null | Meta;
}
export declare const assertRelationship: sd.AssertDelegate<Relationship>;
export declare class Resource {
    id?: null | string;
    type: string;
    attributes?: null | AttributeCollection;
    relationships?: null | Relationship;
    links?: null | LinkCollection;
    meta?: null | Meta;
}
export declare const assertServerResource: sd.AssertDelegate<Resource>;
export declare class JsonApi {
    version?: null | "1.0";
    meta?: null | Meta;
}
export interface Document<T = any> {
    data?: null | T;
    errors?: null | (ErrorObject[]);
    meta?: null | Meta;
    jsonapi?: null | JsonApi;
    links?: null | LinkCollection;
    included?: null | (Resource[]);
}
export declare function createDocument<T>(assertion: sd.Assertion<T>): {
    ctor: {
        new (): Document<T>;
    };
    assertDelegate: sd.AssertDelegate<Document<T>>;
    assertion: sd.Assertion<Document<T>>;
};
export declare function createDocumentWithCtor<T>(ctor: {
    new (): T;
}): {
    ctor: new () => Document<T>;
    assertDelegate: sd.AssertDelegate<Document<T>>;
    assertion: {
        isCtor: true;
        func: new () => Document<T>;
    } | {
        isCtor: false;
        func: sd.AssertDelegate<Document<T>>;
    };
};
export declare function createDocumentWithDelegate<T>(assertDelegate: sd.AssertDelegate<T>): {
    ctor: new () => Document<T>;
    assertDelegate: sd.AssertDelegate<Document<T>>;
    assertion: {
        isCtor: true;
        func: new () => Document<T>;
    } | {
        isCtor: false;
        func: sd.AssertDelegate<Document<T>>;
    };
};
