'use strict'

var gulp        = require('gulp')
  , purescript  = require('gulp-purescript')
  , run         = require('gulp-run')
  , runSequence = require('run-sequence')
  ;

var paths = {
    src: 'src/**/*.purs',
    bowerSrc: [
      'bower_components/purescript-*/src/**/*.purs',
      'bower_components/purescript-*/src/**/*.purs.hs'
    ],
    dest: '',
    docs: {
        'Data.Machine': {
            dest: 'src/Data/README.md',
            src: 'src/Data/Machine/Mealy.purs'
        },
        'Data.Machine.*': {
            dest: 'src/Data/Machine/README.md',
            src: 'src/Data/Machine/*.purs'
        }
    }
};

var options = {
    test: {
        main: 'Test.Data.Machine',
        output: 'test/test.js'
    }
};

function compile (compiler, src, opts) {
    var psc = compiler(opts);
    psc.on('error', function(e) {
        console.error(e.message);
        psc.end();
    });
    return gulp.src(src.concat(paths.bowerSrc))
        .pipe(psc)
        .pipe(gulp.dest(paths.dest));
};

function docs (target) {
    return function() {
        var docgen = purescript.docgen();
        docgen.on('error', function(e) {
            console.error(e.message);
            docgen.end();
        });
        return gulp.src(paths.docs[target].src)
            .pipe(docgen)
            .pipe(gulp.dest(paths.docs[target].dest));
    }
}

function sequence () {
    var args = [].slice.apply(arguments);
    return function() {
        runSequence.apply(null, args);
    }
}

gulp.task('browser', function() {
    return compile(purescript.psc, [paths.src].concat(paths.bowerSrc), {})
});

gulp.task('make', function() {
    return compile(purescript.pscMake, [paths.src].concat(paths.bowerSrc), {})
});

gulp.task('test', function() {
    return compile(purescript.psc, [paths.src, paths.test].concat(paths.bowerSrc), options.test)
        .pipe(run('node').exec());
});

gulp.task('docs', docs('Data.Machine.*'));

gulp.task('watch-browser', function() {
    gulp.watch(paths.src, sequence('browser', 'docs'));
});

gulp.task('watch-make', function() {
    gulp.watch(paths.src, sequence('make', 'docs'));
});

gulp.task('default', sequence('make', 'docs'));
