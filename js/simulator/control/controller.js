class Controller {
    constructor(object, name, min, max, value, func) {
        const $inputWrapper = $('.control-box.template .input-wrapper.template').clone();
        $inputWrapper.removeClass('template');
        $inputWrapper.find('span').text(name);
        const $input = $inputWrapper.find('input');
        $input.attr('min', min);
        $input.attr('max', max);
        $input.attr('value', value);
        $input.on('input', e => {
            func.call(object, e);
        });

        this.$inputWrapper = $inputWrapper;
        this.$input = $input;
    }

    get() {
        return Math.floor(this.$input.val());
    }
}

module.exports = Controller;