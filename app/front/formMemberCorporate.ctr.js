;( function ($, w, d, IndexedDB, FormValidation, Materialize, widgetTeamMember) {
    'use strict';
        
    var APP = {
        localDB : new IndexedDB(),
        formWidget : new FormValidation('.js-form-new-member', '#modal-error-widget', '#modal-remove-member-widget'),
        widgetTeamMember: widgetTeamMember(),
        DB: {
            NAME: 'corporation',
            DOCUMENT: 'teamMembers',
            VERSION: 1
        },
        selectors : ( function () {
            var $widget = $('#widget-suscribe-member');
            return {
                $widgetSuscribeMember : $widget,
                $undoModified : $widget.find('.js-submit-edit-cancel-member'),
                $removeMember : $widget.find('.js-modal-remove-member'),
                $orderMembers : $widget.find('.js-order-member-data'),
                // FORM CONTROL ELEMENTS
                $tableMembers : $widget.find('.js-table-members'),
                $formMemberDni : $widget.find('.js-control-team-dni'),
                $formMemberName : $widget.find('.js-control-team-name'),
                $formMemberCharge : $widget.find('.js-control-team-charge:input'),
                $formMemberBirthdate : $widget.find('.js-control-team-birthdate')
            };
        })(),
        resetFormStatus : function (newState, arrOldState) {
            this.widgetTeamMember.changeWidgetDomState(this.selectors.$widgetSuscribeMember, newState, arrOldState);
            this.formWidget.reset();
            this.selectors.$formMemberCharge.prop('selectedIndex', 0).material_select();
            this.formWidget.changeInputStyleState('.js-control-form:input', null);
        },
        resetOrderStatus : function (el) {
            var elUnOrdered = this.selectors.$orderMembers.find('.material-icons'),
                elOrdered = $(el).find('.material-icons');

            this.widgetTeamMember.changeWidgetDomState(elUnOrdered, 'icon-up', ['icon-down', 'icon-up']);
            this.widgetTeamMember.changeWidgetDomState(elOrdered, 'icon-down', ['icon-down', 'icon-up']);
        },
        // initialize active database
        openMemberDatabase : function () {
            this.localDB.openIndexedDBDatabase(
                    this.DB.NAME,
                    this.DB.VERSION,
                    this.widgetTeamMember.getDocumentData(this.DB.DOCUMENT)
                )
                .done($.proxy(this.loadMembersData, this))
                .progress(this.notifyProggress);
        },
        // load all objects from document into widget
        loadMembersData : function () {
            this.localDB.loadIndexedDBData(this.DB.DOCUMENT, 'readonly')
                .done($.proxy( function (data) {
                    var hasRequestData = $.isArray(data) && data.length > 0;
                    
                    hasRequestData && this.widgetTeamMember.refreshTableWidget(this.selectors.$tableMembers, data);
                    this.selectors.$tableMembers.toggleClass('hide', !hasRequestData);
                }, this))
                .fail( function () {
                    Materialize.toast('Fail, Cannot connect your Database.', 3000, 'rounded');
                })
                .always($.proxy( function () {
                    this.selectors.$undoModified.trigger('click');
                }, this))
                .progress(this.notifyProggress);
        },
        // insert new object into document
        insertMemberData : function (optionsMember) {
            this.localDB.insertIndexedDBData(this.DB.DOCUMENT, 'readwrite', optionsMember)
                .done($.proxy( function () {
                    this.loadMembersData();
                    Materialize.toast('Added new Member.', 3000, 'rounded');
                }, this))
                .fail( function () {
                    Materialize.toast('Fail, dni must be unique.', 3000, 'rounded');
                })
                .progress(this.notifyProggress);
        },
        editMemberData : function (optionsMember) {
            this.localDB.updateIndexedDBData(this.DB.DOCUMENT, 'readwrite', optionsMember)
                .done($.proxy( function () {
                    this.loadMembersData();
                    Materialize.toast('Updated Member.', 3000, 'rounded');
                }, this))
                .fail( function () {
                    Materialize.toast('Fail, dni must be unique.', 3000, 'rounded');
                })
                .progress(this.notifyProggress);
        },
        // load data from one object of document into form widget
        loadFormMemberData : function (indexObject) {
            this.localDB.getIndexedDBData(this.DB.DOCUMENT, 'readonly', indexObject)
                .done($.proxy( function (dataMember) {
                    this.resetFormStatus('wrapper__edit-member', ['wrapper__insert-member']);
                    this.formWidget.changeMemberData = dataMember;
                    this.widgetTeamMember.fillDataForm(this.formWidget.$form, dataMember);
                }, this))
                .fail( function () {
                    Materialize.toast('Fail, could not get data.', 3000, 'rounded');
                })
                .progress(this.notifyProggress);
        },
        removeMember : function (indexObject) {
            this.localDB.removeIndexedDBData(this.DB.DOCUMENT, 'readwrite', indexObject)
                .done($.proxy( function () {
                    this.loadMembersData();
                    Materialize.toast('Removed Member.', 3000, 'rounded');
                }, this));
        },
        orderMemberData : function (indexDocument) {
            this.localDB.loadIndexedDBData(this.DB.DOCUMENT, 'readonly', indexDocument)
                .done($.proxy( function (data) {
                    this.widgetTeamMember.refreshTableWidget(this.selectors.$tableMembers, data)
                }, this));
        },
        // validate form input before insert or update member
        isCustomValidateForm : function () {
            this.formWidget.setCustomValidationItems(null);
            // Issue Materialize : https://github.com/Dogfalo/materialize/issues/1647
            $('.lean-overlay').remove();
            this.formWidget.changeInputStyleState('.js-control-form:input', true);
            
            // validate multiple input states
            var isValidateForm =    this.formWidget.nativeValidate() &
                                    this.formWidget.checkDni(this.selectors.$formMemberDni) &
                                    this.formWidget.checkBirthDateUI(this.selectors.$formMemberBirthdate);
            
            !isValidateForm && this.formWidget.$modalWidget.openModal() ;
            return isValidateForm;
        },
        // actual form values 
        getOptionsMember : function () {
            return {
                dni: this.selectors.$formMemberDni.val(),
                name: this.selectors.$formMemberName.val(),
                charge: this.selectors.$formMemberCharge.find(':selected').text(),
                birthdate: this.selectors.$formMemberBirthdate.val()
            };            
        },
        notifyProggress : function (msg, type) {
            switch(type || '') {
                case 'info':
                    console.info(msg);
                    break;
                case 'error':
                    console.error(msg);
                    break;
                case 'warn':
                    console.warn(msg);
                    break;
                default:
                    console.log(msg);
            }
        },
        initialize : function () {
            /* CONTEXT : window.APP */
            this.widgetTeamMember.initDomElements('.datepicker', '.js-control-team-charge');
            this.formWidget.setFormMessages(this.widgetTeamMember.getMessageValidation());
            this.openMemberDatabase();
        },
        listenUIActions : function () {
            /* CONTEXT : window.APP */
            this.formWidget.$form
                .on('submit', function (ev) {
                    ev.preventDefault(); // prevent redirect
                })
                .on('click', '.js-submit-insert-member', $.proxy( function () {
                    if (this.isCustomValidateForm()) {
                        this.insertMemberData(this.getOptionsMember());    
                    }
                }, this))
                .on('click', '.js-submit-edit-save-member', $.proxy( function () {
                    var optionsMember = $.extend(true, {}, this.formWidget.changeMemberData, this.getOptionsMember()); 
                    if (!$.isEmptyObject(this.formWidget.changeMemberData) && this.isCustomValidateForm()) {
                        this.editMemberData(optionsMember);
                    }
                }, this))
                .on('click', '.js-submit-edit-remove-member', $.proxy( function () {
                    this.formWidget.setConfirmationRemove(this.formWidget.changeMemberData.name);
                }, this));
                
            this.formWidget.$form.find(':input').on('invalid', function (ev) {
                ev.preventDefault(); // prevent show mesage native validity
            });
            
            this.selectors.$undoModified.on('click', $.proxy( function () {
                this.formWidget.changeMemberData = null;
                this.resetFormStatus('wrapper__insert-member', ['wrapper__edit-member']);
                this.formWidget.$modalRemove.closeModal();
                this.resetOrderStatus('');
            }, this));
            
            this.selectors.$removeMember.on('click', $.proxy( function () {
                this.removeMember(this.formWidget.changeMemberData.primaryKey);
            }, this));
            
            this.selectors.$orderMembers.on('click', $.proxy( function (ev) {
                var dataField = ev.currentTarget.dataset.field,
                    indexField = this.widgetTeamMember.getDocumentData(this.DB.DOCUMENT).fields[dataField][0];
                this.resetOrderStatus(ev.currentTarget);
                this.orderMemberData(indexField);
            }, this));
            
            this.selectors.$tableMembers.find('tbody').on('click', 'tr', $.proxy( function (ev) {
                var indexObject = ev.currentTarget.dataset.indexeddbIndex;
                this.loadFormMemberData(indexObject);
            }, this));
        },
    };
    
    $(d).ready(function () {
        APP.initialize();
        APP.listenUIActions();    
    });
}(jQuery, window, document, IndexedDB, FormValidation, Materialize, inserTeamMemberFactory));