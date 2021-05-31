/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */


/**
 * @license
 * @namespace SchedulingPanel
 **/

var SchedulingPanel = SchedulingPanel || {};

SchedulingPanel = ( function ( ) {
    'use strict';

    var respIncorrectParam = { error: 'Incorrect parameters' },
        _callbacks = {},
        _listeners = {},
        _cacheData = {};

    function isString ( param ) {
        return (typeof param === 'string' || param instanceof String );
    }

    function isBoolean ( param ) {
        return (typeof param === 'boolean' || param instanceof Boolean );
    }

    function isFunction ( callback ) {
        return callback && ( callback instanceof Function );
    }

    function doErrorParamsCallback ( callback ) {
        if ( isFunction ( callback ) )
            callback( false, respIncorrectParam );
        console.log("Invalid params");
    }

    function registerCallback (action, callback) {
        var timestamp = null;

        if ( isFunction( callback ) ) {
            timestamp = Date.now( ) + '';
            _callbacks[timestamp] = callback;
        }

        console.log('Register Callback: ' + timestamp);
        return timestamp;
    }

    function doCallbackOnPublishAction ( callbackId, success, resp ) {
        var data = {};

        console.log('SchedulingPanel Action Receive: CallbackId: ' + callbackId + ',  success: ' + success + ', resp: '  + resp );
        if ( callbackId && _callbacks[callbackId] ) {
            try {
                data = JSON.parse( resp );
            } catch ( err ) {
                console.log('Invalid JSON: ' + resp);
            }
            _callbacks[callbackId]( success, data );
            delete _callbacks[callbackId];
        }
    }

    function doCallbackOnPushishData ( type, resp ) {
        var data = { },
            listeners = _listeners[ type ];

        console.log('SchedulingPanel Data Receive: Type: ' + type + ", Data: " + resp);
        try {
            data = JSON.parse( resp );
        } catch (err) {
            console.log('Invalid JSON: ' + resp);
        }

        if ( listeners ) {
            for(var i = 0; i < listeners.length; i++ ) {
                listeners[i] ( data );
            }
        }
        _cacheData[ type ] = data;
    }

    function addListener( type, callback, cache ) {
        _listeners[type] = _listeners[type] || [];
        _listeners[type].push( callback );
        if ( cache && _cacheData[type] )
            callback (_cacheData[type]);
    }

    function removeListener ( type, callback ) {
        var curList = _listeners[type];
        if (curList) {
            for (var i = curList.length; i >= 0; i-- ) {
                if ( curList[i] === callback ) {
                    curList.splice(i, 1);
                    break;
                }
            }
        }
    }

    return {
        webUI: {
            subscribe: {
                data: {
                    config: function ( callback, cache ) {
                        addListener('config', callback, cache === false ? cache : true );
                    },
                    // Not used. The language comes in with the config update
                    language: function ( callback, cache ) {
                        addListener( 'language', callback, cache === false ? cache : true );
                    },
                    timeline: function ( callback, cache ) {
                        addListener( 'timeline', callback, cache === false ? cache : true );
                    },
                    providerStatus: function ( callback, cache ) {
                        addListener( 'providerStatus', callback, cache === false ? cache : true);
                    },
                    events: function ( callback, cache ) {
                        addListener( 'events', callback, cache === false ? cache : true );
                    }
                }
            },
            unsubscribe: {
                data: {
                    config: function ( callback ) {
                        removeListener( 'config', callback);
                    },
                    language: function ( callback ) {
                        removeListener( 'language', callback);
                    },
                    timeline: function ( callback ) {
                        removeListener( 'timeline', callback);
                    },
                    providerStatus: function ( callback ) {
                        removeListener( 'providerStatus', callback);
                    },
                    events: function ( callback ) {
                        removeListener( 'events', callback );
                    }
                }
            },
            publish: {
                data: {
                    config: function ( resp ) {
                        doCallbackOnPushishData( 'config', resp );
                    },
                    language: function ( resp ) {
                        doCallbackOnPushishData( 'language', resp );
                    },
                    timeline: function ( resp ) {
                        doCallbackOnPushishData( 'timeline', resp );
                    },
                    providerStatus: function ( resp ) {
                        doCallbackOnPushishData( 'providerStatus', resp );
                    },
                    events: function ( resp ) {
                        doCallbackOnPushishData( 'events', resp );
                    }
                },
                action: {
                    extendEvent: function ( callbackId, success, resp ) {
                        doCallbackOnPublishAction( callbackId, success, resp );
                    },
                    endEvent: function ( callbackId, success, resp ) {
                        doCallbackOnPublishAction( callbackId, success, resp );
                    },
                    createEvent: function (callbackId, success, resp ) {
                        doCallbackOnPublishAction( callbackId, success, resp );
                    },
                    roomSearch: function ( callbackId, success, resp ) {
                        doCallbackOnPublishAction( callbackId, success, resp );
                    },
                    detailsEvent: function ( callbackId, success, resp ) {
                        doCallbackOnPublishAction ( callbackId, success, resp );
                    },
                    checkInEvent: function ( callbackId, success, resp ) {
                        doCallbackOnPublishAction( callbackId, success, resp );
                    },
                    statusScreenInfo: function ( callbackId, success, resp ) {
                        doCallbackOnPublishAction( callbackId, success, resp );
                    },
                    refreshSchedule: function ( callbackId, success ) {
                        doCallbackOnPublishAction( callbackId, success, "null" );
                    }
                }
            },
            send: {
                action: {
                    extendEvent: function ( eventId, instanceId, duration, callback ) {
                        if ( isString ( eventId ) && (instanceId === null || isString(instanceId)) && isString ( duration ) ) {
                            JSInterface.doExtendMeeting( registerCallback ( 'extendEvent', callback ), eventId, instanceId, duration );
                        } else {
                            doErrorParamsCallback( callback );
                        }
                    },
                    endEvent: function ( eventId, instanceId, callback ) {
                        if ( isString( eventId ) && (instanceId === null || isString(instanceId)) ) {
                            JSInterface.doEndMeeting( registerCallback ( 'endEvent', callback ), eventId, instanceId );
                        } else {
                            doErrorParamsCallback( callback );
                        }
                    },
                    createEvent: function ( timeline, roomId, subject, organizer, startDate, endDate, callback ) {
                        if ( (roomId === null || isString( roomId )) && isString( subject ) && isString( organizer ) && Number.isInteger( startDate ) && Number.isInteger( endDate ) ) {
                            //TODO for the moment we are not sending room. Marius needs to do fo that another function`
                            JSInterface.doCreateMeeting( timeline, registerCallback ( 'createEvent', callback ), roomId, subject, organizer, startDate, endDate );
                        } else {
                            doErrorParamsCallback( callback );
                        }

                    },
                    roomSearch: function ( roomId, callback ) {
                        if ( isString( roomId ) ) {
                            JSInterface.doRoomSearch( registerCallback ( 'roomSearch', callback ), roomId );
                        } else {
                            doErrorParamsCallback( callback );
                        }
                    },
                    detailsEvent: function ( eventId, instanceId, callback ) {
                        if ( isString( eventId ) && (instanceId === null || isString(instanceId)) ) {
                            JSInterface.doDetailsMeeting( registerCallback ( 'detailsEvent', callback ), eventId, instanceId );
                        } else {
                            doErrorParamsCallback( callback );
                        }
                    },
                    checkInEvent: function ( eventId, instanceId, callback ) {
                        if ( isString( eventId ) && (instanceId === null || isString(instanceId)) ) {
                            JSInterface.doCheckInMeeting( registerCallback ( 'checkInEvent', callback ), eventId, instanceId );
                        } else {
                            doErrorParamsCallback( callback );
                        }
                    },
                    openSettings: function ( ) {
                        JSInterface.openSettings( );
                    },
                    refreshSchedule: function ( callback ) {
                        JSInterface.doRefreshSchedule( registerCallback ( 'refreshSchedule', callback ) );
                    },
                    statusScreenInfo: function( callback ) {
                        JSInterface.getStatusScreenInfo( registerCallback ( 'statusScreen', callback ) );
                    }
                }
            }
        }
    }
})();
