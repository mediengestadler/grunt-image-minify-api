'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        eslint: {
            options: {
                configFile: '.eslintrc',
            },
            build: [
                'Gruntfile.js',
                'tasks/*.js'
            ]
        }
    });

    grunt.loadNpmTasks('grunt-eslint');

    grunt.registerTask('default', [
        'eslint'
    ]);
};
