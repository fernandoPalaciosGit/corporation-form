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
    
    w.IndexedDB.prototype.loadIndexedDBData = function (docName, accessType, index) {
        var defer = $.Deferred(),
            recordCursor = [],
            transactionDB = this.getActiveDb().transaction([docName], accessType),
            documentDB = transactionDB.objectStore(docName),
            documentDBIndexed = (!index) ? documentDB : documentDB.index(index);
         
        documentDBIndexed.openCursor().onsuccess = function (e) {
            var cursor = e.target.result;
            
            if (!!cursor) {
                recordCursor.push({
                        value: cursor.value,
                        primaryKey: cursor.primaryKey
                    });
                cursor.continue();
            }
        };
            
        transactionDB.oncomplete = function () {
            defer.resolve(recordCursor);
        };
        
        transactionDB.onerror = function () {
            defer.notify(['Error get data', this.error.name, this.error.message].join(' -> '), 'error');
            defer.reject();
        };
        
        return defer.promise();
    };
    
    /**
     * Open Stored database, or create new one
     * @param  {string} dbName database name
     * @param  {integer} dbVersion database versioned number
     * @param  {object} docOptions document settings
     */
    w.IndexedDB.prototype.openIndexedDBDatabase = function (dbName, dbVersion, docOptions) {
        var defer = $.Deferred();
        this.selectDB(dbName, dbVersion);
        this.activeDB = this.IDB.open(this.dbName, this.version);
        
        /**
         * ON First creation Database or change version
         * Create and store the active document, and its indexed fields
         */
        this.activeDB.onupgradeneeded = $.proxy(function () {
            defer.notify('Upgrade ´' + this.dbName + '´ Database', 'info');
            
            if (!this.getActiveDb().objectStoreNames.contains(docOptions.name)) {
                var documentName = docOptions.name;
                
                this.activeDocuments[documentName] = this.getActiveDb().createObjectStore(documentName, docOptions.options);
                defer.notify('Created ´' + documentName + '´ document', 'info'); 
                
                this.createIndex(documentName, docOptions.fields.dni);
                this.createIndex(documentName, docOptions.fields.name);
                this.createIndex(documentName, docOptions.fields.charge);
                defer.notify('Created indexed fields into ´' + documentName + '´ document', 'info'); 
            }
        }, this);
        
        /**
         * on open database succefully connection
         */
        this.activeDB.onsuccess = $.proxy(function () {
            defer.notify('Successfully loaded ´' + this.dbName + '´ database', 'info');
            defer.resolve();
        }, this);
        
        /**
         * on open database error connection
         */
        this.activeDB.onerror = function () {  
            defer.notify(['Error open DB', this.error.name, this.error.message].join(' -> '), 'error');
            defer.reject();
        };
        
        return defer.promise();
    };
    
    w.IndexedDB.prototype.insertIndexedDBData = function (docName, accessType, optionsMember) {
        var defer = $.Deferred(),
            transactionDB = this.getActiveDb().transaction([docName], accessType),
            addRequest = transactionDB.objectStore(docName).add(optionsMember);
        
        transactionDB.oncomplete = function () {
            defer.resolve();
        };

        addRequest.onerror = function () {
            defer.notify(['Error insert data', this.error.name, this.error.message].join(' -> '), 'error');
            defer.reject();
        };
                
        return defer.promise();
    };
    
    w.IndexedDB.prototype.removeIndexedDBData = function (docName, accessType, indexObject) {
        var defer = $.Deferred(),
            transactionDB = this.getActiveDb().transaction([docName], accessType),
            deleteRequest = transactionDB.objectStore(docName).delete(parseInt(indexObject, 10));
            
        transactionDB.oncomplete = function () {
            defer.resolve();
        };
        
        deleteRequest.onerror = function (ev) {
            var error = ev.target.error;
            defer.notify(['Error deleteing data', error.name, error.message].join(' -> '), 'error');
            defer.reject();
        };
                    
        return defer.promise();
    };
        
    w.IndexedDB.prototype.updateIndexedDBData = function (docName, accessType, optionsMember) {
        var defer = $.Deferred(),
            indexObject = parseInt(optionsMember.primaryKey, 10),
            transactionDB = this.getActiveDb().transaction([docName], accessType),
            updateRequest = transactionDB.objectStore(docName).put(optionsMember, indexObject);
            
        transactionDB.oncomplete = function () {
            defer.resolve();
        };
        
        updateRequest.onerror = function (ev) {
            var error = ev.target.error;
            defer.notify(['Error update data', error.name, error.message].join(' -> '), 'error');
            defer.reject();
        };
                    
        return defer.promise();
    };
    
    w.IndexedDB.prototype.getIndexedDBData = function (docName, accessType, indexObject) {
        var defer = $.Deferred(),
            transactionDB = this.getActiveDb().transaction([docName], accessType),
            requestObject = transactionDB.objectStore(docName).get(parseInt(indexObject, 10)),
            requestResult = null;
            
        requestObject.onsuccess = function () {
            requestResult = requestObject.result;
            requestResult.primaryKey = indexObject;
        };
        
        transactionDB.oncomplete = function () {
            defer.resolve(requestResult);
        };
        
        transactionDB.onerror = function () {
            defer.notify(['Error get data', this.error.name, this.error.message].join(' -> '), 'error');
            defer.reject();
        };
            
        return defer.promise();
    };    
}(jQuery, window));