import * as sd from "schema-decorator";
//TODO restrict member names? http://jsonapi.org/format/#document-member-names

export type AnyDictionary = { [field : string] : any };
export const anyDictionary : sd.AssertDelegate<AnyDictionary> = (
    (name : string, mixed : any) : AnyDictionary => {
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
    }
);

//http://jsonapi.org/format
//The following is made with the v1.0 spec
export type Meta = AnyDictionary;
export type OptionalMeta = undefined|null|Meta;
export const meta : sd.AssertDelegate<Meta> = anyDictionary;

export interface Link {
    href : string,
    meta? : undefined|null|Meta,
}
//http://jsonapi.org/format/#document-links
export const link : sd.AssertDelegate<Link> = sd.toSchema({
    //a string containing the link’s URL.
    href : sd.string(),
    //a meta object containing non-standard meta-information about the link.
    meta : sd.maybe(meta),
});

export const stringOrLink : sd.AssertDelegate<string|Link> = sd.or(
    sd.string(),
    link
);

export interface LinkCollection {
    [field : string] : undefined|null|string|Link,
    //MAY have
    self?    : undefined|null|string|Link,
    related? : undefined|null|string|Link,
    //MAY provide links to traverse a paginated data set (“pagination links”).
    first? : undefined|null|string|Link,
    last?  : undefined|null|string|Link,
    prev?  : undefined|null|string|Link,
    next?  : undefined|null|string|Link,
}
export const linkCollection : sd.AssertDelegate<LinkCollection> = sd.dictionary(
    sd.maybe(stringOrLink)
);

export interface ErrorLinkCollection extends LinkCollection {
    about : string|Link
}
export const errorLinkCollection : sd.AssertDelegate<ErrorLinkCollection> = sd.intersect(
    linkCollection,
    sd.toSchema({
        about : stringOrLink
    })
);

export interface ErrorSource {
    //https://tools.ietf.org/html/rfc6901
    pointer? : undefined|null|string;
    //a string indicating which URI query parameter caused the error.
    parameter? : undefined|null|string;
}
export const errorSource : sd.AssertDelegate<ErrorSource> = sd.toSchema({
    pointer : sd.maybe(sd.string()),
    parameter : sd.maybe(sd.string()),
});

//http://jsonapi.org/format/#errors-processing
export interface ErrorObject {
    //a unique identifier for this particular occurrence of the problem.
    id? : undefined|null|string;
    links?: undefined|null|ErrorLinkCollection;
    //the HTTP status code applicable to this problem, expressed as a string value.
    status?: undefined|null|string;
    //an application-specific error code, expressed as a string value.
    code?: undefined|null|string;
    //a short, human-readable summary of the problem that SHOULD NOT change from occurrence to occurrence of the problem, except for purposes of localization.
    title? : undefined|null|string;
    //a human-readable explanation specific to this occurrence of the problem. Like title, this field’s value can be localized.
    detail? : undefined|null|string;
    source? : undefined|null|ErrorSource;
    meta? : undefined|null|Meta;
}
export const errorObject : sd.AssertDelegate<ErrorObject> = sd.toSchema({
    id : sd.maybe(sd.string()),
    links : sd.maybe(errorLinkCollection),
    status : sd.maybe(sd.string()),
    code : sd.maybe(sd.string()),
    title : sd.maybe(sd.string()),
    detail : sd.maybe(sd.string()),
    source : sd.maybe(errorSource),
    meta : sd.maybe(meta),
});

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
export const attributeCollection : sd.AssertDelegate<AttributeCollection> = anyDictionary;

export interface ResourceIdentifier {
    type : string;
    id   : string;
    meta? : undefined|null|Meta;
}
export const resourceIdentifier : sd.AssertDelegate<ResourceIdentifier> = sd.toSchema({
    type : sd.string(),
    id : sd.string(),
    meta : sd.maybe(meta),
});

export type ResourceLinkage = ResourceIdentifier | (ResourceIdentifier[]);
export const resourceLinkage : sd.AssertDelegate<ResourceLinkage> = sd.or(
    resourceIdentifier,
    sd.array(resourceIdentifier)
);

export interface PartialRelationship {
    //A “relationship object” MUST contain at least one of the following:
    links? : undefined|null|LinkCollection;
    data? : undefined|null|ResourceLinkage;
    meta? : undefined|null|Meta;
}
export const partialRelationship : sd.AssertDelegate<PartialRelationship> = sd.toSchema({
    links : sd.maybe(linkCollection),
    data : sd.maybe(resourceLinkage),
    meta : sd.maybe(meta),
});
export type Relationship = (
    (PartialRelationship & { links : LinkCollection }) |
    (PartialRelationship & { data : ResourceLinkage }) |
    (PartialRelationship & { meta : Meta })
);
export const relationship : sd.AssertDelegate<Relationship> = sd.or(
    sd.intersect(partialRelationship, sd.toSchema({ links : linkCollection })),
    sd.intersect(partialRelationship, sd.toSchema({ data : resourceLinkage })),
    sd.intersect(partialRelationship, sd.toSchema({ meta : meta }))
);

