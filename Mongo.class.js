
// node-libraries
var sys = require('sys'),
    mongodb = require('mongodb');

/**
 * Mongo
 * 
 * A wrapper for christkv's node-mongodb-native node extension. Allows for
 * easier mongo manipulation via destroy, insert, select and update methods.
 * Acts as a singleton (non-instantiable) and assumes single database source (at
 * the moment).
 * 
 * @see https://github.com/christkv/node-mongodb-native
 * @abstract
 * @public
 * @var      Object
 */
var Mongo = (function() {

    // connection private/local variable; connection details
    var __connection,
        __details = {
            host: 'localhost',
            port: 27017,
            db: 'dbname'
        };

    /**
     * __open
     * 
     * @private
     * @param   Function callback
     * @return  void
     * @todo    when hitting the callback from Twitter, the `connection`
     *          variable has a value somehow; not sure how this is working, but
     *          it's an old reference that doesn't have the `collectionNames`
     *          method. Fix for now is to re-open a new connection every time
     */
    function __open(callback) {

/*         if (!__connection) { */
        if (true) {
            __connection = new mongodb.Db(
                __details.db,
                new mongodb.Server(__details.host, __details.port, {}),
                {native_parser: true}
            );
            __connection.open(callback);
        } else {
            callback();
        }
    }

    /**
     * __getCollection
     * 
     * @private
     * @param   Object db
     * @param   Object collection
     * @param   Function callback
     * @return  void
     */
    function __getCollection(db, collection, callback) {

        // async call
        db.collectionNames(collection, function(err, collections) {
            if (err) {
                throw err;
            }

            // collection not found
            if (collections.length === 0) {
                db.createCollection(collection, function(err, collection) {
                    if (err) {
                        throw err;
                    }
                    callback(collection);
                });
            }
            // collection found
            else {
                db.collection(collection, function(err, collection) {
                    if (err) {
                        throw err;
                    }
                    callback(collection);
                });
            }
        });
    }

    // return singelton
    return {

        /**
         * destroy
         * 
         * @public
         * @param  String collection collection that should be modified
         * @param  Object query
         * @param  Function callback (optional) callback function after
         *         successful deletion
         * @return void
         */
        destroy: function(collection, query, callback) {

            // attempt to open connection; run delete-crud operation
            __open(function(err, db) {
                if (err) {
                    throw err;
                }
                __getCollection(db, collection, function(collection) {
                    collection.remove(query, callback || function(){});
                });
            });
        },

        /**
         * insert
         * 
         * @public
         * @param  String collection collection that should be modified
         * @param  Object obj record/object that should be inserted
         * @param  Function callback (optional) callback function after
         *         successful insertion
         * @return void
         */
        insert: function(collection, obj, callback) {

            // attempt to open connection; run insert-crud operation
            __open(function(err, db) {
                if (err) {
                    throw err;
                }
                __getCollection(db, collection, function(collection) {
                    collection.save(obj, {}, callback || function(){});
                });
            });
        },

        /**
         * select
         * 
         * @todo   implement 
         * @public
         * @param  String collection collection that should be modified
         * @param  Object query
         * @param  Function callback
         * @return void
         */
        select: function(collection, query, callback) {

            // attempt to open connection; run select-crud operation
            __open(

                /**
                 * (anonymous)
                 * 
                 * @todo document exact object type
                 * @public
                 * @param Object|null err
                 * @param Object db (optional)
                 * @return void
                 */
                function(err, db) {
                    if (err) {
                        throw err;
                    }
                    __getCollection(
                        db,
                        collection,

                        /**
                         * (anonymous)
                         * 
                         * @todo document exact object type
                         * @public
                         * @param Object collection
                         * @return void
                         */
                        function(collection) {
                            collection.find(
                                query || {},

                                /**
                                 * (anonymous)
                                 * 
                                 * @note callback is wrapped in a `wrapped` function to allow
                                 *     the cursor to be closed only after the passed-in
                                 *     callback has been run.
                                 * @todo document exact object type
                                 * @public
                                 * @param Object|null err
                                 * @param Object cursor (optional)
                                 * @return void
                                 */
                                function(err, cursor) {
                                    if (err) {
                                        throw err;
                                    }
                                    // callback to close cursor afterwards
                                    cursor.toArray(function() {
                                        callback.apply(this, arguments);
                                        cursor.close();
                                    });
                                }
                            );
                        }
                    );
                }
            );
        },

        /**
         * update
         * 
         * @note   performs an upsert if document specified by `spec` isn't
         *         found
         * @public
         * @param  String collection collection that should be modified
         * @param  Object spec
         * @param  Object obj new value of record
         * @param  Function callback (optional) callback function after
         *         successful update
         * @return void
         */
        update: function (collection, spec, obj, callback) {

            // attempt to open connection; run update-crud operation
            __open(function(err, db) {
                if (err) {
                    throw err;
                }
                __getCollection(db, collection, function(collection) {
                    collection.update(
                        spec,
                        obj,
                        {
                            upsert: true,
                            multi: false,
                            safe: false
                        },
                        callback || function(){}
                    );
                });
            });
        }
    };
})();

// make available
exports.Mongo = Mongo;
