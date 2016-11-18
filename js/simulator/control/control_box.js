class ControlBox {
    constructor(title, controllers) {
        const $templateControlBox = $('.control-box.template');
        const $controlBox = $templateControlBox.clone();
        $controlBox.removeClass('template');
        $controlBox.find('.title').text(title);
        const $inputContainer = $controlBox.find('.input-container');
        for (const controller of controllers) {
            $inputContainer.append(controller.$inputWrapper);
        }
        $controlBox.find('.close').click(() => {
            $controlBox.remove();
        });
        $controlBox.insertAfter($templateControlBox);

        this.$controlBox = $controlBox;
    }

    destroy() {
        this.$controlBox.remove();
    }
}

module.exports = ControlBox;