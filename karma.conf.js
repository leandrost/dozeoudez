// Karma configuration
// Generated on Wed Oct 22 2014 16:21:00 GMT-0200 (BRST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai', 'sinon-chai'],


    // list of files / patterns to load in the browser
    files: [
      'www/lib/lodash/dist/lodash.js',
      'www/lib/es5-shim/es5-shim.js',
      'www/lib/momentjs/moment.js',
      'www/lib/moment-timezone/moment-timezone.js',
      'www/lib/pouchdb/dist/pouchdb-nightly.js',
      'www/lib/angular/angular.js',
      'www/lib/angular-animate/angular-animate.js',
      'www/lib/angular-cookies/angular-cookies.js',
      'www/lib/angular-mocks/angular-mocks.js',
      'www/lib/angular-sanitize/angular-sanitize.js',
      'www/lib/angular-routes/angular-route.js',
      'www/lib/angular-touch/angular-touch.js',
      'www/lib/angular-pouchdb/angular-pouchdb.js',
      'www/lib/angular-ui-router/release/angular-ui-router.js',
      'www/lib/ionic/js/ionic.js',
      'www/lib/ionic/js/ionic-angular.min.js',
      'www/js/modules.js',
      'www/js/app.js',
      'www/js/**/*.js',
      'test/**/*Spec.js'
    ],


    // list of files to exclude
    exclude: [
      '**/*.swp'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha'],

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
