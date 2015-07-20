;(function ($, w, d, IndexedDB, FormValidation, Materialize, widgetTeamMember) {
    'use strict';
    
    var APP = {
        localDB : new IndexedDB(),
        formWidget : new FormValidation('.js-form-new-member', '#modal-error-widget'),
        widgetTeamMember: widgetTeamMember()
    };
            
    $(d).ready(function () {
        var localDB = APP.localDB,
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
            },
            insertMemberData = function (optionsNewMember) {
                localDB.insertIndexedDBData('teamMembers', 'readwrite', optionsNewMember)
                    .done(function () {
                        loadMembersData();
                        formWidget.reset();
                        formWidget.changeInputStyleState('.js-control-form:input', null);
                        Materialize.toast('Added, new Member.', 3000, 'rounded');
                    })
                    .fail(function (error) {
                        console.error('Error put -> ', error.name, error.message);
                        Materialize.toast('Fail, dni must be unique.', 3000, 'rounded');
                    });
            },
            openMemberDatabase = function () {
                localDB.openIndexedDBDatabase('corporation', 1, widgetTeamMember.getDocumentData('teamMembers'))
                    .done(function () {
                        console.info('Successfully loaded ´corporation´ database');
                        loadMembersData();
                    })
                    .fail(function (error) {
                        console.error('Error connection -> ', error.name, error.message);
                    });
            };
             
        widgetTeamMember.initDomElements(
            '.js-modal-error-trigger',
            '.datepicker',
            '.js-control-team-charge');
        formWidget.setFormMessages(widgetTeamMember.getMessageValidation());
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
                        };
                    
                    insertMemberData(optionsNewMember);
                
                } else {
                    formWidget.$modalWidget.openModal();
                }
            })
            .find(':input').on('invalid', function (ev) {
                ev.preventDefault(); // prevent show mesage native validity
            });
        openMemberDatabase();
    });
}(jQuery, window, document, IndexedDB, FormValidation, Materialize, inserTeamMemberFactory));