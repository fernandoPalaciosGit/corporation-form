;(function ($, w, d) {
    'use strict';

    w.inserTeamMemberFactory = function () {
         /**
         * Error messages hashtable
         * Input key´s messages correspond with ElementInput@ValidityState
         */
        var _messagesValidation = {
            'nameInput': {
                valueMissing: 'Fill Team member name.',
                patternMismatch: 'Name members at least 4 letters and no digits.'
            },     
            'dniInput': {
                valueMissing: 'Fill Dni member.',
                patternMismatch: 'DNI Invalid characters.'
            },
            'chargeInput': {
                valueMissing: 'Fill Charge into Corporation.',
            },
            'birthdate': {
                text: 'Birtdate not correct.',
            },
            'dni': {
                text : 'Dni Not real.'
            }
        };
        
        /**
         * Indexed DB options Databes required
         */
        var _documentsData = {            
            'teamMembers' : {
                name : 'teamMembers',
                options: {
                    keypath: 'id',
                    autoIncrement: true
                },
                fields: {
                    dni: ['idx_dni', 'dni', {unique: true}],
                    name: ['idx_name', 'name', {unique: false}],
                    charge: ['idx_charge', 'charge', {unique: false}],
                    birthdate: ['idx_birthdate', 'birthdate', {unique: false}]
                }
            }
        };
        
        var _inputType = {
            SELECT : 'select-one',
            TEXT: 'text'
        };
                
        var initDomElements = function (triggerWidget, datepicker, selectCharge) {
            $(triggerWidget).leanModal({
                dismissible: true,
                opacity: 0.5,
                in_duration: 300,
                out_duration: 200,
            });
            
            // load widget controls
            $(datepicker).pickadate({
                selectMonths: true,
                selectYears: 50,
                editable: false,
                formatSubmit: 'dd mmmm, yyyy',
                max: new Date()
            });
            
            $(selectCharge).material_select();
        };
        
        var getMessageValidation = function () {
            return _messagesValidation;
        };
        
        var getDocumentData = function (indexName) {
            return _documentsData[indexName];
        };
        
        var _getTableMemberData = function (arrData) {
            var domFragment = d.createDocumentFragment(),
                getTableData = function (data) {
                    return [
                        '<td>' + data.name + '</td>',
                        '<td>' + data.dni + '</td>',
                        '<td>' + data.charge + '</td>',
                        '<td>' + data.birthdate + '</td>',
                    ].join('\n');
                };
                
            $(arrData).each(function(index, item) {
                var tr = d.createElement('tr');
                tr.dataset.indexeddbIndex = item.primaryKey;
                tr.innerHTML = getTableData(item.value);
                domFragment.appendChild(tr);
            });
            
            return domFragment;
        };
        
        var refreshTableWidget = function ($tableWrapper, data) {
            var $tableBody = $tableWrapper.find('tbody'),
                tableData;

            $tableBody.empty();
            tableData = _getTableMemberData(data);
            $tableBody.append(tableData);
        };
        
        var changeWidgetDomState = function ($widget, newState, arrOldState) {
            $widget
                .removeClass(arrOldState.join(' '))
                .addClass(newState);
        };
        
        // load new data into form depend on the tyepe
        var fillDataForm = function ($form, dataMember) {
            for ( var keyData in dataMember) {
                var $input = $form.find('#' + keyData + ':input'),
                    inputType = $input.prop('type'),
                    inputText = dataMember[keyData];
                
                
                 // control dinamicaly input
                if (inputType === _inputType.SELECT) {
                    // reset select by index
                    var indexInput = $input
                                        .siblings('ul.select-dropdown')
                                        .find('li:contains("' + inputText + '")')
                                        .index();
                    
                    $input
                        .prop('selectedIndex', indexInput)
                        .material_select();
                
                } else if (inputType === _inputType.TEXT) {
                    $input.val(inputText);
                }
                
                $input.trigger('change');
            }
        };
        
        return {
            fillDataForm : fillDataForm,
            changeWidgetDomState: changeWidgetDomState,
            initDomElements: initDomElements,
            refreshTableWidget: refreshTableWidget,
            getMessageValidation : getMessageValidation,
            getDocumentData : getDocumentData
        };
    };
}(jQuery, window, document));