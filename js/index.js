const presets = require('./preset');
const Simulator = require('./simulator');

const simulator = new Simulator();
let selected = 6;
simulator.init(presets[selected]);

const $select = $('select');
for (let i = 0; i < presets.length; i++) {
    const preset = presets[i];
    $select.append(`<option value="${i}"${i == selected ? ' selected' : ''}>${preset.prototype.title}</option>`);
}
$select.change(() => {
    selected = parseInt($select.find(':selected').val());
    simulator.init(presets[selected]);
});
$('#reset').click(() => {
    simulator.init(presets[selected]);
});


let $moving = null;
let px, py;

$('body').on('mousedown', '.control-box .title-bar', function (e) {
    px = e.pageX;
    py = e.pageY;
    $moving = $(this).parent('.control-box');
    $moving.nextUntil('.control-box.template').insertBefore($moving);
    return false;
});

$('body').mousemove(function (e) {
    if (!$moving) return;
    const x = e.pageX;
    const y = e.pageY;
    $moving.css('left', parseInt($moving.css('left')) + (x - px) + 'px');
    $moving.css('top', parseInt($moving.css('top')) + (y - py) + 'px');
    px = e.pageX;
    py = e.pageY;
});

$('body').mouseup(function (e) {
    $moving = null;
});