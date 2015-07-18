;(function ($, w, d, IndexedDB, FormValidation) {
    'use strict';
    
    var APP = {
        indexedBD : new IndexedDB(),
        formWidget : new FormValidation(
            '.js-form-new-member',
            '#modal-error-widget',
            '.js-modal-error-trigger' )
    };
    
    $(d).ready(function () {
        var indexedBD = APP.indexedBD, connDB,
            formWidget = APP.formWidget;
                    
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
        
        formWidget.$form
            .on('submit', function (ev) {
                ev.preventDefault(); // prevent redirect
            })
            .on('click', ':submit', function (ev) {
                formWidget.setCustomMsg(null);
                // BUG succesive Enter @ https://github.com/Dogfalo/materialize/issues/1647
                $('.lean-overlay').remove();
                                
                if (formWidget.nativeValidate() &&
                    formWidget.checkDni('.js-control-dni-name')) { // more validations with single &
                    var activeDb = indexedBD.getActiveDb();
                
                    formWidget.reset();
                    console.dir(activeDb);
                
                } else {
                    formWidget.$modalWidget.openModal();
                }
            })
            .find(':input').on('invalid', function (ev) {
                ev.preventDefault(); // prevent show mesage native validity
            });
    });
}(jQuery, window, document, IndexedDB, FormValidation));