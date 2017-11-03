const gulp = require('gulp');
const ts = require('gulp-typescript');
const bs = require('browser-sync').create();
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const spawn = require('child_process').spawn;

gulp.task('browser-sync', function() {
	bs.init({
		server: {
			baseDir: "./"
		}
	})
});

gulp.task("watch", ['browser-sync', "handle-webpack"], function() {
	gulp.watch(["./scripts/**/*.ts"], ["handle-webpack"]);
	gulp.watch(["./styles/**/*.scss"], ['sass']);
	gulp.watch(["./*.html", "./*.css", "./**/*.js"])
		.on("change", bs.reload);
})

gulp.task('sass', () => {
	return gulp.src('./styles/index.scss')
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./'));
});



gulp.task('build', ["handle-webpack"] )


gulp.task("handle-webpack", function() {
	console.log("Running webpack");
	handleWebpack();
})

function handleWebpack() {
	const cmd = spawn('webpack', {
		stdio: 'inherit',
		cwd: "./"
	});

	cmd.on('close', (a) => {
		console.log("Webpack is done!");
	})

	cmd.on('error', (err) => {
		console.log("ERRRROR", err);
	})
}