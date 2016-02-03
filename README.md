Image Minifier Grunt Task
==============

Image Minifier Grunt Task for https://github.com/ingowalther/image-minify-api

Usage Examples
--------------

```
minifier: {
    options: {
        api_key: 'YOUR_API_KEY',
        api_host: 'YOUR_API_HOST'
    },
    eaxample1: {
        src: ['src/images/*.png', 'src/images/test/*.{jpg|png}'],
        dest: 'build/images'
    },
    eaxample2: {
        expand: true,
        cwd: 'images/foo/',
        src: ['bar/*.jpg', 'bar/**/*.jpg'],
        dest: 'compressed/'
    }
}
```
