import * as sd from "schema-decorator";
export declare type AnyDictionary = {
    [field: string]: any;
};
export declare const anyDictionary: sd.AssertDelegate<AnyDictionary>;
export declare type Meta = AnyDictionary;
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
export interface PartialDocument<DataT, MetaT extends undefined | null | Meta> {
    data?: undefined | null | DataT;
    errors?: undefined | null | (ErrorObject[]);
    meta?: undefined | null | MetaT;
    jsonapi?: undefined | null | JsonApi;
    links?: undefined | null | LinkCollection;
    included?: undefined | null | (Resource[]) | (ServerResource[]);
}
export declare function partialDocument<DataF extends sd.AnyAssertFunc, MetaF extends sd.AssertFunc<undefined | null | Meta>>(dataF: DataF, metaF: MetaF): (sd.AssertDelegate<PartialDocument<sd.TypeOf<DataF>, sd.TypeOf<MetaF>>> & {
    __accepts: (PartialDocument<sd.AcceptsOf<DataF>, sd.AcceptsOf<MetaF>>);
});
export declare type Document<DataT, MetaT extends undefined | null | Meta> = (undefined extends MetaT ? (undefined extends DataT ? never : null extends DataT ? never : (PartialDocument<DataT, MetaT> & {
    data: DataT;
})) : null extends MetaT ? (undefined extends DataT ? never : null extends DataT ? never : (PartialDocument<DataT, MetaT> & {
    data: DataT;
})) : (undefined extends DataT ? (PartialDocument<DataT, MetaT> & {
    meta: MetaT;
}) : null extends DataT ? (PartialDocument<DataT, MetaT> & {
    meta: MetaT;
}) : (PartialDocument<DataT, MetaT> & {
    data: DataT;
    meta: MetaT;
})));
export declare function document<DataF extends sd.AnyAssertFunc>(dataF: DataF): (Document<sd.TypeOf<DataF>, undefined> extends never ? never : (sd.AssertDelegate<Document<sd.TypeOf<DataF>, undefined>> & {
    __accepts: (Document<sd.AcceptsOf<DataF>, undefined>);
}));
export declare function document<DataF extends sd.AnyAssertFunc, MetaF extends sd.AssertFunc<undefined | null | Meta>>(dataF: DataF, metaF: MetaF): (Document<sd.TypeOf<DataF>, sd.TypeOf<MetaF>> extends never ? never : (sd.AssertDelegate<Document<sd.TypeOf<DataF>, sd.TypeOf<MetaF>>> & {
    __accepts: (Document<sd.AcceptsOf<DataF>, sd.AcceptsOf<MetaF>>);
}));
export declare type ServerDocument<DataT, MetaT extends undefined | null | Meta> = (Document<DataT, MetaT> & {
    included?: undefined | null | (ServerResource[]);
});
export declare function serverDocument<DataF extends sd.AnyAssertFunc>(dataF: DataF): (ServerDocument<sd.TypeOf<DataF>, undefined> extends never ? never : (sd.AssertDelegate<ServerDocument<sd.TypeOf<DataF>, undefined>> & {
    __accepts: (ServerDocument<sd.AcceptsOf<DataF>, undefined>);
}));
export declare function serverDocument<DataF extends sd.AnyAssertFunc, MetaF extends sd.AssertFunc<undefined | null | Meta>>(dataF: DataF, metaF: MetaF): (ServerDocument<sd.TypeOf<DataF>, sd.TypeOf<MetaF>> extends never ? never : (sd.AssertDelegate<ServerDocument<sd.TypeOf<DataF>, sd.TypeOf<MetaF>>> & {
    __accepts: (ServerDocument<sd.AcceptsOf<DataF>, sd.AcceptsOf<MetaF>>);
}));
