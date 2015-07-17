;(function ($, w) {
    'use strict';
    
    w.IndexedDB = function (dbName) {
        this.IDB = this.shimIndexedDb();
        this.dbName = dbName;
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
        window.shimIndexedDB.__useShim();
    };
    
    /**
     * Open Stored database, or create new one
     */
    w.IndexedDB.prototype.openDataBase = function () {
        this.IDB.open(this.dbName);
    };
}(jQuery, window));