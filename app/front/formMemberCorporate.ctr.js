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
            $widgetSuscribeMember = $('#widget-suscribe-member'), 
            $tableMembers = $widgetSuscribeMember.find('.js-table-members'),
            $formMemberDni = $widgetSuscribeMember.find('.js-control-team-dni'),
            $formMemberName = $widgetSuscribeMember.find('.js-control-team-name'),
            $formMemberCharge = $widgetSuscribeMember.find('.js-control-team-charge:input'),
            $formMemberBirthdate = $widgetSuscribeMember.find('.js-control-team-birthdate'),
            // load all objects from document into widget
            loadMembersData = function () {
                localDB.loadIndexedDBData('teamMembers', 'readonly')
                    .done(function (data) {
                        widgetTeamMember.refreshTableWidget($tableMembers, data);
                        $widgetSuscribeMember.addClass('widget-wrapper__load-table');
                    })
                    .fail(function (error) {
                        console.error(error);
                        $widgetSuscribeMember.removeClass('widget-wrapper__load-table');
                        Materialize.toast('Fail, Cannot connect your Database.', 3000, 'rounded');
                    })
                    .always(function () {
                        formWidget.reset();
                        formWidget.changeInputStyleState('.js-control-form:input', null);
                    });
            },
            // insert new object into document
            insertMemberData = function (optionsNewMember) {
                localDB.insertIndexedDBData('teamMembers', 'readwrite', optionsNewMember)
                    .done(function () {
                        loadMembersData();
                        Materialize.toast('Added, new Member.', 3000, 'rounded');
                    })
                    .fail(function (error) {
                        console.error('Error put -> ', error.name, error.message);
                        Materialize.toast('Fail, dni must be unique.', 3000, 'rounded');
                    });
            },
            // load data from one object of document
            editMemberData = function (indexObject) {
                $widgetSuscribeMember
                    .removeClass('widget-wrapper__load-table')
                    .addClass('widget-wrapper__edit-member');
                localDB.editIndexedDBData('teamMembers', 'readonly', indexObject)
                    .done(function () {
                        loadMembersData();
                    })
                    .fail(function (error) {
                        console.error('Error put -> ', error.name, error.message);
                        Materialize.toast('Fail, could not change data.', 3000, 'rounded');
                    })
                    .always(function () {
                        $widgetSuscribeMember
                            .addClass('widget-wrapper__load-table')
                            .removeClass('widget-wrapper__edit-member');
                    });
            },
            // initialize active database
            openMemberDatabase = function () {
                localDB.openIndexedDBDatabase('corporation', 1, widgetTeamMember.getDocumentData('teamMembers'))
                    .done(function () {
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
            .on('click', '.js-submit-insert-member', function () {
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
            });
        formWidget.$form.find(':input').on('invalid', function (ev) {
            ev.preventDefault(); // prevent show mesage native validity
        });
        $tableMembers.find('tbody').on('click', 'tr', function () {
            var indexObject = this.dataset.indexeddbIndex;
            editMemberData(indexObject);
        });
        
        openMemberDatabase();
    });
}(jQuery, window, document, IndexedDB, FormValidation, Materialize, inserTeamMemberFactory));