export interface Resource {
    //A resource object MUST contain at least the following top-level members:
    //Exception: The id member is not required when the resource object originates
    //at the client and represents a new resource to be created on the server.
    id?: undefined|null|string;
    type: string;

    //In addition, a resource object MAY contain any of these top-level members:
    attributes? : undefined|null|AttributeCollection;
    relationships? : undefined|null|Relationship;
    links?: undefined|null|LinkCollection;
    meta?: undefined|null|Meta;
}
export const resource : sd.AssertDelegate<Resource> = sd.toSchema({
    id : sd.maybe(sd.string()),
    type : sd.string(),

    attributes : sd.maybe(attributeCollection),
    relationships : sd.maybe(relationship),
    links : sd.maybe(linkCollection),
    meta : sd.maybe(meta),
});

export interface ServerResource extends Resource {
    id : string;
}
export const serverResource : sd.AssertDelegate<ServerResource> = sd.intersect(
    resource,
    sd.toSchema({
        id : sd.string(),
    })
);

export interface JsonApi {
    version?: undefined|null|"1.0";
    meta? : undefined|null|Meta;
}
export const jsonApi : sd.AssertDelegate<JsonApi> = sd.toSchema({
    version : sd.maybe(sd.literal("1.0")),
    meta : sd.maybe(meta),
});

export interface PartialDocument<DataT, MetaT extends OptionalMeta=undefined> {
    //http://jsonapi.org/format/#document-top-level
    //A document MUST contain at least one of the following top-level members:
    //The members data and errors MUST NOT coexist in the same document.
    data?: undefined|null|DataT,
    errors? : undefined|null|(ErrorObject[]),
    meta? : undefined|null|MetaT,

    //A document MAY contain any of these top-level members:
    jsonapi?: undefined|null|JsonApi,
    links? : undefined|null|LinkCollection,
    included? : undefined|null|(Resource[])|(ServerResource[]),
}
export type MetaAssertFunc = undefined|sd.AssertFunc<OptionalMeta>;
export type TypeOfMetaAssertFunc<MetaF extends MetaAssertFunc> = (
    Extract<MetaF, undefined>|sd.TypeOf<Exclude<MetaF, undefined>>
);
export type AcceptsOfMetaAssertFunc<MetaF extends MetaAssertFunc> = (
    Extract<MetaF, undefined>|sd.AcceptsOf<Exclude<MetaF, undefined>>
);
export type MetaAssertDelegate<MetaF extends MetaAssertFunc> = (
    sd.AssertDelegate<TypeOfMetaAssertFunc<MetaF>> &
    {
        __accepts : (
            AcceptsOfMetaAssertFunc<MetaF>
        )
    }
);
export function toMetaAssertDelegate<MetaF extends MetaAssertFunc> (
    metaF : MetaF
) : MetaAssertDelegate<MetaF> {
    if (metaF == undefined) {
        return sd.undef() as any;
    } else {
        //This should be fine because we checked it was not null
        const f : Exclude<MetaF, undefined> = metaF as any;
        return sd.toAssertDelegateExact(f);
    }
}
export type PartialDocumentAssertDelegate<
    DataF extends sd.AnyAssertFunc,
    MetaF extends MetaAssertFunc=undefined
> = (
    sd.AssertDelegate<PartialDocument<
        sd.TypeOf<DataF>,
        TypeOfMetaAssertFunc<MetaF>
    >> &
    {
        __accepts : (
            PartialDocument<
                sd.AcceptsOf<DataF>,
                AcceptsOfMetaAssertFunc<MetaF>
            >
        )
    }
);
export function partialDocument<
    DataF extends sd.AnyAssertFunc,
    MetaF extends MetaAssertFunc=undefined
> (
    dataF : DataF,
    metaF? : MetaF
) : (
    PartialDocumentAssertDelegate<DataF, MetaF>
) {
    return sd.toSchema({
        data : sd.maybe(dataF),
        errors : sd.maybe(sd.array(errorObject)),
        meta : sd.maybe(toMetaAssertDelegate(metaF)),

        jsonapi : sd.maybe(jsonApi),
        links : sd.maybe(linkCollection),
        included : sd.maybe(sd.or(
            sd.array(resource),
            sd.array(serverResource)
        ))
    });
}

/*
    data, errors, meta

    + At least one must be present
    + data and errors MUST NOT coexist

    + data
    + data, meta
    + errors
    + errors, meta
    + meta
*/
//If `IsOptional<>` extends `true`, then it is optional
export type IsOptional<T> = (
    true extends (
        (undefined extends T ? true : false) |
        (null extends T ? true : false)
    ) ?
        true :
        false
);
export function isOptional (f : sd.AnyAssertFunc) : boolean {
    return sd.isOptional(f) || sd.isNullable(f);
}
//If `IsBothOptional<>` extends `true`, then both are optional
export type IsBothOptional<T, U> = (
    IsOptional<T> | IsOptional<U>
);
export function isBothOptional (f0 : sd.AnyAssertFunc, f1 : sd.AnyAssertFunc) : boolean {
    return isOptional(f0) && isOptional(f1);
}

