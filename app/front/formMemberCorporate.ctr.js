;(function ($, w, d, IndexedDB, FormValidation, Materialize, widgetTeamMember) {
    'use strict';
    
    var APP = {
        localDB : new IndexedDB(),
        formWidget : new FormValidation('.js-form-new-member', '#modal-error-widget'),
        widgetTeamMember: widgetTeamMember()
    };
            
    $(d).ready(function () {
        var localDB = APP.localDB, connDB,
            formWidget = APP.formWidget,
            widgetTeamMember = APP.widgetTeamMember,
            $formMemberDni = formWidget.$form.find('.js-control-team-dni'),
            $formMemberName = formWidget.$form.find('.js-control-team-name'),
            $formMemberCharge = formWidget.$form.find('.js-control-team-charge:input'),
            $formMemberBirthdate = formWidget.$form.find('.js-control-team-birthdate'),
            loadMembersData = function () {
                localDB.loadIndexedDBData('teamMembers', 'readonly')
                    .done(function (data) {
                        widgetTeamMember.refreshTableWidget('.js-table-members', data);
                    })
                    .fail(function (error) {
                        console.error(error);
                        widgetTeamMember.refreshTableWidget('.js-table-members', false);
                        Materialize.toast('Fail, Cannot connect your Database.', 3000, 'rounded');
                    });
            };
             
        widgetTeamMember.initDomElements(
            '.js-modal-error-trigger',
            '.datepicker',
            '.js-control-team-charge');
        formWidget.setFormMessages(widgetTeamMember.getMessageValidation());
        
        // open Local DB
        localDB.selectDB('corporation', 1);
        localDB.openDataBase();
        connDB = localDB.getConnection();
        
        /**
         * ON First creation Database or change version
         * Create Documents and index columns
         */
        connDB.onupgradeneeded = function () {
            var documentDB = widgetTeamMember.getDocumentData('teamMembers');
            
            // create document
            localDB.createDocument(documentDB);
            // indexed columns
            localDB.createIndex(documentDB.name, documentDB.fields.dni);
            localDB.createIndex(documentDB.name, documentDB.fields.name);
            localDB.createIndex(documentDB.name, documentDB.fields.charge);
            localDB.createIndex(documentDB.name, documentDB.fields.birthdate);
        };
        
        /**
         * on open database succefully connection, load results db into table
         */
        connDB.onsuccess = function () {  
            console.info('Successfully loaded ´corporation´ database');
            loadMembersData();
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
                    formWidget.checkDni($formMemberDni) &
                    formWidget.checkBirthDateUI($formMemberBirthdate)) {
                    var optionsNewMember = {
                            dni: $formMemberDni.val(),
                            name: $formMemberName.val(),
                            charge: $formMemberCharge.find(':selected').text(),
                            birthdate: $formMemberBirthdate.val()
                        },
                        transaction = localDB.getActiveDb().transaction(['teamMembers'], 'readwrite'),
                        putRequest = transaction.objectStore('teamMembers').put(optionsNewMember);
                    
                    putRequest.onerror = function () {
                        console.error('Error put -> ', this.error.name, this.error.message);
                        Materialize.toast('Fail, dni must be unique.', 3000, 'rounded');
                    };
                    
                    transaction.oncomplete = function () {
                        loadMembersData();
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
}(jQuery, window, document, IndexedDB, FormValidation, Materialize, inserTeamMemberFactory));