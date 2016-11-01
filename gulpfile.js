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
var swPrecache = require('sw-precache');
var packageJson = require('./package.json');
var $ = require('gulp-load-plugins')();
var path = require('path');

var DEV_DIR = 'app';
var DIST_DIR = 'dist';

var rev = require('gulp-rev');

gulp.task('rev', function() {
    gulp.src('app/styles/*.css')
        .pipe(rev())
        .pipe(gulp.dest('dist'))
});


function writeServiceWorkerFile(rootDir, handleFetch, callback) {
    var config = {
        cacheId: packageJson.name,
        /*
         dynamicUrlToDependencies: {
         'dynamic/page1': [
         path.join(rootDir, 'views', 'layout.jade'),
         path.join(rootDir, 'views', 'page1.jade')
         ],
         'dynamic/page2': [
         path.join(rootDir, 'views', 'layout.jade'),
         path.join(rootDir, 'views', 'page2.jade')
         ]
         },
         */
        // If handleFetch is false (i.e. because this is called from generate-service-worker-dev), then
        // the service worker will precache resources but won't actually serve them.
        // This allows you to test precaching behavior without worry about the cache preventing your
        // local changes from being picked up during the development cycle.
        handleFetch: handleFetch,
        logger: $.util.log,
        //runtimeCaching: [{
        //    // See https://github.com/GoogleChrome/sw-toolbox#methods
        //    urlPattern: /runtime-caching/,
        //    handler: 'cacheFirst',
        //    // See https://github.com/GoogleChrome/sw-toolbox#options
        //    options: {
        //        cache: {
        //            maxEntries: 1,
        //            name: 'runtime-cache'
        //        }
        //    }
        //}],
        staticFileGlobs: [
            rootDir + '/styles/**.css',
            rootDir + '/**.html',
            rootDir + '/images/**.*',
            rootDir + '/js/**.js',
            rootDir + '/**.json',
            rootDir + '/elements/**.html',
            rootDir + '/bower_components/**/*.{js,html}'
        ],
        stripPrefix: rootDir + '/',
        // verbose defaults to false, but for the purposes of this demo, log more.
        verbose: true
    };

    swPrecache.write(path.join(rootDir, 'service-worker.js'), config, callback);
}

gulp.task('generate-service-worker-dev', function(callback) {
    writeServiceWorkerFile(DEV_DIR, true, callback);
});

//gulp.task('generate-service-worker-dist', function(callback) {
//    writeServiceWorkerFile(DIST_DIR, true, callback);
//});

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

    var manifest = gulp.src('app/manifest.json')
        .pipe(gulp.dest('dist'));

    var imgs = gulp.src('app/imgs/*')
        .pipe(gulp.dest('dist/imgs'));

    return merge(manifest, imgs);
});

gulp.task('vulcanize', function () {
    return gulp.src('app/index.html')
        .pipe(vulcanize({
            abspath: '',
            inlineScripts: true
        }))
        .pipe(gulp.dest('dist'));
});