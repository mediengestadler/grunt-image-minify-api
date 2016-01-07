Image Minifier Grunt Task
==============

Image Minifier Grunt Task for https://github.com/ingowalther/image-minify-api

Taskaufruf
--------------

```
minifier: {
    options: {
        api_key: 'YOUR_API_KEY',
        api_host: 'YOUR_API_HOST'
    },
    build: {
        src: ['src/images/*.png', 'src/images/test/*.{jpg|png}'],
        dest: 'build/images'
    }
}
```

Grunt Demo
--------------

```
module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        minifier: {
            options: {
                api_key: 'YOUR_API_KEY',
                api_host: 'YOUR_API_HOST'
            },
            build: {
                cwd: 'images/foo/',
                src: ['bar/*.jpg', 'bar/**/*.jpg'],
                dest: 'dist/'
            }
        }
    });

    grunt.loadNpmTasks('grunt-image-minify-api');

    grunt.registerTask('default', ['minifier']);
};

```
