;(function ($, w, d) {
    'use strict';
    
    var messagesValidation = {
        'nameInput': {
            valueMissing: 'Fill Team member name.',
            patternMismatch: 'Name members least 4 letters, no digits.'
        },     
        'dniInput': {
            valueMissing: 'Fill Dni member.',
            patternMismatch: 'DNI Invalid characters.'
        },     
        'dni': {
            text : 'Dni Not real.'
        }
    };
     
    w.FormValidation = function (f, n, d, m, tm) {
        this.$form = $(f);
        this.$memberName = this.$form.find(n);
        this.$memberDni = this.$form.find(d);
        this.$triggerWidget = $(tm);
        this.$modalWidget = $(m);
        
        this.$triggerWidget.leanModal({
          dismissible: true,
          opacity: 0.5,
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
            !this.$memberName.get(0).validity.valid && this.ValidityState(this.$memberName);
            !this.$memberDni.get(0).validity.valid && this.ValidityState(this.$memberDni);
        }
        return isValid;
    };
    
    w.FormValidation.prototype.ValidityState = function ($input) {
        var validityState = $input.get(0).validity,
            dataMsg = $input.data('msgValidation');
        
        for ( var state in validityState) {
            if (validityState[state] === true && !!messagesValidation[dataMsg]) {
                // log invalid messages : console.log(dataMsg, state);
                this.setCustomMsg(messagesValidation[dataMsg][state]);
            }
        }
    };
    
    w.FormValidation.prototype.checkDni = function () {
        var numero, letra, letraControl,
            dni = this.$memberDni.val().trim(),
            dniRegex = /^[XYZ]?\d{5,8}[A-Z]$/,
            isValid = false;

        if (dniRegex.test(dni)) {
            numero = dni.substr(0,dni.length-1);
            numero = numero.replace('X', 0).replace('Y', 1).replace('Z', 2);
            numero = numero % 23;
            letra = dni.substr(dni.length-1, 1);
            letraControl = 'TRWAGMYFPDXBNJZSQVHLCKET'.substring(numero, numero+1);            
            isValid = (letraControl !== letra) ? false : true;
        }
        
        !isValid && this.setCustomMsg(messagesValidation['dni'].text);
        return isValid;
    };
}(jQuery, window, document));