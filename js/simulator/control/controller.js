class Controller {
    constructor(name, min, max, value, func) {
        const $inputWrapper = $('.input-wrapper.template').clone();
        $inputWrapper.removeClass('template');
        $inputWrapper.find('span').text(name);
        const $input = $inputWrapper.find('input');
        $input.attr('min', min);
        $input.attr('max', max);
        $input.attr('value', value);
        $input.change(func);

        this.$inputWrapper = $inputWrapper;
        this.$input = $input;
    }

    get() {
        return this.$input.val();
    }
}

module.exports = Controller;