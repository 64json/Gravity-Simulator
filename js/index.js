const preset = require('./preset');
const Simulator = require('./simulator');

const simulator = new Simulator(preset);
simulator.animate();

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

const {deg2rad, getXRotationMatrix, getYRotationMatrix, rotate} = require('./simulator/util');
const angleX = deg2rad(30);
const angleY = deg2rad(50);
const Rx = getXRotationMatrix(angleX);
const Rx_ = getXRotationMatrix(angleX, -1);
const Ry = getYRotationMatrix(angleY);
const Ry_ = getYRotationMatrix(angleY, -1);
console.log(rotate(rotate(rotate(rotate([-5, 8, 3], Rx), Ry), Ry_), Rx_));