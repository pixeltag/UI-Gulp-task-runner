const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const browserSync = require("browser-sync").create();
const include = require("gulp-file-include");
const replace = require("gulp-replace");
const del = require("del");
const cleanCSS = require("gulp-clean-css");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const imageminPngquant = require("imagemin-pngquant");
const imageminZopfli = require("imagemin-zopfli");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminGiflossy = require("imagemin-giflossy");
const debug = require("gulp-debug");

// compile scss to css

function style() {
  return gulp
    .src("./src/scss/**/*.scss")
    .pipe(sass())
    .pipe(
      cleanCSS({
        compatibility: "ie8",
        level: {
          1: {
            specialComments: 0,
            removeEmpty: true,
            removeQuotes: false,
            removeWhitespace: true,
          },
          2: {
            mergeMedia: true,
            removeEmpty: true,
            removeDuplicateFontRules: true,
            removeDuplicateMediaBlocks: true,
            removeDuplicateRules: true,
            removeQuotes: false,
            removeUnusedAtRules: false,
          },
        },
      })
    )
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(gulp.dest("./build/css"))
    .pipe(browserSync.stream());
}

function html() {
  return gulp
    .src("./src/html/**/*.html")
    .pipe(
      include({
        prefix: "@@",
        basepath: "@file",
      })
    )
    .pipe(replace(".css", ".min.css"))
    .pipe(gulp.dest("./build/"))
    .pipe(browserSync.stream());
}

function image() {
  return gulp
    .src("src/images/**/*")
    .pipe(
      imagemin([
        imageminGiflossy({
          optimizationLevel: 3,
          optimize: 3,
          lossy: 2,
        }),
        imageminPngquant({
          speed: 5,
        }),
        imageminZopfli({
          more: true,
        }),
        imageminMozjpeg({
          progressive: true,
          quality: 90,
        }),
        imagemin.svgo({
          plugins: [
            { removeViewBox: false },
            { removeUnusedNS: false },
            { removeUselessStrokeAndFill: false },
            { cleanupIDs: false },
            { removeComments: true },
            { removeEmptyAttrs: true },
            { removeEmptyText: true },
            { collapseGroups: true },
          ],
        }),
      ])
    )
    .pipe(gulp.dest("build/images/"))
    .pipe(
      debug({
        title: "Images",
      })
    )
    .on("end", browserSync.reload);
}

function font() {
  return gulp
    .src("./src/fonts")
    .pipe(gulp.dest("./build"))
    .pipe(
      debug({
        title: "Fonts",
      })
    );
}

function clean() {
  return del("./build/*");
}

function watch() {
  browserSync.init({
    server: {
      baseDir: "./build/",
      middleware: function (req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        next();
      },
    },
    port: 4000,
    notify: true,
  });
  gulp.watch("./src/scss/**/*.scss", style);
  gulp.watch("./src/images", image);
  gulp.watch("./src/fonts", font);
  gulp.watch("./src/html/**/*.html", html).on("change", browserSync.reload);
}

const dev = gulp.series(
  clean,
  gulp.parallel(style, html, image, font),
  gulp.parallel(watch)
);

exports.style = style;
exports.watch = watch;
exports.image = image;

exports.dev = dev;
