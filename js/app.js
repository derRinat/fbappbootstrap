/**
 *
 *  Application
 *
 */

var SApplication = function(sapi) {

    /**
     * Prepare basic application vars
     */
    var application = sapi.wrapper,
        settings = application.settings,
        prefix = settings.SERVER.REQUEST_PREFIX;

    /**
     * Get basic data from wrapper for out application
     *
     */
    var user = application.network.getUser(),
        friends = application.network.getFriends(),
        params = application.network.getNetworkParams();

    /**
     *  Your application business logic hier:
     *  	ex.
     *  		- socket connect
     *  		- server socket events
     *  		- data & views manager
     *  		etc.
     */

    if (application.network.cancelled) {
        serveCancelled();
    } else {
        serveData();
    }


    function serveCancelled() {

        var t = $('<p>', {
            text: settings.NETWORK.CANCELL_TEXT
        });

        var l = $('<a>', {
            href: '#',
            text: 'Grant permissions',
            click: function() {
                application.network.authRedirect();
            }
        });

        $('.cancelled').append(t).append(l).show();
    }

    function serveData() {
        console.log('USER: ', user);
        console.log('FRIENDS: ', friends);
        console.log('PARAMS: ', params);

        $('.user-data div').html(prettyPrint(user));
        $('.friends-data div').html(prettyPrint(friends));
        $('.params-data div').html(prettyPrint(params));

        $('.appdata').show();
    }

    function printObject(printObject) {

    }
}