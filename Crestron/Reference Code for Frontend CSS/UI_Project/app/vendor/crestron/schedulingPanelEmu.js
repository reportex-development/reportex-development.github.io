/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */

 
/**
 * @license
 * @namespace SchedulingPanelEmulator
 **/

'use strict';
var JSInterface = JSInterface || {};

JSInterface = ( function ( ) {
    var me,
        helpers = {
            name: ['Joe Doe', 'Michael Jackson', 'Luis Amstrong', 'Nelson Mandela', 'Richard Seroka', 'Maddona',
                    'Marilyn Monroe', 'Andrei Margineanu', 'Bill Gates', 'Christopher Columbus', 'Muhammad Ali'],
            subject: ['Happy Birthday Lindsay - Surprise Inside!', 'Zillow: "What Can You Afford?"', 'What are our customers saying?',
                    'Where to Drink Beer Right Now', 'Read your review for John Mulaney', 'You"re missing out on points.', 'Buffer has been hacked - here is what"s going on'],
            attendees: ['Joe Doe', 'Michael Jackson', 'Luis Amstrong', 'Nelson Mandela', 'Richard Seroka', 'Maddona',
                    'Marilyn Monroe', 'Andrei Margineanu', 'Bill Gates', 'Christopher Columbus', 'Muhammad Ali'],
            rooms: ['Danube', 'Everest', 'Helium', 'Blackbird', 'Icon', 'Soccer'],
            privacyLevel: ['private','semi-private','public'],
            boolean: [ false, true ],
            duration: [ 15, 30, 60, 90 ],
            beginHour: 8,
            endHour: 22,
            meetingId: 1
        },
        simulateTime = 1000,
        cfgLanguage = {
            name: 'en',
            rtl: false
        };
    
    function randomIntFromInterval( min, max ) {
        return Math.floor( Math.random( ) * ( max - min + 1) + min );
    }

    function getFixDate ( hour ) {
        var d = new Date( );

        d.setHours( hour );
        d.setMinutes( 0 );
        d.setSeconds( 0 );
        d.setMilliseconds( 0 );

        return d;
    }

    function addMilliSecond ( d, t ) {
         return new Date (d.getTime() + ( t ? t : 1 ) );
    }

    function getEndDateInterval ( startTime, duration ) {
        return new Date( startTime.getTime() +  
            ((duration ? duration : helpers.duration[randomIntFromInterval(0, helpers.duration.length - 1)]) * 60000)
        );
    }

    function getNormalizedDate(date) {
        var result = new Date(date.getTime());

        result.setMilliseconds(0);
        result.setSeconds(0);

        return result;
    }

    function generateEvents ( cfg ) {   
        var duration = ( cfg && helpers.duration.indexOf(cfg.duration) !== - 1 ) ? cfg.duration : 0,
            max = ( cfg && cfg.max ) ? true : false,
            eventNow = ( cfg && cfg.now ) ? true :  false,
            events = [],
            startTime = addMilliSecond (getFixDate( helpers.beginHour )),
            endTime,
            lastTime = getFixDate ( helpers.endHour ),
            now = new Date(),
            event,
            privacyLevel,
            i;

            //return events;

        while ( startTime < lastTime ) {
            privacyLevel = helpers.privacyLevel[randomIntFromInterval(0, helpers.privacyLevel.length -1 )];
            endTime = getEndDateInterval (startTime, duration);
            endTime = endTime > lastTime ? lastTime : endTime;
            helpers.meetingId++;
            startTime = getNormalizedDate(startTime);
            endTime = getNormalizedDate(endTime);
            event = {
                id: helpers.meetingId.toString() ,
                organizer: privacyLevel === 'public' || privacyLevel === 'semi-private' ? helpers.name[randomIntFromInterval(0, helpers.name.length -1 )] : '',
                subject: privacyLevel === 'public' ? helpers.subject[randomIntFromInterval(0, helpers.subject.length -1 )] : '',
                privacyLevel: privacyLevel,
                dtStart: startTime.getTime( ),
                startDate: startTime,
                dtEnd: endTime.getTime( ),
                endDate: endTime,
                attendees: { 
                    required: [ ],
                    optional: [ ]
                }
            };

            for ( i = 0; i < randomIntFromInterval(0, helpers.attendees.length -1 ); i ++ ) {
                 event.attendees.required.push(
                     helpers.attendees[randomIntFromInterval(0, helpers.attendees.length -1 )]
                 );
            }
            for ( i = 0; i < randomIntFromInterval(0, helpers.attendees.length -1 ); i ++ ) {
                 event.attendees.optional.push(
                     helpers.attendees[randomIntFromInterval(0, helpers.attendees.length -1 )]
                 );
            }

            if ( eventNow && startTime < now &&  now < endTime ) {
                events.push( event );
            } else if ( !eventNow && startTime < now && now < endTime ) {
                //nothing
            } else if ( max || helpers.boolean[randomIntFromInterval(0, helpers.boolean.length - 1)] ) {
                events.push( event );
            }
            startTime = addMilliSecond( endTime );
        }

        return events;
    }

    function addEvent ( timeline, roomId, subject, organizer, startDate, endDate ) {
        var event,
            events = me.data.events,
            findPosition = function ( endDate ) {
                var ret = 0;

                for ( var i = 0; i < events.length; i++ ) {
                    if ( endDate <= events[i].dtStart ) {
                        ret = i;
                        break;
                    }
                }

                return ret;
            },
            insertAt = function ( event ) {
                var position = findPosition ( event.dtEnd );

                me.data.events.splice(position, 0, event);
            };

        helpers.meetingId++;
        event = {
            timeline: timeline,
            id: helpers.meetingId.toString(),
            organizer: organizer,
            subject: subject,
            dtStart: startDate,
            startDate: new Date(startDate),
            dtEnd: endDate,
            endDate: new Date(endDate),
            privacyLevel: 'public'
        };

        insertAt ( event );

        return event;
    }

    function getEventById ( id ) {
        var ret,
            events = me.data.events;

        for ( var i = 0; i < events.length; i ++ ) {
            if ( events[i].id === id ) {
                ret = events[i];
                break;
            }
        }

        return ret;
    }

    function isEndDateValid ( endDate ) {
        var ret = true,
            events = me.data.events;

        for ( var i = 0; i < events.length; i ++ ) {
            if ( endDate.getTime() > events[i].dtStart && endDate.getTime() <= events[i].dtEnd) {
                ret = false;
                break;
            }
        }

        return ret;
    }

    function getConfig( callback ) {
        $.ajax ( {
            url: '/vendor/crestron/appInfoEmu.json',
            dataType: 'json',
            success: callback,
            error: function ( ) {
                //TODO Remove this.
                callback ( {
                    'version': '1.0',
                    'apk-comunicatin-version': '1.0',
                    'entryPoint': '/views/partials/room.html',
                    'methods':  {
                        'endEvent': true,
                        'extendEvent': true,
                        'checkIn': true,
                        'findRoom': true
                    },
                    'screensaver-config': {
                        'carouser': [
                            '/assets/images/img1',
                            '/assets/images/img2',
                            '/assets/images/img3'
                        ],
                        'image': false
                    }
                });
            }
        } );
    } 


    function findCurrentEvents ( ) {
        var ret = { currentEvent: null, nextEvent: null },
            events = me.data.timeline.events,
            now = new Date().getTime();

        for ( var i = 0; i < events.length; i++ ) {
            var event = events[i];

            if (event.dtStart <= now && event.dtEnd >= now) {
                ret.currentEvent = event;
            }
            if (event.dtStart > now ) {
                ret.nextEvent = event;
                break;
            }
        }

        return ret;
    }

    function applyStateEvents ( force ) {
        var newStateEvents = findCurrentEvents( ),
            stateEvents = me.data.stateEvents; 

        if ( force || stateEvents.currentEvent !== newStateEvents.currentEvent || stateEvents.nextEvent !== newStateEvents.nextEvent ) {
            SchedulingPanel.webUI.publish.data.events ( JSON.stringify( {data: newStateEvents } ) );
        }
        me.data.stateEvents = newStateEvents;
    }

    function createTick ( ) {
        var timeout, interval;

        timeout = setTimeout( function ( ) {
            applyStateEvents( );
            interval = setInterval ( function ( ) {
                applyStateEvents( );
            }, 60000 );
        }, (60000 - new Date( ).getTime() % 60000) );
    }

    createTick( );

    me =  {
        data: {
            timeline: {
                roomId: 'UK',
                roomName: 'London'
            },
            events: [ ],
            stateEvents: { currentEvent: null, nextEvent: null},
            config: null,
            providerStatus: true
        },        
        getMeettingById: getEventById,
        getConfig: getConfig,
        publish: {
            existingTimeline: function ( ) {
                SchedulingPanel.webUI.publish.data.timeline ( JSON.stringify( {data: me.data.timeline} ) );
                applyStateEvents( true );
            },
            timeline: function ( cfg ) {
                me.data.events = me.data.timeline.events = generateEvents ( cfg );
                SchedulingPanel.webUI.publish.data.timeline ( JSON.stringify( {data: me.data.timeline} ) );
                applyStateEvents( true );
            },
            language: function ( ) {
                SchedulingPanel.webUI.publish.data.language (  JSON.stringify( {data: cfgLanguage} ) );
            },
            config: function ( ) {
                var afterCfg = function ( cfg ) {
                    me.data.config = cfg;
                    SchedulingPanel.webUI.publish.data.config ( JSON.stringify( {data: me.data.config} ) );
                };

                if ( !me.data.config ) {
                    getConfig ( afterCfg );
                } else {
                    afterCfg ( me.data.config );
                }
            },
            providerStatus: function ( cfg ) {
                if ( cfg ) {
                    me.data.providerStatus = cfg;
                }
                
                SchedulingPanel.webUI.publish.data.providerStatus ( JSON.stringify( {data: me.data.providerStatus} ) );
            },
        },

        doCreateMeeting: function( timeline, id, roomId, subject, organizer, startDate, endDate ) {
            setTimeout( function( ) {
                var event = {};
                if ( roomId === null ) {
                    event = addEvent( timeline, roomId, subject, organizer, startDate, endDate);
                    setTimeout(function() {
                        me.publish.existingTimeline();
                    }, simulateTime);
                }
                SchedulingPanel.webUI.publish.action.createEvent( id, true, JSON.stringify( { data: event } ) );
            }, simulateTime );
        },
        doEndMeeting: function ( id, eventId , instanceId ) {
            var event = getEventById (eventId);

            setTimeout( function( ) {
                if ( event ) {
                    var now = getNormalizedDate(new Date());
                    event.dtEnd = now.getTime();
                    event.dateEnd = now;
                    SchedulingPanel.webUI.publish.action.endEvent( id, true, JSON.stringify( {data: event} ));
                    setTimeout(function() {
                        me.publish.existingTimeline();
                    }, simulateTime);
                } else {
                    SchedulingPanel.webUI.publish.action.endEvent( id, false, JSON.stringify({error: 'Invalid event Id'}) );
                }
            }, simulateTime );
        },
        doExtendMeeting: function ( id, eventId, instanceId, duration ) {
            var event = getEventById (eventId);

            setTimeout( function( ) {
                if ( event ) {
                    var endDate = addMilliSecond (event.endDate, duration * 60000 );
                    if ( isEndDateValid( endDate ) ) {
                        event.endDate = endDate;
                        event.dtEnd = endDate.getTime();
                        SchedulingPanel.webUI.publish.action.endEvent( id, true, JSON.stringify( {data: event} ));
                        setTimeout(function( ) {
                            me.publish.existingTimeline( );
                        }, simulateTime );
                    } else {
                        SchedulingPanel.webUI.publish.action.endEvent( id, false, JSON.stringify({error: 'Invalid duration.'}) );
                    }
                } else {
                    SchedulingPanel.webUI.publish.action.endEvent( id, false, JSON.stringify({error: 'Invalid meeting id.'}) );
                }
            }, simulateTime );
        },
        doDetailsMeeting: function ( id, eventId, instanceId ) {
            var event = getEventById ( eventId ),
                i,
                j;

            event.attendees = { 
                 required: [ ],
                 optional: [ ]
            };
            
            for ( i = 0; i < randomIntFromInterval(0, helpers.attendees.length -1 ); i ++ ) {
                 event.attendees.required.push(
                     helpers.attendees[randomIntFromInterval(0, helpers.attendees.length -1 )]
                 );
            }
            for ( i = 0; i < randomIntFromInterval(0, helpers.attendees.length -1 ); i ++ ) {
                 event.attendees.optional.push(
                     helpers.attendees[randomIntFromInterval(0, helpers.attendees.length -1 )]
                 );
            }
            
            setTimeout( function( ) {
                SchedulingPanel.webUI.publish.action.detailsEvent( id, true,  JSON.stringify( { data: event } ) );
            }, simulateTime );
        },
        doProviderStatus: function( isOnline ) {
            setTimeout( function( ) {
                SchedulingPanel.webUI.publish.action.providerStatus( id, true,  JSON.stringify( { data: isOnline } ) );
            }, simulateTime );
        },
        doCheckInMeeting: function ( id, eventId, instanceId ) {
            var event = getEventById ( eventId );

            setTimeout( function( ) {
                if ( event ) {
                    event.checkIn = true;
                    SchedulingPanel.webUI.publish.action.checkInEvent( id, true, JSON.stringify( { data: event } ) );
                } else {
                    SchedulingPanel.webUI.publish.action.checkInEvent( id, false, JSON.stringify({ error: 'Invalid event Id' }) );
                }
            }, simulateTime );
        },
        doRoomSearch: function ( id, roomId ) {
            setTimeout( function( ) {
                var ret = [],
                    date = getNormalizedDate(new Date()),
                    hour = date.getHours();

                date.setHours(++hour);
                
                for( var i = 0; i < helpers.rooms.length; i++ ) {
                    ret.push({id: i + '', name: helpers.rooms[i], location: 'Main Building', c: date.getTime() } );
                }
                SchedulingPanel.webUI.publish.action.roomSearch( id, true, JSON.stringify({ data: {rooms: ret} }) );
            }, simulateTime );
        },
        doRefreshSchedule: function ( id ) {
            setTimeout( function( ) {
                SchedulingPanel.webUI.publish.data.timeline ( JSON.stringify( {data: me.data.timeline} ) );
                SchedulingPanel.webUI.publish.action.refreshSchedule( id, true );
            }, simulateTime );
        },
        getStatusScreenInfo: function ( id ) {
            setTimeout( function ( ) {
                SchedulingPanel.webUI.publish.action.statusScreenInfo( id, true, JSON.stringify({ 
                    data: {
                        helpProviderData: {
                            name: 'Exchange 360',
                            isOnline: '1',
                            specificProviderData: {
                                googleAuthUserCode: 'LRPY-ZXRW',
                                googleAuthUrl: 'https://www.google.com/device'
                            }
                        },
                        configurationApi: {
                            name: 'Hydrogen',
                            isOnline: '1',
                            config: []
                        },
                        helpVersionData: {
                            application: '1.5.6.5',
                            firmware: '1.0000.0037'
                        },
                        helpDeviceData: {
                            ip: '192.168.201.38',
                            configUrl: 'http://192.168.201.38',
                            hostName: 'TSW-1060-Fortech'
                        }
                    } 
                }));
            }, simulateTime);
        },
        openSettings: function ( ) {
            alert('Open Settings');
        }
    };

    return me;
})();

//initial call
setTimeout ( function () {
    JSInterface.publish.config( );
    JSInterface.publish.providerStatus( { isOnline: false, needsAuthorization: false } );
    setTimeout( function ( ) {
        JSInterface.publish.providerStatus( { isOnline: true, needsAuthorization: false } );
        JSInterface.publish.timeline( {now: false, duration: 220} );
    }, 1000 );
}, 100);