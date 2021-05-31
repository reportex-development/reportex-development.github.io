```
    This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general 
    terms of Crestron’s Software Development Tools License Agreement, with the exception that you are granted permission 
    to redistribute derivative works of the provided sample code in source code format.  This license is located 
    at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience 
    with Crestron scheduling panels.  If edited in a way that’s contrary to our instructions, this SDK could result 
    in unexpected behavior and a diminished user experience.
```

#### Application structure
- Assets - Assets Directory ( images, fonts )
- SCSS - SCSS files
-- theme.scss ( REQUIRE ) - entry point of the all scss files
- VIEWS - All angular templas
-- partials - html files that will be open in a new route on the whole screen
-- modals - html files that will be open in a modal window
-- components - html files for components
- JS - All javascript files
- appInfo - manifest file
- build_template.pug - build script for index.html file
- buildInfo.json - json file containg all the files that need to be copy from other libraries ( to make as little as lite the entire code)
