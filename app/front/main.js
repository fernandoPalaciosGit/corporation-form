;(function ($, w, d, IndexedDB) {
    'use strict';
    
    var APP = {
        indexedBD : new IndexedDB('object', 1)
    };
    
    $(d).ready(function () {
        var indexedBD = APP.indexedBD,
            activeDB;
            
        indexedBD.openDataBase();
        activeDB = indexedBD.getActiveIDB();
    });
}(jQuery, window, document, IndexedDB));