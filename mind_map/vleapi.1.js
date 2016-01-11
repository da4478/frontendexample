/*
 * This script is provided for inclusion in HTML activities that wish to access
 * VLE features such as parameters, attachments, and server-side data.
 *
 * This is a stub. If running on the VLE, the actual version of these functions
 * will automatically be applied using a script from the server that overwrites
 * the definitions here.
 *
 * For new projects, the current version of this file is available on the VLE
 * as /mod/oucontent/api/vleapi.1.js (this file is not actually used by the VLE).
 * We will try to ensure that old versions of this file keep working.
 */

var VLE = {
    /**
     * API version of this file (integer changed only when API has
     * non-compatible change).
     */
    apiversion : 1,

    /**
     * Point version of this file. Changed for information when there is an
     * update to the file version that does not break API, such as adding a new
     * function.
     */
    pointversion : 5,

    /**
     * Marked true if sent from server.
     */
    serverversion : false,

    /**
     * Obtains value of a named parameter or attachment. For attachments, this
     * will return the URL of the attachment. If you want to retrieve the
     * content of the attachment, use get_attachment function.
     *
     * Parameter names are restricted to these characters: [A-Za-z0-9_-.] and
     * can only be up to 20 characters long.
     *
     * Because parameters are provided in the URL to index.html, this function
     * will not work if the user has clicked a link to a different file within
     * your activity, unless you previously ensured that all parameters were
     * included in the link.
     *
     * When not running in the VLE, this code still works to retrieve parameter
     * values from the URL.
     *
     * The following special parameter names are available when running in the
     * VLE. They have short names to avoid taking up too much space in the URL.
     *
     * _c : Course id (number); not set for previews
     * _i : Document item id (text; from id= on Item; not set for previews
     *      or if document item id does not match character restriction)
     * _p : Preview id (number); only set for previews
     * _a : Activity id (text; from id= on MediaContent); may or may not be set
     * _s : Moodle session key for user (text)
     * _u : Moodle user id (number)
     *
     * @param name Parameter name
     * @return Value of parameter or null if not set
     */
    get_param : function(name) {
        // Check valid param name
        this.check_key(name, 'Invalid param name: ' + name);

        // Find in query
        var search = String(location.search);
        var matches = new RegExp('[?&]' + name + '=([^&]+)').exec(search);
        if (matches && matches[1]) {
            return decodeURIComponent(matches[1].replace(/\+/g, ' '));
        } else {
            return null;
        }
    },

    /**
     * Gets the content of an attachment. (If you only want to retrieve the
     * URL, use get_param function.) The attachment must be an XML or text
     * file. For XML support, the filename must end in '.xml'.
     *
     * You must pass two functions as parameters. Here is an example:
     * VLE.get_attachment('frog', function(text, xmldocument) { ... },
     *   function(message) {...});
     *
     * In this example the xmldocument parameter is a DOM document object
     * containing the XML file result (if any), and the text parameter is a
     * string containing the result as plain text. The error parameter
     * is a string.
     *
     * When not running in the VLE, this function may still work but should
     * be used for testing purposes only. Specifically, it only works fully
     * on Firefox (tested on Firefox 12) and while testing, the attachment must
     * be placed in the same folder as the HTML file. It doesn't work in Chrome
     * due to browser security restrictions (Chromium issue 47416) and works
     * only partially on IE9.
     *
     * @param name Attachment name
     * @param ok Function that is called if the attachment is retrieved OK.
     * @param error Function that is called if there is an error.
     */
    get_attachment : function(name, ok, error) {
        var url = this.get_param(name);
        if (!url) {
            error('Attachment not found: ' + name);
            return;
        }
        var xml = url.match(/\.xml$/);
        this.ajax_get(url, function(req) {
            ok(req.responseText, xml ? req.responseXML : null);
        }, error);
    },

    /**
     * Gets data that was stored on the server.
     *
     * Note that you should not normally use the last three parameters.
     * These are for special cases where you want to access the same
     * data across different activities.
     *
     * You can retrieve data either for the current user (each user has
     * independent data) or for all users (so that all users have different
     * data).
     *
     * You must pass two functions as parameters. Here is an example:
     * VLE.get_server_data(true, ['frog'], function(values) { ... },
     *   function(message) { ...});
     *
     * In this example the 'values' parameter is a JavaScript object containing
     * fields with the same names as you passed (so in this case, values.frog
     * would be the value of the data named 'frog' for this user, or an empty
     * string '' if  no such data had been set). The 'message' parameter is
     * an error message string.
     *
     * When not running in the VLE, always calls the 'error' function with the
     * message set to null.
     *
     * @param user If true, stores data for current user
     * @param names Array of names
     * @param ok Function that is called if the data is retrieved OK.
     * @param error Function that is called if there is an error.
     * @param activityid Activity id (Optional: omit to use current activity)
     * @param itemid Document item id (Optional; omit to use current document)
     * @param courseid Course numeric id (Optional; omit to use current course)
     */
    get_server_data : function(user, names, ok, error, activityid, itemid, courseid) {
        window.setTimeout(function() { error(null); }, 0);
    },

    /**
     * Stores data on the server for the current user.
     *
     * Note that you should not normally use the last three parameters.
     * These are for special cases where you want to access the same
     * data across different activities.
     *
     * You can set data either for the current user (each user has
     * independent data) or for all users (so that all users access the same
     * data).
     *
     * The value of each key-value pair is limited to 64,000 bytes (not
     * characters) but can contain any Unicode. Keys may be up to 20 characters
     * and must contain only [A-Za-z0-9_-.]. Activity IDs and item IDs have the
     * same restriction. (Item IDs are only restricted in this way when you
     * set an activity ID for an HTML activity.)
     *
     * Setting a value to empty string has the effect of deleting that value
     * from our database and saving space, so we recommend doing that when
     * appropriate.
     *
     * You must pass two functions as parameters. Here is an example which sets
     * the value of the data item 'frog' to 'Kermit':
     * VLE.set_server_data(true, {'frog' : 'Kermit'}, function() { ... },
     *   function(message) { ... });
     *
     * In this example the 'message' parameter on the second function is an
     * error message string. The first function, with no parameters, is called
     * if the update succeeds.
     *
     * When not running in the VLE, always calls the 'error' function with the
     * message set to null.
     *
     * Especially when storing data for all users, you may wish to consider
     * race conditions. For example, if you are storing a count value, you may
     * use a pattern where based on a user action, you retrieve the current
     * value (say, 4) and then set a new one (say, 5). If two users do this at
     * a similar time, you will end up setting it to 5 twice. To avoid this
     * possibility, you can use the optional previousvalues and retry
     * parameters. If you specify previousvalues, this should be the object
     * containing the old values of the data, as retrieved by get_server_data.
     * The system will only apply the update if the data is the same as this.
     * If it is different, then the retry function will be called, passing the
     * actual current server data as its single parameter.
     *
     * Here is an example where we try to set a number to 5 but only if the
     * current value is 4. If the current number is not 4 then the last
     * function will be called with an object including the 'num' field with
     * the actual value.
     * VLE.set_server_data(true, {'num' : 5}, function() { ... },
     *   function(message) { ... }, {'num' : 4}, function(actualvalues) { ... });
     *
     * @param user If true, stores data for current user
     * @param values JavaScript object containing the key/value pairs to set
     * @param ok Function that is called if the data is set OK.
     * @param error Function that is called if there is an error.
     * @param previousvalues Previous values (optional)
     * @param retry Function that is called if previous values changed (optional)
     * @param activityid Activity id (optional: omit to use current activity)
     * @param itemid Document item id (optional; omit to use current document)
     * @param courseid Course numeric id (optional; omit to use current course)
     */
    set_server_data : function(user, values, ok, error, previousvalues, retry,
            activityid, itemid, courseid) {
        window.setTimeout(function() { error(null); }, 0);
    },

    /**
     * (Internal function, not recommended for other use.)
     * Makes an AJAX GET request and calls the ok function if it succeeds or the
     * error function if it fails.
     */
    ajax_get : function(url, ok, error) {
        // Get the XMLHttpRequest object. On IE we prefer the ActiveX version
        // even though it now supports the standard way too, because the ActiveX
        // one can access files if run locally.
        var req;
        if (window.ActiveXObject) {
            req = new ActiveXObject("Microsoft.XMLHTTP");
        } else {
            req = new XMLHttpRequest();
        }
        req.open('GET', url, true);
        req.onreadystatechange = function(e) {
            if (req.readyState == 4) {
                // Status 0 is for local files (testing use only).
                if (req.status == 200 || req.status == 0) {
                    ok(req);
                } else {
                    error('Error ' + req.status + ' loading ' + url);
                }
            }
        };
        req.send(null);
    },

    /**
     * Internal use only: Various keys are restricted to a certain regular
     * expression. This checks it and throws exception if it doesn't match.
     * @param key Key to test
     * @param message Message to throw if it fails test
     */
    check_key : function(key, message) {
        if (key===null || !key.match(/^[A-Za-z0-9._-]{1,20}$/)) {
            throw message;
        }
    },

    /**
     * Obtains information about the context where this activity has been
     * embedded. The information is returned as a JavaScript object which
     * includes the following fields (more fields may be added later).
     *
     * Fields that correspond directly to CSS values:
     * - backgroundColor (of surrounding area, e.g. '#ffffff')
     * - fontSize (of main body text, e.g. '0.875em')
     * - color (of main body text, e.g. '#1a1a1a')
     * - fontFamily (of main body text, e.g. 'Arial, sans-serif')
     * - lineHeight (of main body text, e.g. '1.4')
     * - marginBottom (of paragraphs in main body text, e.g. '10px')
     *
     * Extra fields:
     * - variant (alternate text colour for certain headings or
     *   highlights, depending on selected VLE theme)
     */
    get_embed_context : function() {
        return {
            backgroundColor: '#ffffff',
            fontSize: '0.875em',
            color: '#1a1a1a',
            fontFamily: 'Arial, sans-serif',
            lineHeight: '1.4',
            marginBottom: '0.5em',
            variant: '#e80074'
        };
    },

    /**
     * Reports a user accessing this experiment, for the analytics system.
     *
     * If using the analytics system, you must call this function before any
     * of the other report_ functions. This function should usually be called
     * on each page load. (The system counts a 'visit' only once per user
     * session, so repeated visit reports within the same session will be
     * safely ignored.)
     *
     * You can optionally pass an 'error' function with one parameter (error
     * message). If you don't supply this value, errors will be ignored.
     *
     * When not running in the VLE, always calls the 'error' function (if
     * provided) with the message set to null.
     *
     * @param error Function that is called if there is an error (Optional)
     * @param activityid Activity id (Optional: omit to use current activity)
     * @param itemid Document item id (Optional; omit to use current document)
     * @param courseid Course numeric id (Optional; omit to use current course)
     */
    report_visit : function(error, activityid, itemid, courseid) {
        if (typeof error !== undefined) {
            error(null);
        }
    },

    /**
     * Reports a counted event for analytics.
     *
     * Example: In an activity about examining rock samples, you want to
     * provide information about how many rock samples the user examined. To
     * achieve this, call report_count each time the user examines a rock
     * sample.
     *
     * The short name and display name identify the event. The short name is
     * subject to the same restrictions as other identifiers (20 characters).
     * The display name can be any text up to 40 characters and will be used
     * to display to user when showing statistics. Although the display name is
     * supplied with each function call, it is actually only stored once; if
     * you change the display name, that will change the display name for all
     * previous events that used the same short name.
     *
     * You can optionally pass an 'error' function with one parameter (error
     * message). If you don't supply this value, errors will be ignored.
     *
     * When not running in the VLE, always calls the 'error' function (if
     * provided) with the message set to null.
     *
     * @param shortname Short name of event (Optional; see above)
     * @param displayname Display name of event (Optional; see above)
     * @param error Function that is called if there is an error (Optional)
     * @param activityid Activity id (Optional: omit to use current activity)
     * @param itemid Document item id (Optional; omit to use current document)
     * @param courseid Course numeric id (Optional; omit to use current course)
     */
    report_count : function(shortname, displayname, error, activityid, itemid, courseid) {
        if (typeof error !== undefined) {
            error(null);
        }
    },

    /**
     * Starts a timer which will report a quantity of elapsed time for
     * analytics.
     *
     * Example: You want to track the total time users spend with an activity.
     * To track this, you call this function as soon as they click a 'Start
     * activity' button. You then call the returned 'stop' function whenever
     * they finish the activity.
     *
     * This function is designed only for reporting *cumulative* time, such
     * as the total time using an activity, or the total time using a particular
     * tab. At present there is no facility to report individual timed events.
     *
     * If you don't call the stop function, the system will automatically report
     * time once per minute until the page containing the activity is closed.
     *
     * The short name and display name identify the event. The short name is
     * subject to the same restrictions as other identifiers (20 characters).
     * The display name can be any text up to 40 characters and will be used
     * to display to user when showing statistics. Although the display name is
     * supplied with each function call, it is actually only stored once; if
     * you change the display name, that will change the display name for all
     * previous events that used the same short name.
     *
     * You can optionally pass an 'error' function with one parameter (error
     * message). If you don't supply this value, errors will be ignored.
     *
     * When not running in the VLE, always calls the 'error' function (if
     * provided) with the message set to null; the returned 'stop' function
     * does nothing.
     *
     * @param shortname Short name of event (Optional; see above)
     * @param displayname Display name of event (Optional; see above)
     * @param error Function that is called if there is an error (Optional)
     * @param activityid Activity id (Optional: omit to use current activity)
     * @param itemid Document item id (Optional; omit to use current document)
     * @param courseid Course numeric id (Optional; omit to use current course)
     * @return Function which you can call when the elapsed time completes
     */
    report_start_timer : function(shortname, displayname, error, activityid, itemid, courseid) {
        if (typeof error !== undefined) {
            error(null);
        }
        return function() {};
    }
};