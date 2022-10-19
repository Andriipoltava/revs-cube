var gulp = require('gulp');


// SCRIPT
var uglify 			= require('gulp-uglify');

// SASS/CSS
var sass 			= require('gulp-sass');
var sourcemaps 		= require('gulp-sourcemaps');
var autoprefix 		= require('gulp-autoprefixer');
var concat 			= require('gulp-concat');
var cleanCSS        = require('gulp-clean-css');

// PROCESSERS
var plumber 		= require('gulp-plumber');
var watch 			= require('gulp-watch');
var sequencer 		= require('run-sequence');
var eslint          = require('gulp-eslint');
var duration        = require('gulp-duration')

// RENDERING
var browserSync 	= require('browser-sync').create();
var refresh      = require('gulp-refresh');

// LOADERS
var gulpLoadPlugins = require('gulp-load-plugins');
var plugins 		= gulpLoadPlugins();

// MISC
var mainBowerFiles  = require('gulp-main-bower-files');
var rename          = require('gulp-rename');
var gutil           = require('gulp-util');
var notify          = require("gulp-notify");

// SETTINGS

var site = 'http://localhost:8080';

var dirs = {
	src: 'app/',
	build: 'build/',
	js: 'js',
	css: 'css',
	sass: 'scss',
	images: 'img',
	fonts: 'fonts'
};

// Get main bower files
gulp.task('main-bower-files', function(done){
    return gulp.src('./bower.json')
        .pipe(mainBowerFiles({
            overrides: {
                "jquery" : {
                    ignore: true
                }
            }
        }))
        .pipe(duration('rebuilding bower files'))
        .pipe(gulp.dest(dirs.src + dirs.js + '/vendor/bower'));

    done();
});

// Concatenate and minify JavaScript
gulp.task('scripts', function(done) {
    gulp.src([
            dirs.src + dirs.js + '/vendor/**/*.js',
            dirs.src + dirs.js + '/app/*.js',
            dirs.src + dirs.js + '/modules/*.js'
        ])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write())
        .pipe(concat('main.min.js'))
        .pipe(uglify({preserveComments: 'some'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dirs.build + dirs.js))
        .pipe(duration('rebuilding scripts'))
        .pipe(refresh());


    done();
});

// Lint script to check complies with Cube3's script standards.
gulp.task('lint', function(done) {
    // ESLint ignores files with "node_modules" paths. 
    // So, it's best to have gulp ignore the directory as well. 
    // Also, Be sure to return the stream from the task; 
    // Otherwise, the task may end before the stream has finished. 
    return gulp.src([dirs.src + dirs.js + '/modules/*.js','!node_modules/**'])
        // eslint() attaches the lint output to the "eslint" property 
        // of the file object so it can be used by other modules. 
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console. 
        // Alternatively use eslint.formatEach() (see Docs). 
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on 
        // lint error, return the stream and pipe to failAfterError last. 
        .pipe(eslint.failAfterError());

    done();
});


// Compile and automatically prefix stylesheets
gulp.task('styles', function(done) {
    var onError = function(err) {
        notify.onError({
            title:    "Gulp",
            subtitle: "Sass comp failed",
            message:  "<%= error.message %>",
            sound:    "Beep"
        })(err);

        this.emit('end');
    };

    gulp.src(dirs.src + dirs.sass + '/*.scss')
        .pipe(plumber({errorHandler: onError}))
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefix({
            browsers: [
                'iOS 8',
                'iOS 9',
                'ie >= 11',
                'last 2 versions'
            ],
            cascade: false
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dirs.build + dirs.css))
        .pipe(cleanCSS({}))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(duration('rebuilding styles'))
        .pipe(gulp.dest(dirs.build + dirs.css))
        .pipe(refresh());

    done();
});

// Static Server + watching scss/html files
gulp.task('default', gulp.series('main-bower-files', 'styles', 'scripts', function(done) {

    browserSync.init({
        proxy: site,
        ghostMode: false,
        open: false
    });
    refresh.listen();

    gulp.watch(dirs.src + dirs.sass + '/**', gulp.series('styles')).on('change', browserSync.reload);
    gulp.watch(dirs.src + dirs.js + '/**/*.js', gulp.series('scripts')).on('change', browserSync.reload);

    done();

}));

// Build for Deployment
gulp.task('build', gulp.series('main-bower-files', 'styles', 'scripts', function(done) {

    done();

}));
