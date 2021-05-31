/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */


/**
 * Template service
 */
( function( ) {
    'use strict';

    angular
        .module( 'helium' )
        .service( 'templateService', TemplateService );

    TemplateService.$inject =  [ '$templateCache', 'AppConfig' ];

    function TemplateService ( $templateCache, AppConfig ) {
        this.getPageTemplateUrl = function ( page ) {
            var template = AppConfig.template,
                isArabicTemplate = AppConfig.arabicLanguage &&
                        $templateCache.get(template.pageFolderPath + page + template.arabicTemplateSuffix + '.html') !== undefined,
                url = template.pageFolderPath + page + (isArabicTemplate ? template.arabicTemplateSuffix : '') +'.html';

            return $templateCache.get(url) !== undefined ? url : null;
        };

        this.getModalTemplateUrl = function ( modal ) {
            var template = AppConfig.template,
                isArabicTemplate = AppConfig.arabicLanguage &&
                        $templateCache.get(template.modalFolderPath + modal + template.arabicTemplateSuffix + '.html') !== undefined,
                url = template.modalFolderPath + modal + (isArabicTemplate ? template.arabicTemplateSuffix : '') +'.html';

            return $templateCache.get(url) !== undefined ? url : null;
        };
    }
} )( );
