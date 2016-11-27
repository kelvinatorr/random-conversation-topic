/**
 * Created by Kelvin on 10/17/2016.
 */
var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var vulcanize = require('gulp-vulcanize');
var del = require('del');
var minifyCss = require('gulp-minify-css');
var merge = require('merge-stream');
var runSequence = require('run-sequence');
var minifyInline = require('gulp-minify-inline');
var htmlmin = require('gulp-htmlmin');
var packageJson = require('./package.json');
var $ = require('gulp-load-plugins')();
var path = require('path');


// delete everything in the www folder
gulp.task('clean-dist', function () {
    return del([
        'dist/**/*'
    ]);
});

gulp.task('build', function(callback) {
    runSequence('clean-dist',
        ['copy-files', 'vulcanize'],
        'uglifyInlineJS', callback);
});

gulp.task('uglifyInlineJS', function() {
    return gulp.src('dist/index.html')
        .pipe(minifyInline())
        .pipe(htmlmin({removeComments: true}))
        .pipe(gulp.dest('dist'));
});


// copy over images, fonts and 3rd party css html
gulp.task('copy-files', function() {

    // copy over css files
    //var cssFiles = ['app/styles/main.css'];
    //
    //var css = gulp.src(cssFiles)
    //    .pipe(minifyCss())
    //    .pipe(gulp.dest('dist/styles'));
    var swBootstrap = gulp.src('app/bower_components/platinum-sw/bootstrap/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/bootstrap'));

    var swToolbox = gulp.src('app/bower_components/sw-toolbox/*.{js,map}')
        .pipe(gulp.dest('dist/sw-toolbox'));


    var sw = gulp.src('app/bower_components/platinum-sw/service-worker.js')
        .pipe(gulp.dest('dist'));

    var manifest = gulp.src('app/manifest.json')
        .pipe(gulp.dest('dist'));

    var imgs = gulp.src('app/imgs/*')
        .pipe(gulp.dest('dist/imgs'));

    return merge(swBootstrap, swToolbox, sw, manifest, imgs);
});

gulp.task('vulcanize', function () {
    return gulp.src('app/index.html')
        .pipe(vulcanize({
            abspath: '',
            inlineScripts: true
        }))
        .pipe(gulp.dest('dist'));
});