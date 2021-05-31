/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */

 
module.exports = grunt => {
    const xml2Js = require('xml2js');
    const fs = require('fs');

    var args = process.argv.slice(2),
        isDebugging = !!args.find(arg => arg === '--debug'),
        isEmulating = !!args.find(arg => arg === '--emulate') && isDebugging,
        isInitBuild = !!args.find(arg => arg === '--initbuild') && !isDebugging,
        isBuild = !!args.find(arg => arg === '--build') && (!isInitBuild || isDebugging),
        isDist = !!args.find(arg => arg === '--dist') && (!isInitBuild && !isDebugging && !isEmulating),

        findAppName = () => {
            var folderArg = args.find(arg => arg.search('app') > 0),
                arrayFolder = folderArg ? folderArg.split("=") : '';

            if(arrayFolder && arrayFolder.length === 2) {
                return arrayFolder[1];
            };

            return false;
        },

        appName = findAppName(),

        appsFolder = 'apps',
        appFolder = appsFolder + '/' + appName,
        distFolder = 'dist',
        getSourceFolder = function ( ) {
            if ( isBuild ) {
                return appFolder;
            }
            return 'src';
        },
        sourceFolder = getSourceFolder( ),
        getDestinationFolder = function ( ) {
            if ( isDebugging ) {
                return 'public';
            }
            if ( isInitBuild ) {
                return appFolder;
            }
            return distFolder + '/' + appName;
        },
        destFolder = getDestinationFolder(),
        buildInfo = {
            externalLibs: {
                js: [],
                css: [],
                extra: []
            }
        },
        validateApp = function ( ) {
            if ( !appName ) {
                throw 'Error: Incorrect argument name. Please use "grunt --app=applicationName"';
            }
            if ( !grunt.file.isDir( appFolder ) ) {
                throw 'Error: Can not find subfolder ' + appName + ' in folder ' + appsFolder;
            }
            if ( !isBuild && !grunt.file.isFile( sourceFolder + '/build_template.pug' ) ) {
                throw 'Error: Cannot find build_template.pug in ' + sourceFolder;
            }
            try {
                grunt.file.readJSON( sourceFolder + '/appInfo.json' );
            } catch ( e ) {
                throw 'Error: Invalid appInfo.json in ' + sourceFolder;
            }
            try {
                if (!isBuild) {
                    buildInfo = grunt.file.readJSON( sourceFolder + '/buildInfo.json' );
                }
            } catch ( e ) {
                throw 'Error: Invalid buildInfo.json in ' + sourceFolder;
            }
        };

    validateApp(),

    findAppVersion = () =>{
            try {
                verJson = grunt.file.readJSON( sourceFolder + '/appInfo.json' );
                grunt.log.write(verJson.version).ok();

                //could be 0.9.8.1 but only want 3 numbers
                verNumberTemp = verJson.version;
                finalVerNum = "";

                verNumberTempArr = verNumberTemp ? verNumberTemp.split(".") : '';
                if(verNumberTempArr && verNumberTempArr.length > 3){

                    for(var i = 0; i < verNumberTempArr.length-1; i++) {
                        finalVerNum += verNumberTempArr[i];
                        if(i < 2){
                            finalVerNum += ".";
                        }
                    }
                    return finalVerNum;
                };

                return verJson.version;

            } catch ( e ) {
                throw 'findAppVersion: Error: Invalid appInfo.json in ' + sourceFolder;
                return '0.0.0';
            }
        },
    appVersion = findAppVersion(),
    fullAppName = appName + '_' + appVersion;

    createAppuiDir = () =>{
        if(grunt.file.isDir(destFolder + '/appui') == false){
            grunt.file.mkdir(destFolder + '/appui');
            grunt.log.write('Creating appui directory!');
        }
        else
        {
            grunt.log.write('appui directory already exists!');
        }
        grunt.file.write(destFolder + '/appui/manifest', 'version: ' + appVersion + '\napptype: scheduling');
    }

    grunt.initConfig({
        clean:{
                cleanDest: [destFolder],
                cleanDist: [distFolder],
                cleanTranslation: ['vendor/crestron/translations/translations/.svn'],
                cleanIntermediatesFromDist: {
                    //Uncomment and run with --verbose option to print the files that would be deleted without actually deleting anything
                    //options: {
                    //  'no-write': true
                    //},
                    src: [ distFolder + '/*.ini', distFolder + '/*.vtz' ]
                  },
                cleanOriginalJS: [destFolder + '/app.js'],
                cleanOriginalCSS: [
                        destFolder + '/splash.css',
                        destFolder + '/dark-theme.css', 
                        destFolder + '/light-theme.css', 
                        destFolder + '/impair-theme.css', 
                        destFolder + '/horizontal.css', 
                        destFolder + '/vertical.css',
                        destFolder + '/portrait.css',
                        destFolder + '/custom.css'
                ]
        },
        uglify: {
            my_target: {
                files: [{
                    //TODO later on we need to have only one file
                    src: destFolder + '/app.js',
                    dest: destFolder + '/app.min.js'
                }]
            }
        },
        cssmin: {
            target: {
                files: [{
                    src: destFolder + '/splash.css',
                    dest: destFolder + '/splash.min.css'
                },{
                    src: destFolder + '/horizontal.css',
                    dest: destFolder + '/horizontal.min.css'
                }, {
                    src: destFolder + '/vertical.css',
                    dest: destFolder + '/vertical.min.css'
                }, {
                    src: destFolder + '/portrait.css',
                    dest: destFolder + '/portrait.min.css'
                }, {
                    src: destFolder + '/dark-theme.css',
                    dest: destFolder + '/dark-theme.min.css'
                }, {
                    src: destFolder + '/light-theme.css',
                    dest: destFolder + '/light-theme.min.css'
                }, {
                    src: destFolder + '/impair-theme.css',
                    dest: destFolder + '/impair-theme.min.css'
                }, {
                    src: destFolder + '/custom.css',
                    dest: destFolder + '/custom.min.css'
                }]
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    processScripts: ['text/ng-template']
                },
                files: [{
                    src: destFolder + '/index.html',
                    dest: destFolder + '/index.html'
                }]
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [sourceFolder + '/js/module.js', 'src/js/**/*.js'],
                dest: destFolder + '/app.js'
            }
        },
        sass: {
            dist: {
                files: [{
                    src: sourceFolder + '/scss/splash.scss',
                    dest: destFolder + '/splash.css'
                }, {
                    src: sourceFolder + '/scss/dark-theme.scss',
                    dest: destFolder + '/dark-theme.css'
                }, {
                    src: sourceFolder + '/scss/light-theme.scss',
                    dest: destFolder + '/light-theme.css'
                }, {
                    src: sourceFolder + '/scss/impair-theme.scss',
                    dest: destFolder + '/impair-theme.css'
                },{
                    src: sourceFolder + '/scss/horizontal.scss',
                    dest: destFolder + '/horizontal.css'
                },{
                    src: sourceFolder + '/scss/vertical.scss',
                    dest: destFolder + '/vertical.css'
                },{
                    src: sourceFolder + '/scss/portrait.scss',
                    dest: destFolder + '/portrait.css'
                }, {
                    src: sourceFolder + '/scss/custom.scss',
                    dest: destFolder + '/custom.css'
                }]
            }
        },
        watch: {
            set1: {
                files: [sourceFolder + '/js/**/*.js'],
                tasks: ['jshint','concat', 'if:debugJs']
            },
            set2: {
				files: [sourceFolder + '/scss/**/*.scss'],
				tasks: ['sass', 'if:debugCss']
			},
            set3: {
                files: [sourceFolder + '/views/**/*.html'],
                tasks: ['pug', 'if:debugHtml']
            },
            set4: {
                files: [sourceFolder + '/buildInfo.json'],
                tasks: ['copy']
            },
            set5: {
                files: ['vendor/**/**'],
                tasks: ['copy']
            }
        },
        pug: {
            compile: {
                options: {
                    pretty: true,
                    data: {
                        debug: isDebugging,
                        emulate: isEmulating,
                        libCSS: buildInfo.externalLibs.css,
                        libJS: buildInfo.externalLibs.js,
                        angular_templates: grunt.file.expand(sourceFolder + '/views/**/**/*.html').map(path => ({
                            src: 'views/' + path.split('/').slice(2).join('/'),
                            content: grunt.file.read(path).trim()
                        })),
                        emulateJs: isEmulating && buildInfo.externalLibs.emulate ? buildInfo.externalLibs.emulate : []
                    }
                },
                files: [{
                    src: sourceFolder + '/build_template.pug',
                    dest: destFolder + '/index.html'
                }]
            }
        },
        if: {
            minify: {
                options: { test: ( ) => (isDebugging || isInitBuild) }, ifFalse: ['htmlmin', 'cssmin', 'uglify']
            },
            ootbBuild: {
                options: { test: ( ) => (isDist) }, ifTrue: ['makeAppui']
            },
            buildfinal: {
                options: { test: ( ) => (isDist) }, ifTrue: ['copy:renameZipToVTZ', 'makeIni', 'compress:ootbPackage', 'copy:moveOOTBtoBuild', 'clean:cleanIntermediatesFromDist']
            },
            debugHtml: {
                options: { test: ( ) => (isDebugging || isInitBuild) }, ifFalse: ['htmlmin']
            },
            debugCss: {
                options: { test: ( ) => (isDebugging || isInitBuild) }, ifFalse: ['cssmin', 'clean:cleanOriginalCSS']
            },
            debugJs: {
                options: { test: ( ) => (isDebugging || isInitBuild) }, ifFalse: ['uglify', 'clean:cleanOriginalJS']
            },
            archiveApp: {
                options: { test: ( ) => isDebugging || isInitBuild }, ifFalse: ['compress:main']
            },
            buildHtml: {
                options: { test: ( ) => isBuild }, ifFalse: ['pug']
            },
            copyFiles: {
                options: { test: ( ) => isBuild }, ifTrue: ['copy:copyFiles'], ifFalse: ['copy:main']
            },
            emulate: {
                options: { test: (  ) => isEmulating}, ifTrue: ['copy:vendorJS']
            }
        },
        copy: {
            renameZipToVTZ: {
                files: [{
                    nonull: true,
                     cwd: distFolder,
                     src: appName + '.zip',
                     dest: distFolder +'/',
                    expand: true,
                    rename: function(dest, src) {
                        return dest + src.replace(appName + '.zip', fullAppName + '.vtz');
                    }
                }]
            },
            moveOOTBtoBuild: {
                files: [{
                    nonull: true,
                     cwd: distFolder,
                     src: fullAppName + '.zip',
                     dest: '../build',
                    expand: true
                }]
            },
            main: {
                files: [
                {
                    src: '**',
                    dest: destFolder + '/assets',
                    cwd: sourceFolder + '/assets',
                    expand: true
                }, {
                    src: '**',
                    dest: destFolder + '/bower_components',
                    cwd: sourceFolder + '/bower_components',
                    expand: true
                }, {
                    src: sourceFolder + '/appInfo.json',
                    dest: destFolder + '/appInfo.json'
                },
                {
                    src: buildInfo.externalLibs.css,
                    dest: destFolder + '/',
                    expand: true
                }, {
                    src: buildInfo.externalLibs.js,
                    dest: destFolder + '/'
                }, {
                    src: buildInfo.externalLibs.extra,
                    dest: destFolder + '/',
                    expand: true
                }]
            },
            copyFiles:{
                files: [
                    {
                        src:'**/**',
                        dest: destFolder,
                        cwd: sourceFolder,
                        expand: true
                    }
                ]
            },
            vendorJS: {
                files: [{
                    src: '**/*.js',
                    cwd: 'vendor',
                    dest: destFolder + '/vendor/',
                    expand: true
                },{
                    src: '**/*.json',
                    cwd: 'vendor',
                    dest: destFolder + '/vendor/',
                    expand: true
                }]
            }
        },
        compress: {
            main: {
                mode: 'zip',
                options: {
                    archive: distFolder + '/' + appName + '.zip'
                },
                files: [{
                    expand: true,
                    cwd: destFolder + '/',
                    src: [ '**'],
                    dest: '/'
                }]
            },
            ootbPackage: {
                mode: 'zip',
                options: {
                    archive: distFolder + '/' + fullAppName + '.zip'
                },
                files: [{
                     expand: true,
                    cwd: distFolder + '/',
                    src: fullAppName + '.vtz',
                    dest: '/'
                },{
                     expand: true,
                    cwd: distFolder,
                    src: '~info.ini',
                }]
            }
        },
        jshint: {
            // options: {
            //     // smarttabs: true,
            // },
            options: {
                jshintrc: true,
                force: isDebugging
            },
            src: ['src/js/**/*.js']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-pug');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-if');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask('languageFromXmlToJson', 'Process language files from XML format to JSON', function() {
        'use strict';

        var done = this.async();

        let inputXMLDir = 'vendor/crestron/translations/translations/',
            outputJSONDir = destFolder + '/assets/translations',
            getProcessedJsonFromXMLData = data => {
                let jsObject = data.reduce((a, c) => {
                    let keys = String(c.$.key).split(':');

                    if (keys[0] === 'global') {
                        a[keys[1]] = a[keys[1]] || {};
                        a[keys[1]] = c._;
                    }
                    else {
                        a[keys[0]] = a[keys[0]] || {};
                        a[keys[0]][keys[1]] = a[keys[0]][keys[1]] || {};
                        a[keys[0]][keys[1]] = c._;
                    }

                    return a;

                }, {});

                return JSON.stringify(jsObject, null, 2);
            };

        fs.readdir ( inputXMLDir, (err, files) => {
            if ( !err ) {
                files.forEach(file => {
                    let fileArr = file.split('.'),
                        filename = fileArr[0];

                    if (fileArr.length > 1 )
                        [file].map( file => {
                            return grunt.file.read(inputXMLDir + file, 'utf8');
                        })
                        .forEach(xmlContent => {
                            xml2Js.parseString(xmlContent, (err, data) => {
                                if (err) throw err;
                                let jsonFilePath = outputJSONDir + '/' + filename.toLowerCase().split('_').join('-') + '.json',
                                    jsonContent = getProcessedJsonFromXMLData(data.lang.lookup);

                                grunt.file.write(jsonFilePath, jsonContent);
                            });
                        });
                });
            }
            setTimeout(done, 1000);
        });
    });

    grunt.registerTask('makeAppui', 'Create appui directory and manifest file', function() {
        'use strict';

         if(grunt.file.isDir(destFolder + '/appui') == false){
             grunt.file.mkdir(destFolder + '/appui');
         }
        grunt.log.write('destFolder = ' + destFolder);
        grunt.file.write(destFolder + '/appui/manifest', 'version: ' + appVersion + '\napptype: scheduling');
    });

    grunt.registerTask('makeIni', 'Create ini file', function() {
        'use strict';
        var textForIni = '[Firmware]\nFilename=' + fullAppName + '.vtz' + '\nVersion=' + appVersion + '\nTargets=TSW-XX60-OOTBF';
        grunt.file.write( distFolder + '/~info.ini' , textForIni);
    });

    grunt.registerTask('default', ['clean:cleanDest', 'clean:cleanDist', 'jshint', 'concat', 'sass', 'if:buildHtml', 'if:minify', 'if:copyFiles', 'if:emulate', 'clean:cleanTranslation', 'languageFromXmlToJson', 'if:ootbBuild', 'if:archiveApp', 'if:buildfinal']);
    grunt.registerTask('start', ['default', 'watch']);
    grunt.registerTask('test', ['compress']);
}
