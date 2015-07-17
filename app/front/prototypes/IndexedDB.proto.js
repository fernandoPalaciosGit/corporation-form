;(function ($, w) {
    'use strict';
    
    w.IndexedDB = function (dbName, status) {
        this.IDB = this.shimIndexedDb();
        this.dbName = dbName;
        this.status = status;
        this.activeIDB = null;
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
        this.activeIDB = this.IDB.open(this.dbName, this.status);
    };
    
    /**
     * Retrieve the identifier of our Database opened
     */
    w.IndexedDB.prototype.getActiveIDB = function () {
        return this.activeIDB;
    };
}(jQuery, window));