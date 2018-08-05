### Install

`npm install --save @anyhowstep/json-api-schema`

### Usage

```
import * as sd from "schema-decorator";
import * as jsonApi from "json-api-schema";

const doc = jsonApi.document(sd.naturalNumber());
doc("test", {
    data : 34,
}); //OK
doc("test", {
    data : 34.5,
}); //Error, data must be a natural number
doc("test", {
}); //Error, must have one of the following, data, errors, meta
```
