/* eslint-env node */
const project = require('./package.json');
const { src, dest, series, watch } = require('gulp');
const browsersync = require('browser-sync').create();
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const minifycss = require('gulp-clean-css');
const rename = require('gulp-rename');
const sassGlob = require('gulp-sass-glob');
const plumber = require('gulp-plumber');
const zip = require('gulp-zip');

function reloadBrowsers(done) {
    browsersync.reload();
    done()
}

function compileCSS() {
    'use strict';
    return src('sass/main.scss')
        .pipe(plumber())
        .pipe(sourcemaps.init({largeFile: true}))
        .pipe(rename({
            basename: 'style'
        }))
        .pipe(sassGlob())
        .pipe(sass())
        .pipe(autoprefixer({ grid: true }))
        .pipe(sourcemaps.write())
        .pipe(dest('assets/css/'))
        .pipe(minifycss())
        .pipe(sourcemaps.write())
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(dest('assets/css/'))
        .pipe(browsersync.reload({stream: true}));
}

function serve() {
    'use strict';
    browsersync.init({
        logPrefix: 'Saga for Ghost',
        port: 3000
    });

    watch('sass/**/*.scss', compileCSS);
    watch(['./*.hbs', './partials/*.hbs'], reloadBrowsers);
    watch('assets/**/*.js', reloadBrowsers);
}

function createPackage() {
    return src([
        './**',
        '!node_modules/**',
        '!./**.zip'
    ])
        .pipe(zip('Saga-' + project.version + '.zip'))
        .pipe(dest('./'));
}

exports.default = series(compileCSS, serve);
exports.compileCSS = compileCSS;
exports.serve = serve;
exports.createPackage = createPackage