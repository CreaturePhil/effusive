var gulp = require('gulp');
var concatCss = require('gulp-concat-css');
var minifyCss = require('gulp-minify-css');

gulp.task('default', function() {
  gulp.src(['public/css/bootstrap.min.css', 'public/css/font-awesome.min.css','public/css/custom.css'])
    .pipe(concatCss('main.min.css'))
    .pipe(minifyCss())
    .pipe(gulp.dest('public/css/'));
});

gulp.task('watch', function() {
  gulp.watch('public/css/custom.css', ['default']);
});
