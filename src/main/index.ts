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

export interface PartialDocument<DataT, MetaT extends undefined|null|Meta> {
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
export function partialDocument<
    DataF extends sd.AnyAssertFunc,
    MetaF extends sd.AssertFunc<undefined|null|Meta>
> (
    dataF : DataF,
    metaF : MetaF
) : (
    sd.AssertDelegate<PartialDocument<
        sd.TypeOf<DataF>,
        sd.TypeOf<MetaF>
    >> &
    {
        __accepts : (
            PartialDocument<
                sd.AcceptsOf<DataF>,
                sd.AcceptsOf<MetaF>
            >
        )
    }
) {
    const r : (
        sd.AssertDelegate<PartialDocument<
            sd.TypeOf<DataF>,
            //This `any` hack is because TS has a problem with
            //Mapping `T extends { [field : string] : any }`
            any
        >> &
        {
            __accepts : (
                PartialDocument<
                    sd.AcceptsOf<DataF>,
                    //This `any` hack is because TS has a problem with
                    //Mapping `T extends { [field : string] : any }`
                    any
                >
            )
        }
    ) = sd.toSchema({
        data : sd.maybe(dataF),
        errors : sd.maybe(sd.array(errorObject)),
        meta : sd.maybe(metaF),

        jsonapi : sd.maybe(jsonApi),
        links : sd.maybe(linkCollection),
        included : sd.maybe(sd.or(
            sd.array(resource),
            sd.array(serverResource)
        ))
    });
    return r;
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
//Cannot have both DataT, and MetaT have undefined|null
export type Document<DataT, MetaT extends undefined|null|Meta> = (
    undefined extends MetaT ?
    (
        undefined extends DataT ?
        //Cannot both have undefined|null
        never :
        null extends DataT ?
        //Cannot both have undefined|null
        never :
        (
            PartialDocument<DataT, MetaT> &
            {
                data : DataT
            }
        )
    ) :
    null extends MetaT ?
    (
        undefined extends DataT ?
        //Cannot both have undefined|null
        never :
        null extends DataT ?
        //Cannot both have undefined|null
        never :
        (
            PartialDocument<DataT, MetaT> &
            {
                data : DataT
            }
        )
    ) :
    (
        undefined extends DataT ?
        (
            PartialDocument<DataT, MetaT> &
            {
                meta : MetaT
            }
        ) :
        null extends DataT ?
        (
            PartialDocument<DataT, MetaT> &
            {
                meta : MetaT
            }
        ) :
        (
            PartialDocument<DataT, MetaT> &
            {
                data : DataT,
                meta : MetaT
            }
        )
    )
);
export function document<
    DataF extends sd.AnyAssertFunc
> (
    dataF : DataF
) : (
    Document<
        sd.TypeOf<DataF>,
        undefined
    > extends never ?
        never :
        (
            sd.AssertDelegate<Document<
                sd.TypeOf<DataF>,
                undefined
            >> &
            {
                __accepts : (
                    Document<
                        sd.AcceptsOf<DataF>,
                        undefined
                    >
                )
            }
        )
);
export function document<
    DataF extends sd.AnyAssertFunc,
    MetaF extends sd.AssertFunc<undefined|null|Meta>
> (
    dataF : DataF,
    metaF : MetaF
) : (
    Document<
        sd.TypeOf<DataF>,
        sd.TypeOf<MetaF>
    > extends never ?
        never :
        (
            sd.AssertDelegate<Document<
                sd.TypeOf<DataF>,
                sd.TypeOf<MetaF>
            >> &
            {
                __accepts : (
                    Document<
                        sd.AcceptsOf<DataF>,
                        sd.AcceptsOf<MetaF>
                    >
                )
            }
        )
);
export function document<
    DataF extends sd.AnyAssertFunc,
    MetaF extends sd.AssertFunc<undefined|null|Meta>
> (
    dataF : DataF,
    metaF? : MetaF
) : (
    Document<
        sd.TypeOf<DataF>,
        sd.TypeOf<MetaF>
    > extends never ?
        never :
        (
            sd.AssertDelegate<Document<
                sd.TypeOf<DataF>,
                sd.TypeOf<MetaF>
            >> &
            {
                __accepts : (
                    Document<
                        sd.AcceptsOf<DataF>,
                        sd.AcceptsOf<MetaF>
                    >
                )
            }
        )
) {
    if (metaF == undefined) {
        //Kind of a hacky implementation
        metaF = sd.undef() as MetaF;
    }
    const dataOptional = (sd.isOptional(dataF) || sd.isNullable(dataF));
    const metaOptional = (sd.isOptional(metaF) || sd.isNullable(metaF));

    if (dataOptional && metaOptional) {
        throw new Error(`'data' and 'meta' fields of a JSON API document cannot both be optional; makes it possible for both to be missing without setting 'errors'`);
    }

    if (dataOptional) {
        return sd.intersect(
            partialDocument(
                dataF,
                metaF
            ),
            sd.toSchema({
                meta : sd.notMaybe(metaF)
            })
        ) as any;
    } else if (metaOptional) {
        return sd.intersect(
            partialDocument(
                dataF,
                metaF
            ),
            sd.toSchema({
                data : sd.notMaybe(dataF)
            })
        ) as any;
    } else {
        return sd.intersect(
            partialDocument(
                dataF,
                metaF
            ),
            sd.toSchema({
                data : sd.notMaybe(dataF),
                meta : sd.notMaybe(metaF),
            })
        ) as any;
    }
}

export type ServerDocument<DataT, MetaT extends undefined|null|Meta> = (
    Document<DataT, MetaT> &
    {
        included? : undefined|null|(ServerResource[])
    }
);
export function serverDocument<
    DataF extends sd.AnyAssertFunc
> (
    dataF : DataF
) : (
    ServerDocument<
        sd.TypeOf<DataF>,
        undefined
    > extends never ?
        never :
        (
            sd.AssertDelegate<ServerDocument<
                sd.TypeOf<DataF>,
                undefined
            >> &
            {
                __accepts : (
                    ServerDocument<
                        sd.AcceptsOf<DataF>,
                        undefined
                    >
                )
            }
        )
);
export function serverDocument<
    DataF extends sd.AnyAssertFunc,
    MetaF extends sd.AssertFunc<undefined|null|Meta>
> (
    dataF : DataF,
    metaF : MetaF
) : (
    ServerDocument<
        sd.TypeOf<DataF>,
        sd.TypeOf<MetaF>
    > extends never ?
        never :
        (
            sd.AssertDelegate<ServerDocument<
                sd.TypeOf<DataF>,
                sd.TypeOf<MetaF>
            >> &
            {
                __accepts : (
                    ServerDocument<
                        sd.AcceptsOf<DataF>,
                        sd.AcceptsOf<MetaF>
                    >
                )
            }
        )
);
export function serverDocument<
    DataF extends sd.AnyAssertFunc,
    MetaF extends sd.AssertFunc<undefined|null|Meta>
> (
    dataF : DataF,
    metaF? : MetaF
) : (
    ServerDocument<
        sd.TypeOf<DataF>,
        sd.TypeOf<MetaF>
    > extends never ?
        never :
        (
            sd.AssertDelegate<ServerDocument<
                sd.TypeOf<DataF>,
                sd.TypeOf<MetaF>
            >> &
            {
                __accepts : (
                    ServerDocument<
                        sd.AcceptsOf<DataF>,
                        sd.AcceptsOf<MetaF>
                    >
                )
            }
        )
) {
    if (metaF == undefined) {
        //Kind of a hacky implementation
        metaF = sd.undef() as MetaF;
    }
    const result = sd.intersect(
        document(dataF, metaF),
        sd.toSchema({
            included : sd.maybe(sd.array(serverResource))
        })
    ) as any;
    return result as any;
}
