class Controller {
    constructor(object, name, min, max, value, func) {
        const $inputWrapper = this.$inputWrapper = $('.control-box.template .input-wrapper.template').clone();
        $inputWrapper.removeClass('template');
        $inputWrapper.find('.name').text(name);
        const $input = this.$input = $inputWrapper.find('input');
        $input.attr('min', min);
        $input.attr('max', max);
        $input.attr('value', value);
        $input.attr('step', 0.01);
        const $value = $inputWrapper.find('.value');
        $value.text(this.get());
        $input.on('input', e => {
            $value.text(this.get());
            func.call(object, e);
        });
    }

    get() {
        return parseFloat(this.$input.val());
    }
}

module.exports = Controller;