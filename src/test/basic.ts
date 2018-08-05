import * as jsonApi from "../main/index";
import * as tape from "tape";
import * as sd from "schema-decorator";

tape(__filename + "-basic", (t) => {
    const doc = jsonApi.document(sd.naturalNumber());

    try {
        t.pass(JSON.stringify(
            doc(
                "test",
                {
                    data : 34,
                }
            )
        ));
    } catch (err) {
        t.fail(err.message);
    }

    try {
        t.fail(JSON.stringify(
            doc(
                "test",
                {
                    data : 34.5,
                }
            )
        ));
    } catch (err) {
        t.pass(err.message);
    }

    try {
        t.fail(JSON.stringify(
            doc(
                "test",
                {
                }
            )
        ));
    } catch (err) {
        t.pass(err.message);
    }

    t.end();
});

tape(__filename + "-meta-only", (t) => {
    const doc = jsonApi.document(
        sd.undef(),
        sd.toSchema({
            works : sd.boolean()
        })
    );

    try {
        t.pass(JSON.stringify(
            doc(
                "test",
                {
                    meta : {
                        works : true
                    }
                }
            )
        ));
    } catch (err) {
        t.fail(err.message);
    }

    try {
        t.fail(JSON.stringify(
            doc(
                "test",
                {
                    meta : {
                        works : "fail"
                    },
                }
            )
        ));
    } catch (err) {
        t.pass(err.message);
    }

    try {
        t.fail(JSON.stringify(
            doc(
                "test",
                {
                }
            )
        ));
    } catch (err) {
        t.pass(err.message);
    }

    t.end();
});

tape(__filename + "-meta-and-data", (t) => {
    const doc = jsonApi.document(
        sd.number(),
        sd.toSchema({
            works : sd.boolean()
        })
    );

    try {
        t.pass(JSON.stringify(
            doc(
                "test",
                {
                    data : 34,
                    meta : {
                        works : true
                    }
                }
            )
        ));
    } catch (err) {
        t.fail(err.message);
    }

    try {
        t.fail(JSON.stringify(
            doc(
                "test",
                {
                    data : 34,
                }
            )
        ));
    } catch (err) {
        t.pass(err.message);
    }

    try {
        t.fail(JSON.stringify(
            doc(
                "test",
                {
                    meta : {
                        works : false
                    },
                }
            )
        ));
    } catch (err) {
        t.pass(err.message);
    }

    try {
        t.fail(JSON.stringify(
            doc(
                "test",
                {
                }
            )
        ));
    } catch (err) {
        t.pass(err.message);
    }

    t.end();
});
