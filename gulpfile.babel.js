import gulp from 'gulp';
import sass from 'gulp-sass';
import babel from 'gulp-babel';
import autoprefixer from 'gulp-autoprefixer';
import livereload from 'gulp-livereload';
import sourcemaps from 'gulp-sourcemaps';
import plumber from 'gulp-plumber';
import testem from 'gulp-testem';
import http from 'http';
import del from 'del';

const paths = {
  js: ['src/**/*.js', 'spec/**/*.js'],
  sass: 'style/**/*.scss',
  dev: '.tmp',
  dist: 'lib'
};

gulp.task('default', ['compile:js', 'compile:sass', 'watch'], () => {});

gulp.task('watch', () => {
  livereload.listen();
  gulp.watch(paths.js, ['compile:js']);
  gulp.watch(paths.sass, ['compile:sass']);
});

gulp.task('clean', (callback) => {
  return del([paths.dev], callback);
});

gulp.task('test', ['coverage'], () => {
  gulp.src([''])
    .pipe(testem({
      configFile: 'testem.json'
    })
  );
});

gulp.task('compile:js', () => {
  return gulp.src(paths.js)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(babel({modules: 'commonStrict', comments: true}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.dev))
    .pipe(livereload());
});

gulp.task('compile:sass', () => {
  return gulp.src(paths.sass)
    .pipe(sourcemaps.init())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dev))
    .pipe(livereload());
});

gulp.task('coverage', () => {
    const coverageServer = http.createServer((req, resp) => {
        req.pipe(fs.createWriteStream('coverage.json'))
        resp.end()
    });
    const port = 7358;
    coverageServer.listen(port);
    console.log("Coverage Server Started on port", port);
});
