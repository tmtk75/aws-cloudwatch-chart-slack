var gulp = require('gulp');
var babel = require('gulp-babel');
var src_dir = './src/*.js'

gulp.task('default', ['compile', 'compile:watch'])
gulp.task('test',    ['mocha:env', 'mocha', 'mocha:watch'])
gulp.task('lint',    ['eslint', 'eslint:watch'])

/** */
gulp.task('compile', function () {
  gulp.src(src_dir)
    .pipe(babel())
    .pipe(gulp.dest('dist'));
});

gulp.task('compile:watch', function(){
  gulp.watch(src_dir, ['compile']);
});

/** */
gulp.task('minify', function() {
  var uglify= require('gulp-uglify');
  gulp.src(['./dist/**/*.js'])
    .pipe(uglify())
    .pipe(gulp.dest('./build'))
});

/** */
gulp.task('mocha', function() {
  var mocha = require('gulp-mocha');
  var gutil = require('gulp-util');
  gulp.src(['test/*.js'], {read: false})
    .pipe(mocha({reporter: 'list', require: ["babel-core/register"]}))
    .on('error', gutil.log);
});

gulp.task('mocha:watch', function() {
  gulp.watch(['src/**/*.js', 'test/**/*.js'], ['mocha']);
});

gulp.task('mocha:env', function () {
  var env = require('gulp-env');
  env({vars: {BABEL_ENV: "test"}})
});

/** */
gulp.task('eslint', function() {
  var eslint = require('gulp-eslint');
  gulp.src(["src/**/*.js", "test/**/*.js"])
    .pipe(eslint({useEslintrc: true}))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('eslint:watch', function() {
  gulp.watch(['src/**/*.js', "test/**/*.js"], ['lint']);
});

/** */
//gulp.task('typecheck', function() {
//  var flow = require("gulp-flowtype");
//  return gulp.src('./src/*.js')
//    .pipe(flow({
//        all: false,
//        weak: false,
//        declarations: './lib',
//        killFlow: true,
//        beep: true,
//        abort: false
//    }))
//});
