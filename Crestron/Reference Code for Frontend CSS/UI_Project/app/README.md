```
    This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general 
    terms of Crestron’s Software Development Tools License Agreement, with the exception that you are granted permission 
    to redistribute derivative works of the provided sample code in source code format.  This license is located 
    at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience 
    with Crestron scheduling panels.  If edited in a way that’s contrary to our instructions, this SDK could result 
    in unexpected behavior and a diminished user experience.
```

# Helium Application
=======================
## Required:
    node.js (v4.4.7+)
    git (v2.9.2+)

## Install
    npm install
    bower install

## Run
### Run the web application under a node server
    npm start
### Start a node server for the applications repository. Download web application resources using http://address:port/applicationName.zip 
    npm run serverrep

## Development guide

### Global node modules
    npm install -g bower
    npm install -g grunt

### Compiling source
    "grunt" or "grunt default"

### Options for grunt / grunt default
#### --app (!Required)
    Select the app ( layout ) that needs to be build
#### --debug
    Enables debugging. If set it will build all files in the public directory. If not it will build all files in dist/[app]
#### --emulate
    Enable emulateor mode. We mock some data without neededing the android application (TODO).
#### --initBuild
    It will compile css, concat js, build index.html and copy all the files into app/appFolder (define in app flag). In this folder css can be altered.
#### --build
    It will copy all the files from app/appFolder ( see flag --initBuild ) into public or dist ( depending on --debug flag ). In dist you will have the minified version of 
    css and js. Index.html will point to those files.
#### --dist
   Same as build. Final files are zipped into package with correct ini file and appui/manifest files, the web files will be in a *.vtz file.
### Examples - [appname] should be replaced with the name of your app. There should be a folder in the "apps" directory by that name.
    #### Compile project / compile with debug options
    grunt --app=[appname]
    grunt --app=[appname] --debug
    grunt --app=[appname] --debug --emulate
    #### Build custom project
    grunt --app=[appname] --initbuild
    grunt --app=[appname] --build
    grunt --app=[appname] --build --verbose
    grunt --app=[appname] --build --debug --emulate
    #### Builds webapp and packages the final OOTBF project file
    grunt --app=[appname] --dist
    grunt --app=[appname] --dist --verbose
