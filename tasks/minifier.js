module.exports = function(grunt) {
    grunt.registerMultiTask('minifier', 'Minifiy images', function() {
        var chalk = require('chalk'),
            request = require('request'),
            path = require('path'),
            fs = require('fs'),
            done = this.async(),
            _this = this,
            max = this.filesSrc.length,
            current = 0,
            cwd = this.files[0].cwd || '',
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
                current++;

                if (max === current) {
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
            },
            unixifyPath = function(filepath) {
                if (process.platform === 'win32') {
                    return filepath.replace(/\\/g, '/');
                } else {
                    return filepath;
                }
            },
            detectDestType = function(dest) {
                if (grunt.util._.endsWith(dest, '/')) {
                    return 'directory';
                } else {
                    return 'file';
                }
            };


        this.files.forEach(function (filePair) {
            var isExpandedPair = filePair.orig.expand || false;

            filePair.src.forEach(function(file) {
                file = unixifyPath(file);
                var dest = unixifyPath(filePair.dest);

                if (detectDestType(dest) === 'directory') {
                  dest = isExpandedPair ? dest : path.join(dest, file);
                }

                // api
                request.post({
                    url: options.api_host + '/minify',
                    formData: {
                        api_key: options.api_key,
                        image: fs.createReadStream(file)
                    }
                }, function (err, httpResponse, res) {

                    // conv json
                    if (typeof(res) === 'string') {
                        res = JSON.parse(res);
                    }

                    // fail
                    if (res.success && res.success === false) {
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

                    grunt.file.mkdir(path.dirname(dest));

                    fs.writeFile(dest, image, function () {
                        grunt.log.writeln(file + ': ' + chalk.cyan('saved ' + res.saving + '%'));
                        isDone(file);
                    });
                });
            });
        });
    });
};
