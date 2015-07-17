;(function ($, w, d, IndexedDB) {
    'use strict';
    
    var APP = {
        indexedBD : new IndexedDB('object')
    };
    
    $(d).ready(function () {
        APP.indexedBD.openDataBase();
    });
}(jQuery, window, document, IndexedDB));