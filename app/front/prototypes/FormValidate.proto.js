;(function ($, w, d) {
    'use strict';
             
    w.FormValidation = function (f, m) {
        this.$form = $(f);
        this.$modalWidget = $(m);
    };
    
    w.FormValidation.prototype.reset = function () {
        this.$form.get(0).reset();
    };
    
    w.FormValidation.prototype.setCustomMsg = function (itemText) {
        var $erroList = this.$modalWidget.find('.list-errors');
        if (itemText === null) {
            $erroList.empty();
            
        } else if (!!itemText) {
            var itemList = d.createElement('li');
            
            itemList.innerText = itemText;
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
            if (validityState[state] === true && !!this.messagesValidation[dataMsgIndex]) {
                console.info('Native invalid --> ', dataMsgIndex, state);
                this.changeInputDomState($(input), 'invalid', dataMsgIndex, state);
                this.changeInputStyleState($(input), false);
            }
        }
    };
    
    w.FormValidation.prototype.checkDni = function ($dni) {
        var numero, letra, letraControl,
            dniName = $dni.val().trim(),
            isValid = false;

        if (/^[XYZ]?\d{5,8}[A-Za-z]$/.test(dniName)) {
            numero = dniName.substr(0,dniName.length-1);
            numero = numero.replace('X', 0).replace('Y', 1).replace('Z', 2);
            numero = numero % 23;
            letra = dniName.substr(dniName.length-1, 1).toUpperCase();
            letraControl = 'TRWAGMYFPDXBNJZSQVHLCKET'.substring(numero, numero+1);            
            isValid = (letraControl !== letra) ? false : true;
        }
        
        !isValid && this.changeInputDomState($dni, 'invalid', 'dni', 'text');
        this.changeInputStyleState($dni, isValid);
        return isValid;
    };
    
    w.FormValidation.prototype.checkBirthDateUI = function ($birthdate) {
        var $birthdateVal = $birthdate.val().trim(),
            isValid = ($birthdateVal.length > 0) ? true : false;    
        
        !isValid && this.changeInputDomState($birthdate, 'invalid', 'birthdate', 'text');
        this.changeInputStyleState($birthdate, isValid);
        return isValid;        
    };
    
    w.FormValidation.prototype.changeInputDomState = function ($input, domState, msgIndex, msgtate) {
        $input.addClass(domState);
        this.setCustomMsg(this.messagesValidation[msgIndex][msgtate]);
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
    
    w.FormValidation.prototype.setFormMessages = function (msgVal) {
        this.messagesValidation = msgVal;
    };

}(jQuery, window, document));