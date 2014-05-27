// Application settings
var Settings = {
    DEBUG: 1,
    CALLBACK: SApplication, // Important! Wrapper callback
    NETWORK: {
        ID: 'fb',
        INIT_PARAMS: {
            appId: 0, // setup application id
            status: true,
            cookie: true,
            xfbml: true,
            frictionlessRequests: true
        },
        API_BASE_URL: 'https://graph.facebook.com',
        AUTH_URL: 'https://www.facebook.com/dialog/oauth?client_id=0' // set application id here,
        PERMISSIONS: 'email, user_location, user_friends, friends_online_presence',
        PROFILE_FIELDS: 'first_name, sex, uid, last_name, locale, pic, profile_url, currency, current_address, books, movies, music, current_location, pic_big, email',
        CANCELL_TEXT: 'Please grant permissions to this app to continue to play ;)'
    },
    // Server settings needed in client..
    SERVER: {
        REQUEST_PREFIX: '',
        SOCKET_ADRES: 'https://example.com/',
        SOCKET_RESOURCE: 'sfw/socket.io',

    },
    // Application basic settings
    APPLICATION: {
        ID: 545675598887240,
        CLOSED: 0,
        TEST_MODE: 0,
        URL: 'https://apps.facebook.com/yourgreatapp', // app FB url
        SERVER_BASE_URL: 'https://addicted2apps.com/', // base url
        SERVER_URL: 'https://example.com/sfw', // application url
    },
    // SMM
    SMM: {
        INVITE_FRIEDS: {
            ENABLED: 1,
            MESSAGE: 'Invite friends message'
        },
        MASS_INVITE: {
            ENABLED: 1,
            OFFSET: 48,
            SKIP: 2,
            PERIOD: 60 * 60 * 7, // 7 hours
            MESSAGE: 'Mass friends invite message'
        },
        WALLPOST: {
            ENABLED: 1,
            MAX_IN_SESSION: 1
        },
        NOTIFICATION: {
            ENABLED: 1,
            REF: 'nofif_automat',
            MESSAGE: 'Timeline post',
            PERIOD: 2 * 1000
        },
        TIMELINE: {
            MESSAGE: 'SFW Timelinepost',
            IMAGE: '',
            LINK: '',
            TITLE: 'SFW timeline post title',
            PERIOD: 2 * 1000
        },
        COMMUNITY: {
            ID: 0,
            CATEGORY: ''
        }
    },
    // Chat settings
    CHAT: {
        ENABLED: 0,
        ROOM: '',
        MAX_MESSAGES: 50,
        SMILIES: [{
            img: 'smile.gif',
            code: ':)'
        }]
    }
}