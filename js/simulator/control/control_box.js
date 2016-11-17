class ControlBox {
    constructor(title, controllers) {
        const $controlBox = $('.control-box.template').clone();
        $controlBox.removeClass('template');
        $controlBox.find('.title').text(title);
        const $inputContainer = $controlBox.find('.input-container');
        for (const controller of controllers) {
            $inputContainer.append(controller.$inputWrapper);
        }

        this.$controlBox = $controlBox;
    }

    destroy() {
        this.$controlBox.remove();
    }
}