var gulp = require('gulp');
var concat = require("gulp-concat");
var gulpif = require('gulp-if');
var postcss = require('gulp-postcss');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var stylus = require('gulp-stylus');
var uglify = require('gulp-uglify');

var axis = require('axis');
var cssnano = require('cssnano');
var koutoSwiss = require('kouto-swiss');
var lost = require('lost');
var utils = require('postcss-utilities');
var rucksack = require('rucksack-css');
var rupture = require('rupture');
var runSequence = require('run-sequence');


/**
 * Project Configuration
 * =====================
 */

var prod = false,
    basePath = 'src',
    vendorPath = basePath + '/_vendor',
    jsplugins = [
      vendorPath + '/jquery/dist/jquery.js',
    ];

/**
 * --- Compile jade template ---
 * Compile from templates to (Hugo's) layouts.
**/
// gulp.task('jade', function() {
//   return gulp.src(basePath + '/templates/**/*.jade')
//     .pipe(jade({ // pip to jade plugin
//       pretty:true
//     }))
//
//     .pipe(gulp.dest('layouts/jade')); // tell gulp our output folder
// });




/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
**/
gulp.task('styl', function () {
  var processors = [
    lost,
    rucksack({
      autoprefixer: true
    })
  ];

  return gulp.src(basePath + '/styl/app.styl')
    .on('error', function (err) {
      console.error('Error!', err.message);
    })

    .pipe(plumber())
    .pipe(stylus({
      'include css': true,
      use: [rupture(), axis(), koutoSwiss()]
    }))

    .pipe(postcss(processors))
    .pipe(gulp.dest('static/css'))
    .pipe(sourcemaps.write())
});

/**
 * Use 'sass' to compile bootstrap's sass files
 */
// gulp.task('sass', function () {
//   return gulp.src(basePath + '/sass/**/*.scss')
//     .pipe(sass().on('error', sass.logError))
//     .pipe(gulp.dest('static/css'))
// });

/**
* Concat compress js
*/
gulp.task('js', function() {
  return gulp.src(basePath + '/js/**/*.js')
    .pipe(gulpif(prod, uglify({
      preserveComments: 'some'
    })))
    .pipe(concat('script.js'))
    .pipe(gulp.dest('static/js'));
});


/**
* Concat compress js
*/
gulp.task('js:vendor', function() {
  return gulp.src(jsplugins)
    .pipe(uglify())
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(basePath + '/js'));
});


/**
 * Watch styl and js files for changes & recompile
 * Watch img files for changes & recompile
 */
gulp.task('watch', function () {
  gulp.watch(basePath + '/js/**/*.js', ['js']);
  gulp.watch(basePath + '/styl/**/*.styl', ['styl']);
  //gulp.watch(basePath + '/sass/**/*.scss', ['sass']);
  gulp.watch(basePath + '/templates/**/*.jade', ['jade']);
  gulp.watch(basePath + '/img/**/*');
});

/**
 * Default task, running just `gulp` will compile the sass,
 */
gulp.task('default', ['watch']);


/**
* Gulp Prod
* =========
* Prod
*/

gulp.task('prod', function() {
  prod = true;
  runSequence('styl', 'js', 'js:vendor')
});
