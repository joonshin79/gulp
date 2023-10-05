const gulp = require("gulp"),
	fileinclude = require("gulp-file-include"),
	concat = require("gulp-concat"),
	uglify = require("gulp-uglify"),
	rename = require("gulp-rename"),
	scss = require("gulp-sass")(require("sass")), // sass 호출
	sourcemaps = require("gulp-sourcemaps"), //sourcemaps 호출
	clean = require("gulp-clean"),
	browserSync = require("browser-sync").create(),
	resources = "src/resources",
	dest = "dest",
	src = {
		html: [
			"src/html/**/**/**/*.html",
			"src/html/**/**/*.html",
			"src/html/**/*.html",
			"src/html/*.html",
		],
		js: [`${resources}/js/*.js`, `${resources}/js/**/*.js`],
		css: [`${resources}/scss/index.scss`],
		scss: [`${resources}/scss/*.scss`, `${resources}/scss/**/*.scss`],
		imgs: [
			`${resources}/images/**`,
			`${resources}/images/**/**`,
			`${resources}/images/**/**/*`,
		],
		fonts: [
			`${resources}/fonts/**`,
			`${resources}/fonts/**/**`,
			`${resources}/fonts/**/**/*`,
		],
	},
	paths = {
		html: `${dest}/html`,
		js: `${dest}/js`,
		css: `${dest}/css`,
		imgs: `${dest}/images`,
		fonts: `${dest}/fonts`,
	},
	scssOptions = {
		/** * outputStyle (Type : String , Default : nested) * CSS의 컴파일 결과 코드스타일 지정 * Values : nested, expanded, compact, compressed */
		outputStyle: "expanded",

		/** * indentType (>= v3.0.0 , Type : String , Default : space) * 컴파일 된 CSS의 "들여쓰기" 의 타입 * Values : space , tab */
		indentType: "tab",

		/** * indentWidth (>= v3.0.0, Type : Integer , Default : 2) * 컴파일 된 CSS의 "들여쓰기" 의 갯수 */
		indentWidth: 1,

		/** * outputStyle 이 nested, expanded 인 경우에 사용 /** * precision (Type : Integer , Default : 5) * 컴파일 된 CSS 의 소수점 자리수. */
		precision: 6,

		/** * sourceComments (Type : Boolean , Default : false) * 컴파일 된 CSS 에 원본소스의 위치와 줄수 주석표시. */
		sourceComments: true,
	};

const clear = () => {
	return gulp.src(`${dest}/*`, { read: false, allowEmpty: true }).pipe(clean());
};

const htmlComplie = () => {
	return gulp
		.src(src.html)
		.pipe(
			fileinclude({
				prefix: "@@",
				basepath: "@file",
			})
		)
		.pipe(gulp.dest(paths.html))
		.pipe(browserSync.reload({ stream: true }));
};

const scssCompile = () => {
	return (
		gulp
			.src(src.css)

			// 소스맵 초기화(소스맵을 생성)
			.pipe(sourcemaps.init())

			// SCSS 함수에 옵션갑을 설정, SCSS 작성시 watch 가 멈추지 않도록 logError 를 설정
			.pipe(scss(scssOptions).on("error", scss.logError))

			// 위에서 생성한 소스맵을 사용한다.
			.pipe(sourcemaps.write())

			// 목적지(destination)을 설정
			.pipe(gulp.dest(paths.css))

			//browserSync 로 브라우저에 반영;
			.pipe(browserSync.reload({ stream: true }))
	);
};

const concatJs = () => {
	return gulp
		.src(src.js)
		.pipe(concat("ui.js"))
		.pipe(gulp.dest(paths.js))
		.pipe(uglify())
		.pipe(rename("ui.min.js"))
		.pipe(gulp.dest(paths.js))
		.pipe(browserSync.reload({ stream: true }));
};

const imgs = () => {
	return gulp
		.src(src.imgs)
		.pipe(gulp.dest(paths.imgs))
		.pipe(browserSync.reload({ stream: true }));
};

const fonts = () => {
	return gulp
		.src(src.fonts)
		.pipe(gulp.dest(paths.fonts))
		.pipe(browserSync.reload({ stream: true }));
};

const watchFiles = () => {
	gulp.watch(src.html).on("change", htmlComplie);
	gulp.watch(src.css, scssCompile);
	gulp.watch(src.js, concatJs);
	gulp.watch(src.imgs, imgs);
};

const brwSync = () => {
	browserSync.init({
		browser: ["google chrome"],
		port: 8080,
		server: {
			baseDir: `${dest}/`,
		},
	});
};

const isCompile = [htmlComplie, scssCompile, concatJs, imgs, fonts];

gulp.task("build", gulp.series(clear, gulp.parallel(isCompile)));
gulp.task(
	"dev",
	gulp.series(clear, gulp.parallel(isCompile, brwSync), watchFiles)
);
