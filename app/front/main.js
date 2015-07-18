;(function ($, w, d, IndexedDB) {
    'use strict';
    
    var APP = {
        indexedBD : new IndexedDB(),
        connDB: null
    };
    
    $(d).ready(function () {
        var indexedBD = APP.indexedBD,
            connDB = APP.connDB;
            
        indexedBD.selectDB('object', 3);
        indexedBD.openDataBase();
        connDB = indexedBD.getConnection();
        
        /**
         * ON First creation Database or change version
         * Store document
         */
        connDB.onupgradeneeded = function (evChangeDB) {
            var peopleDoc = indexedBD.getDocument('people');
            this.result.createObjectStore(peopleDoc.name, peopleDoc.options);
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