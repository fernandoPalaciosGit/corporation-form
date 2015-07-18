;(function ($, w) {
    'use strict';
    
    var Documents = {
        'people' : {
            name : 'people',
            options: {
                keypath: 'id',
                autoIncrement: true
            }
        }
    };
    
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
    
    
    w.IndexedDB.prototype.createDocument = function (docName) {
        var indexDoc = Documents[docName],
            activeDoc = this.activeDB.result.createObjectStore(indexDoc.name, indexDoc.options);
        
        this.activeDocuments[indexDoc.name] = activeDoc;
    };
    
    w.IndexedDB.prototype.createIndex = function (docName, docOpt) {
        var indexDoc = Documents[docName],
            activeDoc = this.activeDocuments[indexDoc.name];
        
        activeDoc.createIndex.apply(activeDoc, docOpt); 
    };
    
    /**
     * Retrieve the identifier of our Database opened
     */
    w.IndexedDB.prototype.getConnection = function () {
        return this.activeDB;
    };
    
    /**
     * Select documents Data stored into dictionary
     */
    w.IndexedDB.prototype.getDocument = function (docName) {
        var indexDoc = Documents[docName];
        
        return this.activeDocuments[indexDoc.name];
    };
}(jQuery, window));