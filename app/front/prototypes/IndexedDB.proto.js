;(function ($, w) {
    'use strict';
            
    w.IndexedDB = function () {
        this.IDB = this.shimIndexedDb();
        this.dbName = null;
        this.version = null;
        // DB params
        this.activeDB = null;
        this.activeDocuments = [];
    };
    
    /**
     * rename Database 
     */
    w.IndexedDB.prototype.selectDB = function (dbName, version) {
        this.dbName = dbName;
        this.version = version;
    };
    
    /**
     * Check compatibility with general browsers
     * @return object indexed db contructor
     */
    w.IndexedDB.prototype.shimIndexedDb = function () {
        return  w.indexedDB ||
                w.mozIndexedDB ||
                w.webkitIndexedDB ||
                w.msIndexedDB ||
                w.shimIndexedDB;
    };
    
    /**
     * Some native IndexedDB implemenatations are very buggy or poorly features.
     */
    w.IndexedDB.prototype.forceDhimIndexedDb = function () {
        w.shimIndexedDB.__useShim();
    };
    
    /**
     * Open Stored database, or create new one
     */
    w.IndexedDB.prototype.openDataBase = function () {
        this.activeDB = this.IDB.open(this.dbName, this.version);
    };
    
    /**
     * Create and store the active document 
     * @param  {string} docName index from active documents database
     */
    w.IndexedDB.prototype.createDocument = function (docDb) {
        var activeDB = this.activeDB.result;
            
        this.activeDocuments[docDb.name] = activeDB.createObjectStore(docDb.name, docDb.options);
    };
    
    w.IndexedDB.prototype.createIndex = function (docDBName, fieldOptions) {
        var activeDoc = this.activeDocuments[docDBName];
        
        activeDoc.createIndex.apply(activeDoc, fieldOptions); 
    };
    
    /**
     * Get Database opened interface for DDL, DML
     */
    w.IndexedDB.prototype.getActiveDb = function () {
        return this.activeDB.result;
    };
    
    w.IndexedDB.prototype.loadIndexedDBData = function (docDB, accessType) {
        var defer = $.Deferred(),
            transaction = this.getActiveDb().transaction([docDB], accessType),
            objDocument = transaction.objectStore(docDB),
            recordCursor = [];
        
        objDocument.openCursor().onsuccess = function (e) {
            var cursor = e.target.result;
            
            if (!!cursor) {
                recordCursor.push({
                        value: cursor.value,
                        primaryKey: cursor.primaryKey
                    });
                cursor.continue();
            }
        };
            
        transaction.oncomplete = function () {
            defer.resolve(recordCursor);
        };
        
        transaction.onerror = function (error) {
            defer.reject(error);
        };
        
        return defer.promise();
    };
    
    /**
     * open Local DB
     * @param  {string} dbName database name
     * @param  {integer} dbVersion database versioned number
     * @param  {object} docOptions document settings
     */
    w.IndexedDB.prototype.openIndexedDBDatabase = function (dbName, dbVersion, docOptions) {
        var defer = $.Deferred();
        this.selectDB(dbName, dbVersion);
        this.openDataBase();
        
        /**
         * ON First creation Database or change version
         * Create Documents and index columns
         */
        this.activeDB.onupgradeneeded = $.proxy(function () {
            // create document
            this.createDocument(docOptions);
            // indexed columns
            this.createIndex(docOptions.name, docOptions.fields.dni);
            this.createIndex(docOptions.name, docOptions.fields.name);
            this.createIndex(docOptions.name, docOptions.fields.charge);
            this.createIndex(docOptions.name, docOptions.fields.birthdate);
        }, this);
        
        /**
         * on open database succefully connection
         */
        this.activeDB.onsuccess = function () {  
            defer.resolve();
        };
        
        /**
         * on open database error connection
         */
        this.activeDB.onerror = function () {  
            defer.reject(this.error);
        };
        
        return defer.promise();
    };
    
    w.IndexedDB.prototype.insertIndexedDBData = function (docName, accessType, optionsMember) {
        var defer = $.Deferred(),
            transaction = this.getActiveDb().transaction([docName], accessType),
            putRequest = transaction.objectStore(docName).put(optionsMember);
        
        putRequest.onerror = function () {
            defer.reject(this.error);
        };
        
        transaction.oncomplete = function () {
            defer.resolve();
        };
        
        return defer.promise();
    };
    
    w.IndexedDB.prototype.getIndexedDBData = function (docName, accessType, indexObject) {
        var defer = $.Deferred();
        defer.resolve(indexObject);
        return defer.promise();
    };
}(jQuery, window));