export type DocumentData<DataT> = (
    IsOptional<DataT> extends true ?
        {} :
        {
            data : DataT
        }
);
export type DocumentDataAssertDelegate<DataF extends sd.AnyAssertFunc> = (
    sd.AssertDelegate<DocumentData<sd.TypeOf<DataF>>> &
    {
        __accepts : (
            DocumentData<sd.AcceptsOf<DataF>>
        )
    }
);
export function toDocumentDataAssertDelegate<DataF extends sd.AnyAssertFunc> (
    dataF : DataF
) : DocumentDataAssertDelegate<DataF> {
    const result = isOptional(dataF) ?
        sd.toSchema({}) :
        sd.toSchema({
            data : sd.notMaybe(dataF)
        });
    return result as any;
}
export type DocumentMeta<MetaT extends OptionalMeta> = (
    IsOptional<MetaT> extends true ?
        {} :
        {
            meta : MetaT
        }
);
export type DocumentMetaAssertDelegate<MetaF extends MetaAssertFunc> = (
    sd.AssertDelegate<DocumentMeta<TypeOfMetaAssertFunc<MetaF>>> &
    {
        __accepts : (
            DocumentMeta<AcceptsOfMetaAssertFunc<MetaF>>
        )
    }
);
export function toDocumentMetaAssertDelegate<MetaF extends MetaAssertFunc> (
    metaF : MetaF
) : DocumentMetaAssertDelegate<MetaF> {
    const metaD = toMetaAssertDelegate(metaF);
    const result = isOptional(metaD) ?
        sd.toSchema({}) :
        sd.toSchema({
            meta : sd.notMaybe(metaD)
        });
    return result as any;
}

//Cannot have both DataT, and MetaT have undefined|null
export type Document<DataT, MetaT extends OptionalMeta=undefined> = (
    IsBothOptional<DataT, MetaT> extends true ?
        //Cannot both have undefined|null
        never :
        {
            [k in keyof (
                PartialDocument<DataT, MetaT> &
                DocumentData<DataT> &
                DocumentMeta<MetaT>
            )] : (
                (
                    PartialDocument<DataT, MetaT> &
                    DocumentData<DataT> &
                    DocumentMeta<MetaT>
                )[k]
            )
        }
);
export type DocumentAssertDelegate<
    DataF extends sd.AnyAssertFunc,
    MetaF extends MetaAssertFunc=undefined
> = (
    Document<
        sd.TypeOf<DataF>,
        TypeOfMetaAssertFunc<MetaF>
    > extends never ?
        never :
        (
            sd.AssertDelegate<Document<
                sd.TypeOf<DataF>,
                TypeOfMetaAssertFunc<MetaF>
            >> &
            {
                __accepts : (
                    Document<
                        sd.AcceptsOf<DataF>,
                        AcceptsOfMetaAssertFunc<MetaF>
                    >
                )
            }
        )
);
export function document<
    DataF extends sd.AnyAssertFunc,
    MetaF extends MetaAssertFunc=undefined
> (
    dataF : DataF,
    metaF? : MetaF
) : (
    DocumentAssertDelegate<DataF, MetaF>
) {
    const metaD = toMetaAssertDelegate(metaF);
    if (isBothOptional(dataF, metaD)) {
        throw new Error(`'data' and 'meta' fields of a JSON API document cannot both be optional; makes it possible for both to be missing without setting 'errors'`);
    }
    const result = sd.intersect(
        partialDocument(
            dataF,
            metaD
        ),
        toDocumentDataAssertDelegate(dataF),
        toDocumentMetaAssertDelegate(metaD)
    );
    return result as any;
}
export type ServerDocument<DataT, MetaT extends OptionalMeta=undefined> = (
    Document<DataT, MetaT> &
    {
        included? : undefined|null|(ServerResource[])
    }
);
export type ServerDocumentAssertDelegate<
    DataF extends sd.AnyAssertFunc,
    MetaF extends MetaAssertFunc=undefined
> = (
    ServerDocument<
        sd.TypeOf<DataF>,
        TypeOfMetaAssertFunc<MetaF>
    > extends never ?
        never :
        (
            sd.AssertDelegate<ServerDocument<
                sd.TypeOf<DataF>,
                TypeOfMetaAssertFunc<MetaF>
            >> &
            {
                __accepts : (
                    ServerDocument<
                        sd.AcceptsOf<DataF>,
                        AcceptsOfMetaAssertFunc<MetaF>
                    >
                )
            }
        )
);
export function serverDocument<
    DataF extends sd.AnyAssertFunc,
    MetaF extends MetaAssertFunc=undefined
> (
    dataF : DataF,
    metaF? : MetaF
) : (
    ServerDocumentAssertDelegate<DataF, MetaF>
) {
    const result = sd.intersect(
        document(dataF, metaF),
        sd.toSchema({
            included : sd.maybe(sd.array(serverResource))
        })
    );
    return result as any;
}
