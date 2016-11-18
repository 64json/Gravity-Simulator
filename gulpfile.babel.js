'use strict';

import path from "path";
import gulp from "gulp";
import header from "gulp-header";
import gutil from "gulp-util";
import sourcemaps from "gulp-sourcemaps";
import connect from "gulp-connect";
import browserify from "browserify";
import babelify from "babelify";
import source from "vinyl-source-stream";
import buffer from "vinyl-buffer";
import pkg from "./package.json";

const appName = 'gravity_simulator';

const outputPaths = {
    js: './public',
    sourceMaps: './'
};

const banner = [
    '/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @author <%= pkg.author %>',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''
].join('\n');

// Build Directories
const jsDir = path.join(__dirname, 'js', '**', '*.js');

function onError(err) {
    console.log(err);
    this.emit('end');
}

// JS
gulp.task('build-js', () => {
    gutil.log('\n\nBuild JS Paths: \n', jsDir, '\n\n');

    return browserify({
        entries: './js/index.js',
        debug: true
    })
        .transform('babelify', {
            presets: ['es2015'],
            plugins: [
                ["babel-plugin-transform-builtin-extend", {
                    globals: ["Error"],
                    "approximate": true
                }]
            ]
        })
        .bundle()
        .on('error', onError)
        .pipe(source(`${appName}.js`))
        .pipe(header(banner, {pkg}))
        .pipe(buffer())
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write(outputPaths.sourceMaps))
        .pipe(gulp.dest(outputPaths.js))
        .pipe(connect.reload());

});

// Server
gulp.task('connect', function () {
    connect.server({
        port: process.env.PORT || 8080,
        livereload: true
    });
});

// Watch
gulp.task('watch', function () {
    gulp.watch(jsDir, ['build-js']);
});

// Default
gulp.task('default', ['connect', 'watch']);