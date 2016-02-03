Image Minifier Grunt Task
==============

Image Minifier Grunt Task for https://github.com/ingowalther/image-minify-api

Example
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
