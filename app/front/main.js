;(function ($, w, d, IndexedDB, FormValidation, Materialize) {
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
            indexedBD.createDocument('teamMembers');
            // indexed columns
            indexedBD.createIndex('teamMembers', ['idx_name', 'name', {unique: false}]);
            indexedBD.createIndex('teamMembers', ['idx_dni', 'dni', {unique: true}]);
        };
        
        /**
         * on open database succefully connection
         */
        connDB.onsuccess = function () {  
            console.info('Successfully loaded ´corporation´ database');
        };
        
        /**
         * on open database error connection
         */
        connDB.onerror = function () {  
            console.info('Error connection ´corporation´ database');
        };
        
        formWidget.$form
            .on('submit', function (ev) {
                ev.preventDefault(); // prevent redirect
            })
            .on('click', ':submit', function () {
                formWidget.setCustomMsg(null);
                // BUG succesive Enter @ https://github.com/Dogfalo/materialize/issues/1647
                $('.lean-overlay').remove();
                                
                if (formWidget.nativeValidate() &&
                    formWidget.checkDni('.js-control-team-dni')) { // more validations with single &
                    var today = new Date(),
                        optionsNewMember = {
                            dni: formWidget.$form.find('.js-control-team-dni').val(),
                            name: formWidget.$form.find('.js-control-team-name').val(),
                            dischargeDate: today.toJSON().split('T')[0]
                        },
                        transaction = indexedBD.getActiveDb().transaction('teamMembers', 'readwrite'),
                        putRequest = transaction.objectStore('teamMembers').put(optionsNewMember);
                    
                    putRequest.onerror = function () {
                        console.error('Error put -> ', this.error.name, this.error.message);
                        Materialize.toast('Fail, dni must be unique.', 3000, 'rounded');
                    };
                    
                    transaction.oncomplete = function () {
                        formWidget.reset();
                        Materialize.toast('Added, new Member.', 3000, 'rounded');
                    };
                
                } else {
                    formWidget.$modalWidget.openModal();
                }
            })
            .find(':input').on('invalid', function (ev) {
                ev.preventDefault(); // prevent show mesage native validity
            });
    });
}(jQuery, window, document, IndexedDB, FormValidation, Materialize));