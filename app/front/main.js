;(function ($, w, d, IndexedDB) {
    'use strict';
    
    var APP = {
        indexedBD : new IndexedDB(),
        connDB: null
    };
    
    $(d).ready(function () {
        var indexedBD = APP.indexedBD,
            connDB = APP.connDB;
        
        // open Local DB
        indexedBD.selectDB('corporation', 1);
        indexedBD.openDataBase();
        connDB = indexedBD.getConnection();
        
        /**
         * ON First creation Database or change version
         * Create Documents and index columns
         */
        connDB.onupgradeneeded = function () {
            // create document
            indexedBD.createDocument('people');
            // indexed columns
            indexedBD.createIndex('people', ['by_name', 'name', {unique: false}]);
            indexedBD.createIndex('people', ['by_dni', 'dni', {unique: true}]);
        };
        
        /**
         * on open database succefully connection
         */
        connDB.onSuccess = function () {  
            console.log(arguments);
        };
        
        /**
         * on open database error connection
         */
        connDB.onError = function () {  
            console.log(arguments);
        };
    });
}(jQuery, window, document, IndexedDB));