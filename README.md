!!!Readme under construction!!!
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
    example1: {
        src: ['src/images/*.png', 'src/images/test/*.{jpg,png}'],
        dest: 'build/images'
    },
    example2: {
        expand: true,
        cwd: 'images/foo/',
        src: ['bar/*.jpg', 'bar/**/*.jpg'],
        dest: 'compressed/'
    }
}
```
