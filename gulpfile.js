var gulp = require('gulp');
    livereload = require('gulp-livereload');
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename');
    jshint = require('gulp-jshint');
    uglify = require('gulp-uglify');
    concat = require('gulp-concat');
    rimraf = require('gulp-rimraf');
    ngAnnotate = require('gulp-ng-annotate');
    htmlify = require('gulp-angular-htmlify');
    mainBowerFiles = require('main-bower-files');
    gulpFilter = require('gulp-filter');
    useref = require('gulp-useref');

var paths = {
  dev: {
    css: 'app/public/css',
    html: 'app/public/**/*.html',
    sass: 'app/public/scss/*.scss',
    js: 'app/public/js/**/*.js',
    bower: 'app/bower_components/**',
    directiveTemplates: 'app/public/js/directives/templates/*.html'
  },
  build: {
    main: 'dist/',
    css: 'dist/public/css',
    js: 'dist/public/js'
  }
};

var jsFilter = gulpFilter('*.js');

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(paths.dev.html).on('change', livereload.changed);
  gulp.watch(paths.dev.directiveTemplates).on('change', livereload.changed);
  gulp.watch(paths.dev.sass, ['styles']).on('change', livereload.changed);
  gulp.watch(paths.dev.js, ['lint']).on('change', livereload.changed);
});

gulp.task('styles', function() {
  return gulp.src(paths.dev.sass)
    .pipe(sass({ style: 'expanded', errLogToConsole: true }))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
    .pipe(concat('main.css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('app/public/css'));
});

gulp.task('lint', function() {
  return gulp.src([paths.dev.js, '!./app/public/bower_components/**'])
  .pipe(jshint()).on('error', errorHandler)
  .pipe(jshint.reporter('jshint-stylish'))
  .pipe(jshint.reporter('fail'));
});

gulp.task('build', ['bower-files', 'copy-css', 'copy-server', 'copy-html-files'], function() {
    return gulp.src(['./app/public/js/**/*.js', '!./app/public/bower_components/**'])
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(concat('app.min.js'))
    .pipe(gulp.dest(paths.build.js))
});

gulp.task('empty-dist', function() {
  return gulp.src(paths.build.main, { read: false })
    .pipe(rimraf());
});

gulp.task('copy-css', ['empty-dist'], function () {
  return gulp.src('./app/public/css/*.css')
    .pipe(gulp.dest('dist/public/css'));
});

gulp.task('copy-html-files', ['empty-dist'], function () {
  var assets = useref.assets();

  return gulp.src('./app/public/**/*.html')
    .pipe(assets)
    .pipe(htmlify())
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(gulp.dest('dist/public'));
});

gulp.task('copy-server', ['empty-dist'], function () {
  return gulp.src('./app/server.js')
  .pipe(gulp.dest('dist/'));
})

gulp.task("bower-files", ['empty-dist'], function(){
  return gulp.src(mainBowerFiles())
    .pipe(jsFilter)
    .pipe(uglify())
    .pipe(concat('vendor.min.js'))
    .pipe(gulp.dest("dist/public/js"));
});

function errorHandler (error) {
  this.emit('end');
}