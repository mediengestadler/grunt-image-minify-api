module.exports = function(grunt) {
    grunt.registerMultiTask('minifier', 'Minifiy images', function() {
        var chalk   = require('chalk'),
            request = require('request'),
            fs      = require('fs'),

            done    = this.async(),

            _this   = this,
            _       = grunt.util._,
            cwd     = this.files[0].cwd || '',
            options = this.options({
                api_key: '',
                api_host: ''
            });

        if (options.apiKey === '') {
            return grunt.util.error('Your API key is not valid');
        }

        if (options.apiHost === '') {
            return grunt.util.error('Your API host is not valid');
        }

        var isDone = function (file) {
                // count array up or splice

                if (_.last(this.filesSrc) === file) {
                    done();
                }
            },
            onError = function (file, message) {
                var image = fs.createReadStream(file);
                var writable = fs.createWriteStream(_this.files.dest + file);

                image.pipe(writable, { end: false });

                image.on('end', function() {
                    writable.end();
                    isDone(file);
                });

                grunt.log.writeln(file + ': ' + message + ' - Original image was copied');
            };

        this.files.forEach(function (file) {
            var sendfile = cwd + file.src;

            // api
            request.post({
                url: options.api_host + '/minify',
                formData: {
                    api_key: options.api_key,
                    image: fs.createReadStream(sendfile)
                }
            }, function (err, httpResponse, res) {
                // conv json
                if (typeof(res) === 'string') {
                    res = JSON.parse(res);
                }

                // fail
                if (res.success === false) {
                    if (res.code === 403) {
                        // api key not valid
                        return grunt.log.writeln(res.message);
                    } else if (res.code === 404) {
                        // action not found
                        return grunt.log.writeln(res.message);
                    } else if (res.code === 500) {
                        //
                        onError(file, res.message);
                    } else {
                        // everything else
                        onError(file, res.message);
                    }

                    return;
                }

                // success
                var image = new Buffer(res.image, 'base64');

                fs.writeFile(file.dest, image, function () {
                    grunt.log.writeln(file.src + ': ' + chalk.cyan('saved ' + res.saving + '%'));
                    isDone(file);
                });
            });
        });
    });
};
