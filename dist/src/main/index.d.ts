import * as sd from "schema-decorator";
export declare type AnyDictionary = {
    [field: string]: any;
};
export declare const anyDictionary: sd.AssertDelegate<AnyDictionary>;
export declare type Meta = AnyDictionary;
export declare type OptionalMeta = undefined | null | Meta;
export declare const meta: sd.AssertDelegate<Meta>;
export interface Link {
    href: string;
    meta?: undefined | null | Meta;
}
export declare const link: sd.AssertDelegate<Link>;
export declare const stringOrLink: sd.AssertDelegate<string | Link>;
export interface LinkCollection {
    [field: string]: undefined | null | string | Link;
    self?: undefined | null | string | Link;
    related?: undefined | null | string | Link;
    first?: undefined | null | string | Link;
    last?: undefined | null | string | Link;
    prev?: undefined | null | string | Link;
    next?: undefined | null | string | Link;
}
export declare const linkCollection: sd.AssertDelegate<LinkCollection>;
export interface ErrorLinkCollection extends LinkCollection {
    about: string | Link;
}
export declare const errorLinkCollection: sd.AssertDelegate<ErrorLinkCollection>;
export interface ErrorSource {
    pointer?: undefined | null | string;
    parameter?: undefined | null | string;
}
export declare const errorSource: sd.AssertDelegate<ErrorSource>;
export interface ErrorObject {
    id?: undefined | null | string;
    links?: undefined | null | ErrorLinkCollection;
    status?: undefined | null | string;
    code?: undefined | null | string;
    title?: undefined | null | string;
    detail?: undefined | null | string;
    source?: undefined | null | ErrorSource;
    meta?: undefined | null | Meta;
}
export declare const errorObject: sd.AssertDelegate<ErrorObject>;
export interface AttributeCollection {
    [field: string]: any;
}
export declare const attributeCollection: sd.AssertDelegate<AttributeCollection>;
export interface ResourceIdentifier {
    type: string;
    id: string;
    meta?: undefined | null | Meta;
}
export declare const resourceIdentifier: sd.AssertDelegate<ResourceIdentifier>;
export declare type ResourceLinkage = ResourceIdentifier | (ResourceIdentifier[]);
export declare const resourceLinkage: sd.AssertDelegate<ResourceLinkage>;
export interface PartialRelationship {
    links?: undefined | null | LinkCollection;
    data?: undefined | null | ResourceLinkage;
    meta?: undefined | null | Meta;
}
export declare const partialRelationship: sd.AssertDelegate<PartialRelationship>;
export declare type Relationship = ((PartialRelationship & {
    links: LinkCollection;
}) | (PartialRelationship & {
    data: ResourceLinkage;
}) | (PartialRelationship & {
    meta: Meta;
}));
export declare const relationship: sd.AssertDelegate<Relationship>;
export interface Resource {
    id?: undefined | null | string;
    type: string;
    attributes?: undefined | null | AttributeCollection;
    relationships?: undefined | null | Relationship;
    links?: undefined | null | LinkCollection;
    meta?: undefined | null | Meta;
}
export declare const resource: sd.AssertDelegate<Resource>;
export interface ServerResource extends Resource {
    id: string;
}
export declare const serverResource: sd.AssertDelegate<ServerResource>;
export interface JsonApi {
    version?: undefined | null | "1.0";
    meta?: undefined | null | Meta;
}
export declare const jsonApi: sd.AssertDelegate<JsonApi>;
export interface PartialDocument<DataT, MetaT extends OptionalMeta = undefined> {
    data?: undefined | null | DataT;
    errors?: undefined | null | (ErrorObject[]);
    meta?: undefined | null | MetaT;
    jsonapi?: undefined | null | JsonApi;
    links?: undefined | null | LinkCollection;
    included?: undefined | null | (Resource[]) | (ServerResource[]);
}
export declare type MetaAssertFunc = undefined | sd.AssertFunc<OptionalMeta>;
export declare type TypeOfMetaAssertFunc<MetaF extends MetaAssertFunc> = (Extract<MetaF, undefined> | sd.TypeOf<Exclude<MetaF, undefined>>);
export declare type AcceptsOfMetaAssertFunc<MetaF extends MetaAssertFunc> = (Extract<MetaF, undefined> | sd.AcceptsOf<Exclude<MetaF, undefined>>);
export declare type MetaAssertDelegate<MetaF extends MetaAssertFunc> = (sd.AssertDelegate<TypeOfMetaAssertFunc<MetaF>> & {
    __accepts: (AcceptsOfMetaAssertFunc<MetaF>);
});
export declare function toMetaAssertDelegate<MetaF extends MetaAssertFunc>(metaF: MetaF): MetaAssertDelegate<MetaF>;
export declare type PartialDocumentAssertDelegate<DataF extends sd.AnyAssertFunc, MetaF extends MetaAssertFunc = undefined> = (sd.AssertDelegate<PartialDocument<sd.TypeOf<DataF>, TypeOfMetaAssertFunc<MetaF>>> & {
    __accepts: (PartialDocument<sd.AcceptsOf<DataF>, AcceptsOfMetaAssertFunc<MetaF>>);
});
export declare function partialDocument<DataF extends sd.AnyAssertFunc, MetaF extends MetaAssertFunc = undefined>(dataF: DataF, metaF?: MetaF): (PartialDocumentAssertDelegate<DataF, MetaF>);
export declare type IsOptional<T> = (true extends ((undefined extends T ? true : false) | (null extends T ? true : false)) ? true : false);
export declare function isOptional(f: sd.AnyAssertFunc): boolean;
export declare type IsBothOptional<T, U> = (IsOptional<T> | IsOptional<U>);
export declare function isBothOptional(f0: sd.AnyAssertFunc, f1: sd.AnyAssertFunc): boolean;
export declare type DocumentData<DataT> = (IsOptional<DataT> extends true ? {} : {
    data: DataT;
});
export declare type DocumentDataAssertDelegate<DataF extends sd.AnyAssertFunc> = (sd.AssertDelegate<DocumentData<sd.TypeOf<DataF>>> & {
    __accepts: (DocumentData<sd.AcceptsOf<DataF>>);
});
export declare function toDocumentDataAssertDelegate<DataF extends sd.AnyAssertFunc>(dataF: DataF): DocumentDataAssertDelegate<DataF>;
export declare type DocumentMeta<MetaT extends OptionalMeta> = (IsOptional<MetaT> extends true ? {} : {
    meta: MetaT;
});
export declare type DocumentMetaAssertDelegate<MetaF extends MetaAssertFunc> = (sd.AssertDelegate<DocumentMeta<TypeOfMetaAssertFunc<MetaF>>> & {
    __accepts: (DocumentMeta<AcceptsOfMetaAssertFunc<MetaF>>);
});
export declare function toDocumentMetaAssertDelegate<MetaF extends MetaAssertFunc>(metaF: MetaF): DocumentMetaAssertDelegate<MetaF>;
export declare type Document<DataT, MetaT extends OptionalMeta = undefined> = (IsBothOptional<DataT, MetaT> extends true ? never : {
    [k in keyof (PartialDocument<DataT, MetaT> & DocumentData<DataT> & DocumentMeta<MetaT>)]: ((PartialDocument<DataT, MetaT> & DocumentData<DataT> & DocumentMeta<MetaT>)[k]);
});
export declare type DocumentAssertDelegate<DataF extends sd.AnyAssertFunc, MetaF extends MetaAssertFunc = undefined> = (Document<sd.TypeOf<DataF>, TypeOfMetaAssertFunc<MetaF>> extends never ? never : (sd.AssertDelegate<Document<sd.TypeOf<DataF>, TypeOfMetaAssertFunc<MetaF>>> & {
    __accepts: (Document<sd.AcceptsOf<DataF>, AcceptsOfMetaAssertFunc<MetaF>>);
}));
export declare function document<DataF extends sd.AnyAssertFunc, MetaF extends MetaAssertFunc = undefined>(dataF: DataF, metaF?: MetaF): (DocumentAssertDelegate<DataF, MetaF>);
export declare type ServerDocument<DataT, MetaT extends OptionalMeta = undefined> = (Document<DataT, MetaT> & {
    included?: undefined | null | (ServerResource[]);
});
export declare type ServerDocumentAssertDelegate<DataF extends sd.AnyAssertFunc, MetaF extends MetaAssertFunc = undefined> = (ServerDocument<sd.TypeOf<DataF>, TypeOfMetaAssertFunc<MetaF>> extends never ? never : (sd.AssertDelegate<ServerDocument<sd.TypeOf<DataF>, TypeOfMetaAssertFunc<MetaF>>> & {
    __accepts: (ServerDocument<sd.AcceptsOf<DataF>, AcceptsOfMetaAssertFunc<MetaF>>);
}));
export declare function serverDocument<DataF extends sd.AnyAssertFunc, MetaF extends MetaAssertFunc = undefined>(dataF: DataF, metaF?: MetaF): (ServerDocumentAssertDelegate<DataF, MetaF>);
