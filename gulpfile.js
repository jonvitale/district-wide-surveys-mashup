const gulp = require('gulp')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const browserify = require('browserify')
const babelify = require('babelify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const uglify = require('gulp-uglify')
const stringify = require('stringify')
const rename = require('gulp-rename')
const zip = require('gulp-zip')
const concatCss = require('gulp-concat-css');
const sourcemaps = require('gulp-sourcemaps');
const project = 'district-wide-surveys';
const extensionpath = 'C:\\Users\\jvitale\\Documents\\Qlik\\Sense\\Extensions';
const base = '';

gulp.task('qext', function(){
    gulp.src('./src/project.qext')
    .pipe(rename(`${project}.qext`))
    .pipe(gulp.dest(`./${project}`))
    .pipe(gulp.dest(extensionpath + `/${project}`))
})

gulp.task('html', function(){
    gulp.src(['./src/index.html', './src/app/*.html'])
    .pipe(gulp.dest(`./${project}`))
    .pipe(gulp.dest(extensionpath + `/${project}`))
})

gulp.task('style', function(){
    gulp.src(['./src/app/**/*.scss', './src/*.css'])
    .pipe(sass())
    //.pipe(sass({ outputStyle: 'compressed'}))
    //.pipe(autoprefixer())
    .pipe(concatCss('styles.css', {rebaseUrls:false}))
    .pipe(gulp.dest(`./${project}/css`))
    .pipe(gulp.dest(extensionpath + `/${project}/css`))
})

gulp.task('js', function(){
    browserify({
        entries: './src/app/main.js',
        debug: true
    })
    .transform('babelify', { presets: ['es2015'] })
    .transform(stringify, { appliesTo: { includeExtensions: ['.html'] } })
    .bundle()
    .pipe(source('config.js'))
    .pipe(buffer())
    //.pipe(uglify())
    .pipe(gulp.dest(`./${project}/app`))
    .pipe(gulp.dest(extensionpath + `/${project}/app`))
})

gulp.task('assets', function(){
    gulp.src('./src/img/**')
    .pipe(gulp.dest(`./${project}/img`))
    .pipe(gulp.dest(extensionpath + `/${project}/img`))
})

gulp.task('zip', ['qext','html','style','js','assets'], () =>
gulp.src(`./${project}/**`)
    .pipe(zip(`${project}.zip`))
    .pipe(gulp.dest('./'))
);

gulp.task('watch', function(){
    gulp.watch('./src/app/**/*.js', ['js'])
    gulp.watch('./src/app/**/*.scss', ['style'])
    gulp.watch(['./src/index.html'], ['html'])
    gulp.watch('./src/app/**/*.html', ['js'])
})

gulp.task('default', ['qext', 'html', 'style', 'js', 'assets'])
