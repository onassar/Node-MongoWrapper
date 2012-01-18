Node-Mongo
===

I developed this single-file library while working with the Twitter and Facebook
APIs from Node. What I found was that it was cumbersome to register CRUD
operations against Mongo, through node, with proper execution of callbacks.

More than that, it was difficult to read the actual code you wrote to
accommodate that task.

This wrapper is meant to simply offer up CRUD operations against Node in an
organized, less-chaotic way. While there&#039;s still considerable work that
could be done to make it more robust and fix some glaring and major bugs, for
now I hope it&#039;s useful for others.

### Select Example

``` javascript

var mongo = require('Mongo').Mongo;
mongo.select(
    'users',
    {type: 'twitter', uid: 'onassar'},
    function(err, arr) {
        if (!arr || !arr.length) {
            console.log('User not found.');
        } else {
            console.log(arr);
        );
    }
);
```

The above example attempts to select a user document from a mongo database. If
the document is found, it&#039;s logged directly to the console, otherwise an
error is logged.
