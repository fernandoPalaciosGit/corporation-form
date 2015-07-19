;(function ($, w, d) {
    'use strict';
    
    /**
     * Error messages hashtable
     * Input key´s messages correspond with ElementInput@ValidityState
     */
    var messagesValidation = {
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
     
    w.FormValidation = function (f, m, tm) {
        this.$form = $(f);
        this.$triggerWidget = $(tm);
        this.$modalWidget = $(m);

        this.$triggerWidget.leanModal({
          dismissible: false,
          in_duration: 300,
          out_duration: 200
        });
    };
    
    w.FormValidation.prototype.reset = function () {
        this.$form.get(0).reset();
    };
    
    w.FormValidation.prototype.setCustomMsg = function (item) {
        var $erroList = this.$modalWidget.find('.list-errors');
        if (item === null) {
            $erroList.empty();
            
        } else if (!!item) {
            var itemList = d.createElement('li');
            
            itemList.innerText = item;
            itemList.classList.add('collection-item');
            $erroList.append(itemList);
        }
    };
    
    w.FormValidation.prototype.nativeValidate = function () {
        var isValid = false;
        
        isValid = this.$form.get(0).checkValidity();
        
        if (!isValid) {
            this.$form.find('.js-control-form:input').each($.proxy(function(index, input) {
                !input.validity.valid && this.ValidityState(input);
            }, this));
        }
        
        return isValid;
    };
    
    w.FormValidation.prototype.ValidityState = function (input) {
        var validityState = input.validity,
            dataMsgIndex = input.dataset.msgValidation;
        
        for ( var state in validityState) {
            if (validityState[state] === true && !!messagesValidation[dataMsgIndex]) {
                console.info('Native invalid --> ', dataMsgIndex, state);
                this.changeInputDomState($(input), 'invalid', dataMsgIndex, state);
                this.changeInputStyleState($(input), false);
            }
        }
    };
    
    w.FormValidation.prototype.checkDni = function (s) {
        var numero, letra, letraControl,
            $dni = this.$form.find(s),
            dniName = $dni.val().trim(),
            isValid = false;

        if (/^[XYZ]?\d{5,8}[A-Z]$/.test(dniName)) {
            numero = dniName.substr(0,dniName.length-1);
            numero = numero.replace('X', 0).replace('Y', 1).replace('Z', 2);
            numero = numero % 23;
            letra = dniName.substr(dniName.length-1, 1);
            letraControl = 'TRWAGMYFPDXBNJZSQVHLCKET'.substring(numero, numero+1);            
            isValid = (letraControl !== letra) ? false : true;
        }
        
        !isValid && this.changeInputDomState($dni, 'invalid', 'dni', 'text');
        this.changeInputStyleState($dni, isValid);
        return isValid;
    };
    
    w.FormValidation.prototype.checkBirthDateUI = function (s) {
        var $birthdate = this.$form.find(s),
            $birthdateVal = $birthdate.val().trim(),
            isValid = ($birthdateVal.length > 0) ? true : false;    
        
        !isValid && this.changeInputDomState($birthdate, 'invalid', 'birthdate', 'text');
        this.changeInputStyleState($birthdate, isValid);
        return isValid;        
    };
    
    w.FormValidation.prototype.changeInputDomState = function ($input, domState, msgIndex, msgtate) {
        $input.addClass(domState);
        this.setCustomMsg(messagesValidation[msgIndex][msgtate]);
    };
    
    /**
     * [changeInputStyleState description]
     * @param  {jQuery, string} input form control
     * @param  {Boolean, Null} isValid change style state by css class, null means disabled state
     */
    w.FormValidation.prototype.changeInputStyleState = function (input, isValid) {
        var $input = (input instanceof $) ? input : this.$form.find(input);
        
        $input.removeClass('invalid valid');
        
        if (isValid !== null) {
            $input
                .toggleClass('invalid', !isValid)
                .toggleClass('valid', isValid);
        }
    };
}(jQuery, window, document));