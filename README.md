### Install

`npm install --save @anyhowstep/json-api-schema`

### Usage

```
import * as sd from "schema-decorator";

class MyData {
    @sd.assert(sd.naturalNumber())
    var : number = 0;
}
const assertWithCtor = createDocumentWithCtor(MyData).assertDelegate;
assertWithCtor("test", {
    data : {
        var : 34
    },
}); //OK
assertWithCtor("test", {
    data : {
        var : 34.5
    },
}); //Error, var must be a natural number
assertWithCtor("test", {
}); //Error, must have one of the following, data, errors, meta
```

### TODO

Assertions for the various `meta`, `attributes`, etc.
