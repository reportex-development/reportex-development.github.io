/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */

 
/**
 * Interval service. Create a universal interval for the application.
 * Where we need to call a function at that interval just subscribe to the interval
 */
( function( ) {
    'use strict';

    angular
        .module( 'helium' )
        .service( 'AppClockService', AppClockService );

    AppClockService.$inject =  [ '$timeout' ];

    function AppClockService ( $timeout ) {
        var callbacks = [],
            timeout,
            tickRunning = false,
            callCallbacks = function ( ) {
                for (var i = 0; i < callbacks.length; i++ )  {
                    //Added try/catch to protect against a missing callback causing the rest not to fire
                    try {
                        callbacks[i]();
                    } catch ( ex ) {
                        console.log('AppClockService: Exception while processing a callback function: ' + ex);
                    }
                }
            },
            tick = function() {
                callCallbacks( );
                //Get time to next full minute + 500ms
              var millisToNextMinutes = 60500 - (new Date().getTime() % 60000);
                timeout = $timeout(tick, millisToNextMinutes); // reset the timeout after every completion
            },
            cancelTick = function ( ) {
                if(tickRunning){
                    $timeout.cancel(timeout);
                    tickRunning = false;
                }
            },
            createTick = function startTick(){
                if(tickRunning){
                    cancelTick();
                }
                //Notify subscribers before creating timeout
                callCallbacks( );
                //Get time to next full minute + 20ms
              var millisToNextMinutes = 60500 - (new Date().getTime() % 60000);
                // Start the timer
                timeout = $timeout(tick, millisToNextMinutes);
                tickRunning = true;
            };

        this.subscribe = function ( callback ) {
            if (!callbacks.length) {
                createTick();
            }
            callbacks.push( callback );
        };

        this.unsubscribe = function ( callback ) {
            for (var i = callbacks.length; i >= 0; i-- ) {
                if ( callbacks[i] === callback ) {
                    callbacks.splice(i, 1);
                    break;
                }
            }
            if (!callbacks.length) {
                cancelTick();
            }
        };
    }

} )( );

