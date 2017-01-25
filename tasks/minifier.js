'use strict';

module.exports = function (grunt) {
    const chalk   = require('chalk');
    const request = require('request');
    const path    = require('path');
    const fs      = require('fs');

    class Minifier {
        /*
         Set options and start with first stack
         */
        constructor (data, options, async) {
            this.data    = data;
            this.options = options
            this.async   = async;

            if (this.options.api_key === '') {
                return grunt.util.error('Es wurde kein valider API Key angegeben!');
            }

            if (this.options.api_host === '') {
                return grunt.util.error('Es wurde kein valider API Host angegeben!');
            }

            if (isNaN(this.options.per_stack)) {
                return grunt.util.error('Es wurde keine numerische Angabe bei der Stapelverarbeitung gemacht!');
            }

            const files = this.getFileData();
            this.getCurrentStack(files);
        }

        /*
         Get file data for stack
         */
        getFileData () {
            const files = [];

            this.data.files.forEach((filePair) => {
                const isExpandedPair = filePair.orig.expand || false;

                filePair.src.forEach((file) => {
                    file = this._unixifyPath(file);
                    let dest = this._unixifyPath(filePair.dest);

                    if (this._detectDestType(dest) === 'directory') {
                        dest = isExpandedPair ? dest : path.join(dest, file);
                    }

                    files.push({
                        file: file,
                        destination: dest
                    });
                });
            });

            return files;
        }

        /*
         Check if windows to replace slashes with backslashes
         */
        _unixifyPath (filepath) {
            if (process.platform === 'win32') {
                return filepath.replace(/\\/g, '/');
            }

            return filepath;
        }

        /*
         Check if destination is a directory or file
         */
        _detectDestType (destination) {
            if (grunt.util._.endsWith(destination, '/')) {
                return 'directory';
            }

            return 'file';
        }

        /*
         Make stacks and iterate
         */
        getCurrentStack (files) {
            return new Promise((resolve) => {
                let counter = 0;
                const stack = [];

                while (counter++ < this.options.per_stack) {
                    const file = files.pop();

                    if (typeof(file) === 'object') {
                        stack.push(file);
                    }
                }

                resolve({
                    stack,
                    files
                });
            }).then((data) => {
                this.startProcessing(data.stack).then(() => {
                    if (data.files.length) {
                        this.getCurrentStack(data.files);
                    } else {
                        this.async();
                    }
                });
            });
        }

        /*
         Make requests for current stack
         */
        startProcessing (stack) {
            return new Promise((resolve) => {
                let counter = 1;

                stack.forEach((data) => {
                    this.makeRequest(data).then((result) => {
                        let fn;
                        counter++;

                        if (result.success && result.success !== false) {
                            fn = this.onSuccess(result);
                        } else {
                            fn = this.onError(result);
                        }

                        fn.then(() => {
                            if (counter > stack.length) {
                                resolve();
                            }
                        });
                    });
                });
            });
        }

        /*
         Http request
         */
        makeRequest (data) {
            return new Promise((resolve) => {
                request.post({
                    url: this.options.api_host + '/minify',
                    formData: {
                        api_key: this.options.api_key,
                        image: fs.createReadStream(data.file)
                    }
                }, (err, httpResponse, body) => {
                    if (!err) {
                        if (typeof(body) === 'string') {
                            body = JSON.parse(body);
                        }

                        data = grunt.util._.extend(data, body);

                        resolve(data);

                        return;
                    }

                    grunt.log.writeln(chalk.red(`Bei der Anfrage an den Server ist ein Fehler aufgetreten!`));
                });
            });
        }

        onSuccess (data) {
            return new Promise((resolve) => {
                if (data.file !== undefined) {
                    const image = new Buffer(data.file, 'base64');

                    grunt.file.mkdir(path.dirname(data.destination));

                    fs.writeFile(data.destination, data.image, () => {
                        this.makeMessage(
                            data.file,
                            chalk.cyan(`${data.saving}% eingespart`)
                        );

                        resolve();
                    });

                    return;
                }

                this.saveOriginal(data).then(() => {
                    resolve();
                });

                this.makeMessage(
                    data.file,
                    chalk.red('Originalbild wurde kopiert, da Komprimierung nicht möglich war')
                );
            });
        }

        onError (data) {
            return new Promise((resolve) => {
                let message;

                this.saveOriginal(data).then(() => {
                    resolve();
                });

                switch (data.code) {
                case '403':
                    message = 'Es wurde kein valider API Key angegeben!';
                    break;
                case '404':
                    message = 'Aktion wurde nicht gefunden!';
                    break;
                default:
                    message = 'Originalbild wurde kopiert, da Komprimierung nicht möglich war!';
                    break;
                }

                this.makeMessage(
                    data.file,
                    chalk.red(message)
                );
            });
        }

        /*
         If no optimized image generated, save original
         */
        saveOriginal (data) {
            return new Promise((resolve) => {
                fs.createReadStream(data.file).pipe(fs.createWriteStream(data.destination).on('finish', function () {
                    resolve();
                }));
            });
        }

        /*
         Outputs message
         */
        makeMessage (file, message) {
            grunt.log.writeln(`${file}: ${message}`);
        }
    };

    /*
     Register Minify Task
    */
    grunt.registerMultiTask('minifier', 'Minifiy images', function () {
        return new Minifier(
            {
                files: this.files,
                filesSrc: this.filesSrc
            },
            this.options({
                api_key: '',
                api_host: '',
                per_stack: 10
            }),
            this.async()
        );
    });
};
