module.exports = function(grunt) {
    grunt.registerMultiTask('minifier', function() {
        var _this = this,
            done    = this.async(),
            request = require('request'),
            fs      = require('fs'),
            _       = grunt.util._,
            path    = require('path'),
            files   = this.filesSrc,
            options = this.options({
                api_key: '',
                api_host: 'http://image-minify.kundenlabor.de'
            });

        if (options.apiKey === '') {
            return grunt.util.error('Your API key is not valid');
        }

        if (options.apiHost === '') {
            return grunt.util.error('Your API host is not valid');
        }

        var isDone = function (file) {
                if (_.last(files) === file) {
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

        _.each(files, function (file) {
            // api
            request.post({
                url: options.api_host + '/minify',
                formData: {
                    api_key: options.api_key,
                    image: fs.createReadStream(file)
                }
            }, function (err, httpResponse, res) {
                res = JSON.parse(res);

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
                var image    = new Buffer(res.image, 'base64'),
                    filepath = _this.files[0].dest,
                    filename = path.basename(file);

                grunt.file.mkdir(filepath);

                fs.writeFile(filepath + '/' + filename, image, function () {
                    grunt.log.writeln(file + ':  saved ' + res.saving + '%');
                    isDone(file);
                });
            });
        });
    });
};