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
            resetFormStatus = function (newState, arrOldState) {
                widgetTeamMember.changeWidgetDomState($widgetSuscribeMember, newState,arrOldState);
                formWidget.reset();
                formWidget.changeInputStyleState('.js-control-form:input', null);
            },
            // load all objects from document into widget
            loadMembersData = function () {
                localDB.loadIndexedDBData('teamMembers', 'readonly')
                    .done(function (data) {
                        var hasRequestData = $.isArray(data) && data.length > 0;
                        
                        hasRequestData && widgetTeamMember.refreshTableWidget($tableMembers, data);
                        $tableMembers.toggleClass('hide', !hasRequestData);
                    })
                    .fail(function (error) {
                        console.error(error);
                        Materialize.toast('Fail, Cannot connect your Database.', 3000, 'rounded');
                    })
                    .always(function () {
                        resetFormStatus('wrapper__insert-member', ['wrapper__edit-member']);
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
            /*
            onclick -> .js-submit-edit-save-member
            editMemberData = function () {}
             */
            // load data from one object of document into form widget
            loadFormMemberData = function (indexObject) {
                localDB.getIndexedDBData('teamMembers', 'readonly', indexObject)
                    .done(function (dataMember) {
                        resetFormStatus('wrapper__edit-member', ['wrapper__insert-member']);
                        console.dir(dataMember);
                        /*
                        formWidget.fillDataForm(dataMember) // load new data into form
                        ;*/
                    })
                    .fail(function (error) {
                        console.error('Error put -> ', error.name, error.message);
                        Materialize.toast('Fail, could not get data.', 3000, 'rounded');
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
            })
            .on('click', '.js-submit-edit-cancel-member', function () {
                resetFormStatus('wrapper__insert-member', ['wrapper__edit-member']);
            });
        formWidget.$form.find(':input').on('invalid', function (ev) {
            ev.preventDefault(); // prevent show mesage native validity
        });
        $tableMembers.find('tbody').on('click', 'tr', function () {
            var indexObject = this.dataset.indexeddbIndex;
            loadFormMemberData(indexObject);
        });
        openMemberDatabase();
    });
}(jQuery, window, document, IndexedDB, FormValidation, Materialize, inserTeamMemberFactory));