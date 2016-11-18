class ControlBox {
    constructor(title, controllers, x, y) {
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
        $controlBox.insertBefore($templateControlBox);
        $controlBox.css('left', x + 'px');
        $controlBox.css('top', y + 'px');

        this.$controlBox = $controlBox;
    }

    close() {
        this.$controlBox.remove();
    }

    isOpen() {
        return this.$controlBox[0].parentNode;
    }
}

module.exports = ControlBox;