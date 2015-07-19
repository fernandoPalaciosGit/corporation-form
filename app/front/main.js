;(function ($, w, d, IndexedDB, FormValidation, Materialize) {
    'use strict';
    
    var APP = {
        localDB : new IndexedDB(),
        formWidget : new FormValidation(
            '.js-form-new-member',
            '#modal-error-widget',
            '.js-modal-error-trigger' )
    };
    
    $(d).ready(function () {
        // load widget controls
        $('.datepicker').pickadate({
            selectMonths: true,
            selectYears: 50,
            editable: false,
            formatSubmit: 'dd mmmm, yyyy',
            max: new Date()
        });
        
        $('.js-control-team-charge').material_select();
    });
    
    $(w).load(function () {
        var localDB = APP.localDB, connDB,
            formWidget = APP.formWidget;
             
        // open Local DB
        localDB.selectDB('corporation', 1);
        localDB.openDataBase();
        connDB = localDB.getConnection();
        
        /**
         * ON First creation Database or change version
         * Create Documents and index columns
         */
        connDB.onupgradeneeded = function () {
            // create document
            localDB.createDocument('teamMembers');
            // indexed columns
            localDB.createIndex('teamMembers', ['idx_dni', 'dni', {unique: true}]);
            localDB.createIndex('teamMembers', ['idx_name', 'name', {unique: false}]);
            localDB.createIndex('teamMembers', ['idx_charge', 'charge', {unique: false}]);
            localDB.createIndex('teamMembers', ['idx_birthdate', 'birthdate', {unique: false}]);
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
            console.error('Error connection -> ', this.error.name, this.error.message);
        };
        
        formWidget.$form
            .on('submit', function (ev) {
                ev.preventDefault(); // prevent redirect
            })
            .on('click', ':submit', function () {
                formWidget.setCustomMsg(null);
                // Issue Materialize : https://github.com/Dogfalo/materialize/issues/1647
                $('.lean-overlay').remove();
                formWidget.changeInputStyleState('.js-control-form:input', true);
                
                // validate multiple input states
                if (formWidget.nativeValidate() &
                    formWidget.checkDni('.js-control-team-dni') &
                    formWidget.checkBirthDateUI('.js-control-team-birthdate')) {
                    var optionsNewMember = {
                            dni: formWidget.$form.find('.js-control-team-dni').val(),
                            name: formWidget.$form.find('.js-control-team-name').val(),
                            birthdate: formWidget.$form.find('.js-control-team-charge').val(),
                            charge: formWidget.$form.find('.js-control-team-birthdate').val()
                        },
                        transaction = localDB.getActiveDb().transaction('teamMembers', 'readwrite'),
                        putRequest = transaction.objectStore('teamMembers').put(optionsNewMember);
                    
                    putRequest.onerror = function () {
                        console.error('Error put -> ', this.error.name, this.error.message);
                        Materialize.toast('Fail, dni must be unique.', 3000, 'rounded');
                    };
                    
                    transaction.oncomplete = function () {
                        formWidget.reset();
                        formWidget.changeInputStyleState('.js-control-form:input', null);
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