/* 
 *  
 * Author     : Darius Augaitis
 * Created on :  2014
 * 
 */

if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

var mindmap = {
    init: function() {



        var foo = document.getElementById("canvasMimic");

        var canvas = document.createElement('canvas');
        canvas.setAttribute("id", "cv");
        canvas.setAttribute("data-x", "o5");
        canvas.setAttribute("width", 500);
        canvas.setAttribute("height", 500);
        foo.appendChild(canvas);
        if (typeof G_vmlCanvasManager !== "undefined")
            canvas = G_vmlCanvasManager.initElement(canvas);

        this.canvas = canvas;

        var s = this;

        document.body.onselectstart = function() {
            return s.allowSelect ? true : false;
        };

        if (typeof isTest === "boolean") //if running from testing file
            return;
        s.registerClassList();

        /*
         * Adding what type of events we want to lissen
         */
        s.addEL(s.ob, 'click', s.evA, 0);
        s.addEL(s.ob, 'dblclick', s.evA, 0);
        s.addEL(s.ob, 'mousedown', s.evA, 0);
        s.addEL(s.ob, 'mousemove', s.evA, 0);
        s.addEL(s.ob, 'mouseover', s.evA, 0);
        s.addEL(s.ob, 'mouseout', s.evA, 0);
        s.addEL(s.ob, 'mouseup', s.evA, 0);
        s.addEL(s.ob, 'keydown', s.evA, 0);
        s.addEL(s.ob, 'keypress', s.evA, 0);
        s.addEL(s.ob, 'keyup', s.evA, 0);
        s.addEL(s.ob, 'change', s.evA, 0);
        s.addEL(s.ob, 'select', s.evA, 0);
        s.addEL(s.ob, 'blur', s.evA, 1);
        s.addEL(s.ob, 'focus', s.evA, 1);

        s.addEL(s.ob, 'dragstart', s.evA, 0);
        s.addEL(s.ob, 'dragend', s.evA, 0);
        s.addEL(s.ob, 'dragover', s.evA, 0);
        s.addEL(s.ob, 'dragenter', s.evA, 0);
        s.addEL(s.ob, 'dragleave', s.evA, 0);
        s.addEL(s.ob, 'drag', s.evA, 0);
        s.addEL(s.ob, 'drop', s.evA, 0);

        s.addEL(s.ob, 'touchstart', s.evA, 0);
        s.addEL(s.ob, 'touchmove', s.evA, 0);
        s.addEL(s.ob, 'touchend', s.evA, 0);
        s.addEL(s.ob, 'touchcancel', s.evA, 0);
        s.addEL(s.ob, 'touchleave', s.evA, 0);
        s.addEL(s.ob, 'touchenter', s.evA, 0);

        s.addEL(window, 'orientationchange', function() {
            if (!s.isvisible(s.canvasCon))
                return false;
            if (typeof s.opened.map === "undefined")
                return;

            var ob = document.activeElement.getAttribute('id');
            s.drawMindMap(s.opened.map);
            document.getElementById(ob).focus();
        }, 0);
        s.addEL(window, 'resize', function() {
            if (!s.isvisible(s.canvasCon))
                return false;
            if (typeof s.opened.map === "undefined")
                return;
            clearTimeout(s.resizingW);
            s.resizingW = setTimeout(function() {
                var ob = document.activeElement.getAttribute('id');
                s.drawMindMap(s.opened.map);
                var t = document.getElementById(ob);
                if (t)
                    t.focus();
            }, 300);
        }, 0);

        if (navigator && navigator.epubReadingSystem) {
            var ob = document.getElementById('menuCon');
            ob.style.top = 'auto';
            ob.style.bottom = '0px';
        }

        s.addCustomDataValues();
        s.prepareCanvas();
        s.events();
        s.loadMindmap();
        if (is_ie8)
            document.getElementById('cv').getElementsByTagName('div')[0].setAttribute('data-x', 'o100');

        if (this.hasClass(foo, 'showTree'))
            this.showAsTree = true;
    },
    showAsTree: false, //This flag to show map or tree mode
    activityDataId: document.body.getAttribute('id') || 'default_mind_map_id',
    readAttr: 'data-x',
    ob: document.getElementsByTagName('body')[0],
    addEL: (window.document.addEventListener
            ? function(e, t, f, r) {
                e.addEventListener(t, f, r);
            }
    : function(e, t, f) {
        e.attachEvent('on' + t, f);
    }),
    removeEL: (window.document.removeEventListener
            ? function(e, t, f, r) {
                e.removeEventListener(t, f, r);
            }
    : function(e, t, f) {
        e.detachEvent('on' + t, f);
    }),
    operations: [],
    canvas: {},
    ctx: {},
    mindMaps: [],
    opened: {},
    nextId: 1,
    x: 0,
    y: 0,
    oldX: 0,
    oldY: 0,
    resizingW: false,
    sliding: false,
    newNode: false,
    oldId: 0,
    oldFocus: 0,
    minYl: [],
    minYr: [],
    doMove: false,
    doSort: false,
    movingId: 0,
    sortingId: 0,
    parentX: 0,
    parentY: 0,
    movingRig: 0,
    ignoreEdit: false,
    mouseDrag: false,
    mouseDragId: 0,
    mouseDragToR: 0,
    mouseDragTimer: false,
    mouseDradOb: [],
    selectedNode: 0,
    selectedNodeR: 1,
    countY: [],
    saveAs: false,
    widestNodeL: [],
    widestNodeR: [],
    farthestX: 0,
    farthestY: 0,
    scrollTimer: false,
    allowSelect: false,
    printURL: "print_mindmap.php?time="+ new Date().getTime(), //"http://localhost/print_mindmap.php",//
    canvasCon: document.getElementById('canvasMimic'),
    style: [
        {"id": 1, "bordeCl": "#2288a2", "textClStyle": "st1", "nodeCl": "#79cee3", "lineCol": "#2288a2"},
        {"id": 2, "bordeCl": "#a27b22", "textClStyle": "st1", "nodeCl": "#e3c379", "lineCol": "#a27b22"}
    ],
    vleSavingMessageFlag: false, // Just a flag to decide whether to show a message about not saving to VLE
    courseId: VLE.get_param('course_id') || VLE.get_param('_c'),
    documentId: VLE.get_param('document_id') || VLE.get_param('_i'),
    activityId: VLE.get_param('activity_id') || VLE.get_param('_a'),
    previousValues: undefined, // Leave undefined to pass as a default param to the VLE functions    
    evA: function(ev) {
        var e = ev || window.event;
        var ob = mindmap.getOb(e);
        if (typeof ob === "undefined" || typeof ob.getAttribute === "undefined")
            return;

        var s = mindmap,
                a = ob.getAttribute(s.readAttr);

        if (a === null || a === '')
            return;
        if (typeof (s.operations[e.type]) !== 'undefined' && typeof (s.operations[e.type][a]) !== 'undefined')
            s.operations[e.type][a](e);

        if (e.keyCode === 9 && e.type === "keyup") {

            if (document.activeElement.getAttribute("data-x") === "o3") {
                var ob = document.getElementById('extraMenu');
                if (s.isvisible(ob)) {
                    var el = document.getElementById('menSh');
                    s.hide(ob);
                    el.innerHTML = 'More';
                    el.setAttribute("title", "More - Show extra actions");

                }
                var id = document.activeElement.id.split('_');

                s.selectedNode = id[1] * 1;
                s.selectedNodeR = id[2] * 1;
            }
        }
    },
    /*
     * 
     * @param {event} e
     * @returns returns element of event
     * 
     */
    getOb: function(e) {
        if (e && e.target)
            return e.target;
        else
            return e.srcElement;
    },
    /*
     * 
     * Make  ajax call
     * @param {object} ob - method (POST/GET), error (function executed on error), action (function executed on success), url, data
     *
     */
    ajax: function(ob)
    {
        var xmlhttp = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        xmlhttp.onreadystatechange = function()
        {

            if (xmlhttp.readyState === 4 && xmlhttp.status === 200)
                ob['action'](xmlhttp.responseText);
            else if (!is_ie8 && xmlhttp.readyState > 1 && xmlhttp.status === 404)
                ob['error'](xmlhttp.responseText);
        };
        xmlhttp.open(ob['method'], ob['url'], true);
        try {
            xmlhttp.withCredentials = true;
            if (ob['method'] === 'POST') {
                xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            }
            xmlhttp.send(ob['data']);
        } catch (e) {
            mindmap.hide(document.getElementById('printData'));
            mindmap.show(document.getElementById('menuCon'));
            mindmap.show(document.getElementById('visibleM').getElementsByTagName('li'));
            mindmap.hide(document.getElementById('cancelM'));
            mindmap.show(document.getElementById('canvasMimic'));
            document.getElementById('o_0_1').focus();
            alert('In this browser we not support printing. If you want to print please use modern browser or you can save as image');
        }

    },
    /*
     * 
     * Hide element or elements
     * @param {element} e
     *
     */
    hide: function(e) {
        if (e && e.length !== undefined) {
            var i = e.length;
            while (i--)
                e[i].style.display = 'none';
        } else if (e)
            e.style.display = 'none';
    },
    /*
     * 
     * Show hidden element
     * @param {element} e
     * 
     */
    show: function(e) {
        if (e && e.length !== undefined) {
            var i = e.length;
            while (i--)
                e[i].style.display = 'block';
        } else if (e)
            e.style.display = 'block';
    },
    /*
     * 
     * Removes element from dom
     * @param {element} e
     * 
     */
    remove: function(e) {
        if (e && e.length !== undefined) {
            var i = e.length;
            while (i--)
                e[i].parentNode.removeChild(e[i]);
        } else if (e)
            e.parentNode.removeChild(e);
    },
    /*
     * 
     * Removes element from dom as long as its parent isn't something or other!
     * Might need redoing if we can make it more generically useful, but unlikely...
     * @param {element} e
     * 
     */
    removeSpecial: function(e) {
        if (e && e.length !== undefined) {
            var i = e.length;
            while (i--) {
                if (e[i].parentNode.tagName.toUpperCase() !== 'CANVAS') {
                    e[i].parentNode.removeChild(e[i]);
                }
            }

        } else if (e)
            e.parentNode.removeChild(e);
    },
    /*
     * 
     * Adds element to dom
     * @param {element} e - conteiner to with will be inserted
     * @param {element} child - element with needs to inserted
     * 
     */
    append: function(e, child) {
        if (e && child)
            e.appendChild(child);
    },
    /*
     * 
     * Checks is element visible
     * @param {element} e
     * @returns {Boolean}
     */
    isvisible: function(e) {
        if (e && e.length !== undefined) {
            var i = e.length;
            while (i--)
                if (e[i].offsetWidth > 0 && e[i].offsetHeight > 0)
                    return true;
        } else if (e) {
            if (e.offsetWidth > 0 && e.offsetHeight > 0) {
                if (e.style.display !== '' && e.style.display !== 'none') {
                    return true;
                }
            }
        }
        return false;
    },
    /*
     * 
     * Checks if class name exist
     * @param {element} e
     * @param {string} c
     * @returns {Boolean}
     */
    hasClass: function(e, c) {

        if (e && typeof (e.length) !== 'undefined') {
            var i = e.length;
            while (i--)
                if (e[i].classList.contains(c))
                    return true;
        } else if (e)
            if (e.classList.contains(c))
                return true;
        return false;
    },
    /*
     * 
     * Add class to element
     * @param {element} e
     * @param {String} c
     * @returns {Boolean}
     */
    addClass: function(e, c) {

        if (e && e.length !== undefined) {
            var i = e.length;
            while (i--)
                if (e[i].classList.add(c))
                    return true;
        } else if (e)
            if (e.classList.add(c))
                return true;
        return false;
    },
    /*
     * 
     * Removes class name from element
     * @param {element} e
     * @param {String} c
     * @returns {Boolean}
     */
    removeClass: function(e, c) {

        if (e && e.length !== undefined) {
            var i = e.length;
            while (i--)
                if (e[i].classList.remove(c))
                    return true;
        } else if (e)
            if (e.classList.remove(c))
                return true;
        return false;
    },
    replaceSem: function(st) {
        if (typeof st !== "undefined" && st)
            return st.replace(new RegExp('&', 'g'), '&amp;').replace(new RegExp('<', 'g'), '&lt;').replace(new RegExp('>', 'g'), '&gt;').replace(new RegExp('"', 'g'), '&quot;');
        else
            return "";
    },
    replaceSemBack: function(st) {
        return st.replace(new RegExp('&amp;', 'g'), '&').replace(new RegExp('&lt;', 'g'), '<').replace(new RegExp('&gt;', 'g'), '>').replace(new RegExp('&quot;', 'g'), '"');
    },
    /*
     * 
     * This function add extra functionality for ie8
     */
    registerClassList: function() {
        if (typeof (document.documentElement.classList) === 'object')
            return;

        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function(o, s) {
                for (var i = (s || 0), j = this.length; i < j; i++) {
                    if (this[i] === o) {
                        return i;
                    }
                }
                return -1;
            };
        }

        var prototype = Array.prototype,
                indexOf = prototype.indexOf,
                slice = prototype.slice,
                push = prototype.push,
                splice = prototype.splice,
                join = prototype.join;

        function DOMTokenList(e) {
            this._element = e;
            if (e.className !== this._classCache) {
                this._classCache = e.className;

                if (!this._classCache)
                    return;

                var classes = this._classCache.replace(/^\s+|\s+$/g, '').split(/\s+/),
                        i,
                        to = classes.length;

                for (i = 0; i < to; i++) {
                    push.call(this, classes[i]);
                }
            }
        }

        function setToClassName(e, c) {
            e.className = c.join(' ');
        }

        DOMTokenList.prototype = {
            add: function(t) {
                if (this.contains(t))
                    return;
                push.call(this, t);
                setToClassName(this._element, slice.call(this, 0));
            },
            contains: function(t) {
                return indexOf.call(this, t) !== -1;
            },
            item: function(i) {
                return this[i] || null;
            },
            remove: function(t) {
                var i = indexOf.call(this, t);
                if (i === -1) {
                    return;
                }
                splice.call(this, i, 1);
                setToClassName(this._element, slice.call(this, 0));
            },
            toString: function() {
                return join.call(this, ' ');
            },
            toggle: function(t) {
                if (!this.contains(t)) {
                    this.add(t);
                } else {
                    this.remove(t);
                }

                return this.contains(t);
            }
        };

        window.DOMTokenList = DOMTokenList;

        function defineElementGetter(o, p, g) {
            if (Object.defineProperty) {
                Object.defineProperty(o, p, {
                    get: g
                });
            } else {
                o.__defineGetter__(p, g);
            }
        }
        var elementPrototype = typeof HTMLElement !== "undefined" ? HTMLElement.prototype : Element.prototype;
        defineElementGetter(elementPrototype, 'classList', function() {
            return new DOMTokenList(this);
        });
    },
    /*
     * 
     * For trigering event for element
     * @param {element} e
     * @param {string} ev
     * 
     */
    trigger: function(e, ev) {
        if (document.createEventObject) {
            var evt = document.createEventObject();
            e.fireEvent('on' + ev, evt);
        }
        else {
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent(ev, true, true);
            e.dispatchEvent(evt);
        }

    },
    /******************************************************************/
    /******************************* Mind map functions ******************/

    /*
     * Preparing canvas for draw
     * @returns {undefined}
     */
    prepareCanvas: function() {
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        this.canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    },
    /*
     * Drawing main node as cloud
     * @param {INTEGER} x
     * @param {INTEGER} y
     * @param {INTEGER} width
     * @param {INTEGER} heigth
     * @param {INTEGER} st - style id defined in this object style array of object's
     * @returns {undefined}
     */
    drawCloud: function(x, y, width, heigth, st) {
        var ctx = this.ctx;
        ctx.beginPath();
        // @TODO do math
        ctx.moveTo(x, y - heigth / 2);
        ctx.bezierCurveTo(x - 40, y - heigth / 2, x - 40, y + heigth / 2, x, y + heigth / 2);
        ctx.bezierCurveTo(x - 30, y + heigth / 2 + 20, x + 40, y + heigth / 2 + 20 + 40, x + 40 + 20, y + heigth / 2 + 20 + 10);
        ctx.bezierCurveTo(x + 40 + 20, y + heigth / 2 + 20 + 10 + 30, x + 40 + 20 + width - 40, y + heigth / 2 + 20 + 10 + 30, x + 40 + 20 + width - 40, y + heigth / 2 + 20 + 10);
        ctx.bezierCurveTo(x + 40 + 20 + width - 40 + 10, y + heigth / 2 + 20 + 40, x + 40 + 20 + width - 40 + 10 + 40 + 30, y + heigth / 2 + 20, x + 40 + 20 + width - 40 + 10 + 40 + 10, y + heigth / 2);

        ctx.bezierCurveTo(x + 40 + 20 + width - 40 + 10 + 40 + 10 + 40, y + heigth / 2, x + 40 + 20 + width - 40 + 10 + 40 + 10 + 40, y - heigth / 2, x + 40 + 20 + width - 40 + 10 + 40 + 10, y - heigth / 2);
        ctx.bezierCurveTo(x + 40 + 20 + width - 40 + 10 + 40 + 30, y - heigth / 2 - 20, x + 40 + 20 + width - 40 + 10, y - heigth / 2 - 20 - 40, x + 40 + 20 + width - 40, y - heigth / 2 - 20);
        ctx.bezierCurveTo(x + 40 + 20 + width - 40, y - heigth / 2 - 20 - 10 - 30, x + 40 + 20, y - heigth / 2 - 20 - 10 - 30, x + 40 + 20, y - heigth / 2 - 20 - 10);
        ctx.bezierCurveTo(x + 40, y - heigth / 2 - 20 - 40, x - 30, y - heigth / 2 - 20, x, y - heigth / 2);

        ctx.closePath();
        ctx.lineWidth = 1;
        var len = this.style.length;
        while (len--) {
            if (this.style[len].id === st) {
                ctx.fillStyle = this.style[len].nodeCl;
                ;
                ctx.strokeStyle = this.style[len].lineCol;
                ;
            }
        }
        ctx.fill();
        ctx.stroke();

    },
    /*
     * Drawing node on canvas
     * @param {INTEGER} x
     * @param {INTEGER} y
     * @param {INTEGER} width
     * @param {INTEGER} heigth
     * @param {INTEGER} st - style id defined in this object style array of object's
     * @returns {undefined}
     */
    drawNode: function(x, y, width, heigth, st) {
        var ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.bezierCurveTo(x, y + heigth / 2, x + width, y + heigth / 2, x + width, y);
        ctx.bezierCurveTo(x + width, y - heigth / 2, x, y - heigth / 2, x, y);

        ctx.closePath();
        ctx.lineWidth = 1;
        var len = this.style.length;
        while (len--) {
            if (this.style[len].id === st) {
                ctx.fillStyle = this.style[len].nodeCl;
                ;
                ctx.strokeStyle = this.style[len].lineCol;
                ;
            }
        }
        ctx.fill();
        ctx.stroke();
    },
    /*
     * Drawing line on canvas
     * @param {INTEGER} x
     * @param {INTEGER} y
     * @param {INTEGER} x1
     * @param {INTEGER} y1
     * @param {INTEGER} style - style id defined in this object style array of object's
     * @returns {undefined}
     */
    drawLine: function(x, y, x1, y1, style) {
        var ctx = this.ctx;
        var len = this.style.length;
        while (len--) {
            if (this.style[len].id === style)
                ctx.strokeStyle = this.style[len].lineCol;
        }
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.closePath();
    },
    /*
     * Getting mind map's from server and prepearing for opening
     * @returns {Boolean}
     */
    loadMindmap: function() {
        var get_data = [],
                activity_id = this.activityDataId;

        get_data.push(activity_id);

        VLE.get_server_data(true, get_data,
                function(values) {
                    var session_data = {};

                    if (values[activity_id] !== null && values[activity_id] !== '') {
                        mindmap.mindMaps = JSON.parse(values[activity_id]);
                    }
                    if (mindmap.isCurrentMapInSession()) {
                        session_data = JSON.parse(window.sessionStorage.getItem(activity_id));
                        mindmap.openMapFromSession(session_data.current_map.id);
                    } else {
                        mindmap.openMap();
                    }
                },
                function getdataerror(message) {
                    var saved_data = [],
                            session_data = {};

                    if (message === null) {
                        if (window.localStorage) {
                            if (window.localStorage.getItem(activity_id) !== null) {
                                saved_data = window.localStorage.getItem(activity_id);
                                mindmap.mindMaps = JSON.parse(saved_data);
                            }
                        }
                        if (mindmap.isCurrentMapInSession()) {
                            session_data = JSON.parse(window.sessionStorage.getItem(activity_id));
                            mindmap.openMapFromSession(session_data.current_map.id);
                        } else {
                            mindmap.openMap();
                        }
                    } else {
                        // Decide what to do if something does go wrong
                        alert("Error. Unable to get VLE or Local storage data.");
                    }
                }, this.activityId, this.documentId, this.courseId
                );
    },
    /*
     * Shows dialog for open mind map and loads values to select
     * @returns {Boolean}
     */
    openMap: function() {
        this.nextId = 1;
        var leng = this.mindMaps.length;
        this.hide(document.getElementById('canvasMimic'));
        if (leng > 0) {
            var ob = document.getElementById('openEx'),
                    newOpt = new Option('Please select', 0);
            var length = ob.options.length;
            while (length--) {
                ob.options[length] = null;
            }
            ob.add(newOpt);
            while (leng--) {
                newOpt = new Option(this.mindMaps[leng].title, this.mindMaps[leng].id);
                if (typeof this.mindMaps[leng].title !== "undefined")
                    ob.add(newOpt);
            }
        }
        this.show(document.getElementById('sheeld'));
        this.allowSelect = true;
        this.show(document.getElementById('openOrNew'));
        this.hide(document.getElementById('menuCon'));

    },
    /*
     * Creating new mind map
     * @param {String} title
     * @returns {Boolean}
     */
    createMap: function(title) {
        var s = this;
        s.nextId = 1;

        if (title.trim() !== "") {
            var map = {"id": new Date().getTime(), "title": title.trim(), "map": [{"id": 0, "title": "Double click to edit", "posX": 235, "posY": 250, "style": 1, "toRight": 1, "map": []}]};
            s.opened = map;
            document.title = s.opened.title;
            document.getElementById('mapTitle').innerHTML = s.replaceSem(s.opened.title);
            s.hide(document.getElementById('sheeld'));
            s.allowSelect = false;
            s.hide(document.getElementById('openOrNew'));
            s.show(document.getElementById('menuCon'));
            s.show(document.getElementById('visibleM').getElementsByTagName('li'));
            s.hide(document.getElementById('cancelM'));
            s.show(document.getElementById('canvasMimic'));
            s.drawMindMap(map.map);
            s.saveMindMap();
            s.setCurrentMapSessionData();
            document.getElementById('o_0_1').focus();

        } else {
            alert('Please enter title for new mind map');
        }
        return true;
    },
    /*
     * Saving copy of map
     * @param {String} title
     * @returns {undefined}
     */
    saveMapAs: function(title) {
        var s = this;
        s.saveAs = false;
        var map = JSON.parse(JSON.stringify(s.opened));
        map.id = new Date().getTime();
        map.title = title.trim();
        s.opened = map;
        document.title = s.opened.title;
        document.getElementById('mapTitle').innerHTML = s.replaceSem(s.opened.title);
        s.drawMindMap(s.opened.map);
        s.saveMindMap();
        document.getElementById('o_0_1').focus();
    },
    /*
     * Saving mind map to server or local storage if local
     * @returns {Boolean}
     */
    saveMindMap: function() {
        var json_object_to_save = {},
                activity_id = this.activityDataId,
                i = 0,
                max = this.mindMaps.length,
                json_data_string = "",
                is_new_map = true,
                that = this;

        // Cycle through the saved mindmaps and update the currently used one
        for (; i < max; i += 1) {
            if (this.mindMaps[i].id === this.opened.id) {
                this.mindMaps[i] = this.opened;
                is_new_map = false;
            }
        }
        if (is_new_map) {
            this.mindMaps.push(this.opened);
        }

        json_data_string = JSON.stringify(this.mindMaps);
        json_object_to_save[activity_id] = json_data_string;

        VLE.set_server_data(true, json_object_to_save,
                function() {
                    // Do nothing as successsfully saved to VLE we assume!
                },
                function(message) {
                    if (message === null) {
                        // Do your stuff with local storage as not running on VLE					
                        if (window.localStorage) {
                            window.localStorage.setItem(activity_id, json_data_string);
                        }
                        if (!that.vleSavingMessageFlag) {
                            that.vleSavingMessageFlag = true;
                            if (!that.isVLEMessageInSession()) {
                                alert("Any data entered in this activity will only be saved locally on this device; it will not be transferred to the main module website.");
                            }
                            that.setVLEMessageSessionData();
                        }
                    } else {
                        alert("No connection. Any unsaved data will be lost if you close this browser or tab.");
                    }
                }, this.previousValues, null, this.activityId, this.documentId, this.courseId
                );
    },
    /*
     * Creates new node from given node id
     * @param {Integer} id - Selected node id
     * @param {Integer} toRight - is selected node on right or left of main node
     * @returns {Boolean}
     */
    addNode: function(id, toRight) {
        this.newNode = true;
        if (this.showAsTree)
            toRight = 1;
        this.show(document.getElementById('sheeld'));
        this.allowSelect = true;
        this.hide(document.getElementById('menuCon'));
        this.hide(document.getElementById('canvasMimic'));
        this.show(document.getElementById('openOrNew1'));

        var ob = document.getElementById('nodeT');
        ob.setAttribute('data', 'e_' + id + '_' + toRight);
        ob.value = '';
        ob.focus();
        document.getElementById('charC').innerHTML = this.replaceSem(ob.value.length);

        return true;
    },
    /*
     * Moves node branch to another node
     * @param {type} toRight - new parent node is on right or left
     * @param {type} toId - node ID to with will be moved
     * @returns {Boolean}
     */
    moveNode: function(toId, toRight) {
        if (this.showAsTree)
            toRight = 1;
        var s = this;
        s.findNode(s.movingId, s.opened.map, function(map, l) {
            var m = map[l];
            m.toRight = toRight;
            s.updateToRight(m.map, toRight);
            //console.log(m)
            map.splice(l, 1);
            s.findNode(toId, s.opened.map, function(map, l) {
                map[l].map.push(m);
                var moId = s.movingId;
                s.movingId = 0;
                s.doMove = false;
                s.show(document.getElementById('menuCon'));
                s.show(document.getElementById('visibleM').getElementsByTagName('li'));
                s.hide(document.getElementById('cancelM'));
                s.removeClass(s.canvasCon, 'move');
                s.drawMindMap(s.opened.map);
                s.saveMindMap();
                document.getElementById('o_' + moId + '_' + toRight).focus();

            });
        });

        return true;
    },
    /*
     * Setting flags to right (1) or left (0) for given branch
     * @param {Array of Objects} map - maps branch
     * @param {Integer} val - put to right (1) or left (0)
     * @returns {undefined}
     */
    updateToRight: function(map, val) {
        var mL = map.length;
        while (mL--) {
            map[mL].toRight = val;
            if (map[mL].map.length > 0)
                this.updateToRight(map[mL].map, val);
        }

    },
    /*
     * Delets selected node execpt main node (id === 0)
     * @param {type} id - selected node ID
     * @returns {Boolean}
     */
    deleteNode: function(id) {

        this.findNode(id * 1, this.opened.map, function(map, l) {
            map.splice(l, 1);
        });
        this.drawMindMap(this.opened.map);
        this.saveMindMap();
        document.getElementById('o_0_1').focus();
        return true;
    },
    /*
     * Searching for node inside map based on id. Then faiding calling callback passing tu callback array in witch object exist and aoject index
     * @param {Integer} id
     * @param {Array of objects} map
     * @param {Function} callback
     * @returns {Boolean}
     */
    findNode: function(id, map, callback) {
        var l = map.length;

        while (l--) {
            if (map[l].id === id) {
                callback(map, l);
                return true;
            }
            if (map[l].map.length > 0) {
                if (this.findNode(id, map[l].map, callback))
                    return true;
            }
        }
        return false;

    },
    /*
     * Searching parent node based on id
     * @param {Integer} id
     * @param {Array of objects} map
     * @returns {Boolean}
     */
    findNodeParent: function(id, map) {
        var l = map.length;

        while (l--) {
            if (map[l].id === id) {
                return true;
            }
            if (map[l].map.length > 0) {
                var r = this.findNodeParent(id, map[l].map);
                if (r === true)
                    return map[l].id;
                if (r === 0 || r > 0)
                    return r;
            }
        }
        return false;

    },
    /*
     * Getting total count of nodes in right and left
     * @returns {Array}
     */
    getNodeCountLR: function() {

        var l, l1 = this.opened.map[0].map.length;
        l = l1;

        var count = 0;
        var r = [];
        while (l1--) {
            if (this.opened.map[0].map[l1].toRight === 0 && !this.showAsTree)
                count++;
        }
        r.push(count);
        count = 0;
        while (l--) {
            if (this.opened.map[0].map[l].toRight === 1 || this.showAsTree)
                count++;
        }
        r.push(count);

        return r;
    },
    /*
     * Creates new node to selected node
     * @param {Integer} id selected node id
     * @param {Html element} ob - is field of input for title
     * @param {Integer} toRight
     * @returns {Boolean}
     */
    createNode: function(id, ob, toRight) {
        if (this.showAsTree)
            toRight = 1;
        if (ob.value.trim().replace(/\t/g, "") === "" && this.isvisible(document.getElementById('openOrNew1'))) {
            ob.value = '';
            alert('Please add title for node!');
            ob.focus();
            return false;
        }

        if (typeof toRight === "undefined" || isNaN(toRight)) {

            var count = this.getNodeCountLR();

            if (count[0] >= count[1])
                toRight = 1;
            else
                toRight = 0;
        }
        var s = this;
        if (s.isvisible(document.getElementById('openOrNew1'))) {
            this.findNode(id, this.opened.map, function(map, id) {
                var el = document.createElement('a');
                el.setAttribute("class", "node");
                el.innerHTML = s.replaceSem(ob.value.trim());
                s.append(document.getElementsByTagName('body')[0], el);
                var width1 = el.innerWidth || el.clientWidth;
                var heith1 = el.innerHeight || el.clientHeight;
                s.remove(el);

                map[id].map.push({"id": s.nextId, "title": ob.value.trim(), "posX": 235, "posY": 50, "style": 2, "toRight": toRight, "width": width1, "height": heith1, "map": []});

                s.hide(document.getElementById('openOrNew1'));
                s.hide(document.getElementById('sheeld'));
                s.allowSelect = false;
                s.show(document.getElementById('menuCon'));
                s.show(document.getElementById('visibleM').getElementsByTagName('li'));
                s.hide(document.getElementById('cancelM'));
                s.show(document.getElementById('canvasMimic'));
                var newId = s.nextId;
                s.nextId++;
                s.drawMindMap(s.opened.map);
                s.saveMindMap();
                document.getElementById('o_' + newId + '_' + toRight).focus();

                s.newNode = false;
            });
        }
        return true;
    },
    /*
     * Checking is node in visible area
     * @param {Html element} ob - selected node
     * @returns {Boolean}
     */
    isNodeVisible: function(ob) {
        var s = this,
                width = s.canvasCon.innerWidth || s.canvasCon.clientWidth,
                height = s.canvasCon.innerHeight || s.canvasCon.clientHeight,
                obL = ob.style.left.split('px')[0] * 1,
                obT = ob.style.top.split('px')[0] * 1,
                obW = ob.innerWidth || ob.clientWidth,
                obH = ob.innerHeight || ob.clientHeight;

        if (s.canvasCon.scrollLeft < obL && (s.canvasCon.scrollLeft + width) > (obL + obW) && s.canvasCon.scrollTop < obT && (s.canvasCon.scrollTop + height) > (obT + obH)) {
            return true;
        }

        return false;
    },
    /*
     * Bringing selected node to visible area
     * @param {Html element} ob - selected node
     * @returns {Boolean}
     */
    focusNode: function(ob) {
        if (this.mouseDrag)
            return false;
        var s = this,
                width = s.canvasCon.innerWidth || s.canvasCon.clientWidth,
                height = s.canvasCon.innerHeight || s.canvasCon.clientHeight,
                obL = ob.style.left.split('px')[0] * 1,
                obT = ob.style.top.split('px')[0] * 1,
                obW = ob.innerWidth || ob.clientWidth,
                obH = ob.innerHeight || ob.clientHeight;

        var moveL = obL + obW / 2 - width / 2;
        if (moveL < 0)
            moveL = 0;
        if (moveL > s.canvasCon.scrollWidth)
            moveL = s.canvasCon.scrollWidth;
        var moveT = obT + obH / 2 - height / 2;
        if (moveT < 0)
            moveT = 0;
        if (moveT > s.canvasCon.scrollHeight)
            moveT = s.canvasCon.scrollHeight;
        s.canvasCon.scrollLeft = moveL;
        s.canvasCon.scrollTop = moveT;
    },
    /*
     * Cheking does id belong to map one level
     * @param {Array of objects} map
     * @param {Integer} id
     * @returns {Boolean}
     */
    isInMap: function(map, id) {
        var l = map.length;
        while (l--) {
            if (map[l].id === id)
                return true;
        }
        return false;
    },
    /*
     * Check existing id in map an his childrens
     * @param {Array of objects} map
     * @param {Integer} id
     * @returns {Boolean}
     */
    isExistInMap: function(map, id) {
        var l = map.length;
        while (l--) {
            if (map[l].id === id)
                return true;
            if (this.isExistInMap(map[l].map, id))
                return true;
        }
        return false;
    },
    /*
     * Counts nodes in given branch
     * @param {Array of objects} map
     * @param {Integer} toR - left (0) or right (1)
     * @returns {Number}
     */
    countItems: function(map, toR) {
        if (this.showAsTree)
            toR = 1;
        var len = map.length,
                i = 0;

        while (len--) {
            if (map[len].toRight === toR)
                i++;
        }
        return i;
    },
    /*
     * Creates mind map
     * @param {Array of objects} map
     * @param {Object} parent - object of special paramaters from parent
     * @param {Integer} level - how deep is in tree
     * @param {boolen} doMove - generate branch as div's
     * @returns {Boolean}
     */
    drawMindMap: function(map, parent, level, doMove) {
        var s = this,
                len = map.length,
                con = document.getElementById('canvasMimic'),
                i = -1,
                //widest = s.getWidestNode(map, 1),
                moving = false,
                node0 = 0;
        //isInMap = false;

        /*if (s.doSort) {
         isInMap = s.isInMap(map, s.sortingId);
         }*/

        if (typeof level === "undefined") {
            level = 0;
            s.minYl = [];
            s.minYr = [];
        }
        if (typeof parent === "undefined") {
            s.widestNodeL = [];
            s.widestNodeR = [];
            s.generateWidestNodeInLevel(s.opened.map, 1, 0);
            s.generateWidestNodeInLevel(s.opened.map, 0, 0);
            s.countY = [];
            var tW = s.getTotalNodeW() * 1,
                    tH = s.getTotalNodeH(s.opened.map, 1);
            var i = s.widestNodeL.length;
            while (i--) {
                node0 = node0 + s.widestNodeL[i] * 1 + 30;
            }
            node0 = node0 - 30;

            s.countY = [];
            var tH1 = s.getTotalNodeH(s.opened.map, 0);
            if (tH < tH1)
                tH = tH1;

            var el = con.getElementsByTagName('a');
            s.remove(el);
            el = con.getElementsByTagName('div');
            s.removeSpecial(el);
            var cw = s.canvasCon.innerWidth || s.canvasCon.clientWidth,
                    ch = s.canvasCon.innerHeight || s.canvasCon.clientHeight;

            if (tW < cw)
                tW = cw;
            s.canvas.width = tW;

            if (isNaN(tH) || tH < ch)
                tH = ch;

            s.canvas.height = tH;
            s.ctx.clearRect(0, 0, s.canvas.width, s.canvas.height);

        }
        len = len - 1;
        var nextY = 0,
                z = 0;

        while (i++ < len) {

            if (map[i].toRight === 1 || s.showAsTree) {

                var el, elS, elS1, elS2, elS3;
                if (s.doMove && map[i].id === s.sortingId || doMove) {
                    var exCl = '';
                    if (map[i].id !== 0 && map[i].id === s.sortingId)
                        exCl = 'selected';
                    el = document.createElement('div');
                    el.setAttribute("class", "node st" + map[i].style + " move-this " + exCl);
                } else {
                    el = document.createElement('a');
                    el.setAttribute("href", "#");
                    el.setAttribute("onselectstart", "return false;");
                    if (!s.doMove /*&& !is_firefox*/ && !is_ie8)
                        el.setAttribute("draggable", "true");
                    else
                        el.setAttribute("draggable", "false");
                    el.setAttribute("class", "node st" + map[i].style);
                }

                el.setAttribute("data-x", "o3");
                el.setAttribute("id", "o_" + map[i].id + "_" + map[i].toRight);
                el.innerHTML = s.replaceSem(map[i].title);


                if (s.doMove && z === 0 && map[i].id !== 0 && !doMove) { // && map[i].toRight === s.movingRig
                    elS1 = document.createElement('a');
                    elS1.setAttribute("href", "#");
                    elS1.setAttribute("class", "nodeS st" + map[i].style);
                    elS1.setAttribute("data-x", "o9");
                    elS1.setAttribute("id", "f_" + i + '_' + map[i].id + '_' + map[i].toRight);
                    elS1.setAttribute("title", "Insert here");
                    s.append(con, elS1);

                }

                if (s.doMove && map[i].id === 0 && !doMove) {
                    var contR = s.countItems(map[i].map, 1),
                            contL = s.countItems(map[i].map, 0);
                    if ((contR === 0 || contL === 0) && contR !== contL) {
                        elS2 = document.createElement('a');
                        elS2.setAttribute("href", "#");
                        elS2.setAttribute("class", "nodeS st" + map[i].style);
                        elS2.setAttribute("data-x", "o31");
                        if (!s.doMove /*&& !is_firefox*/ && !is_ie8)
                            elS2.setAttribute("draggable", "true");
                        else
                            elS2.setAttribute("draggable", "false");
                        var l = contR === 0 ? 1 : 0;
                        elS2.setAttribute("id", "f_" + l);
                        elS2.setAttribute("title", "Insert here");
                        s.append(con, elS2);
                    }
                }

                s.append(con, el);

                if (s.doMove && map[i].id !== 0 && !doMove) { // && map[i].toRight === s.movingRig
                    elS = document.createElement('a');
                    elS.setAttribute("href", "#");
                    elS.setAttribute("class", "nodeS st" + map[i].style);
                    elS.setAttribute("data-x", "o9");
                    elS.setAttribute("title", "Insert here");
                    elS.setAttribute("id", "f_" + (i + 1) + '_' + map[i].id + '_' + map[i].toRight);
                    s.append(con, elS);

                }

                if (s.doMove && map[i].id !== 0 && !doMove && map[i].map.length === 0 && map[i].id !== s.movingId) {
                    elS3 = document.createElement('a');
                    elS3.setAttribute("href", "#");
                    elS3.setAttribute("class", "nodeS st" + map[i].style);
                    elS3.setAttribute("data-x", "o3");
                    elS3.setAttribute("title", "Insert here");
                    elS3.setAttribute("id", "e_" + map[i].id + "_" + map[i].toRight);
                    s.append(con, elS3);

                }

                var width = el.innerWidth || el.clientWidth,
                        height = el.innerHeight || el.clientHeight;
                width = (width * 1) + 6;
                height = height * 1;

                map[i].width = width;
                map[i].height = height + 2;

                if (s.nextId <= map[i].id * 1)
                    s.nextId = map[i].id * 1 + 1;

                if (map[i].id === 0) {
                    //s.canvas.width = s.canvas.width + width;

                    if (node0 < 31)
                        if (s.showAsTree)
                            node0 = width / 2 + 100;
                        else
                            node0 = s.canvas.width / 2 - (width / 2);
                    else if (s.showAsTree)
                        node0 = width / 2 + 100;
                    map[i].posX = node0;//s.canvas.width / 2 - (width) - 13;
                    map[i].posY = height + 200;//s.canvas.height / 2 - (height / 2); //
                    nextY = map[i].posY;
                    s.parentX = map[i].posX;
                    s.parentY = map[i].posY;
                }

                var x = map[i].posX,
                        y = nextY;
                if (typeof parent !== "undefined") {
                    x = parent.minX;
                    if (z === 0) {
                        var hei1 = s.getTotalNodeHthisL(map, 1);
                        nextY = parent.y - (hei1 / 2);
                        if (nextY < 100)
                            nextY = 100;
                        y = map[i].posY = nextY;
                        nextY = nextY + height + 27;
                    } else {
                        nextY = nextY + height + 27;
                    }
                } else {
                    y = (y - (height / 2)) * 1;
                    x = (x - (width / 2)) * 1;
                }

                var hei2 = s.getTotalNodeHthisL(map[i].map, 1);

                if (map[i].map.length > 0) {
                    if (typeof s.minYr[level + 1] !== "undefined" && s.minYr[level + 1] !== 0) {
                        if ((s.minYr[level + 1] + 27) < (nextY - height - 27 - (hei2 / 2)) && map[i].map.length === 0) {
                            y = nextY;
                            nextY = nextY + height + 27;
                        } else {
                            var y1 = s.minYr[level + 1] + (hei2 / 2);
                            if (y1 > y)
                                y = y1;
                            nextY = y + height + 27;
                        }
                    } else {
                        y = nextY - height - 27 + (hei2 / 2) - 27;
                        nextY = y + height + 27;
                    }

                }

                if (s.doMove && map[i].id !== 0 && !doMove) { // && map[i].toRight === s.movingRig
                    var nt = y + height + 3;
                    elS.style.top = nt + 'px';
                    elS.style.left = (x) + 'px';
                    //elS.style.width = (width + 3 * 1) + 'px';
                    if (z === 0) {
                        nt = y - 13;
                        elS1.style.top = nt + 'px';
                        elS1.style.left = (x) + 'px';
                        //elS1.style.width = (width + 3 * 1) + 'px';
                    }
                }

                el.style.top = y + 'px';
                el.style.left = x + 'px';
                el.style.width = (width - 26) + 'px';
                if (map[i].id === 0) {
                    s.parentX = x;
                    s.parentY = y + height / 2;
                    if (s.doMove && ((contR === 0 || contL === 0) && contR !== contL)) {
                        elS2.style.top = (y + (height / 2) - 2.5) + 'px';
                        elS2.style.width = '60px';
                        if (contR === 0)
                            elS2.style.left = (x + width + 10) + 'px';
                        else
                            elS2.style.left = (x - 70) + 'px';
                    }
                }

                if (s.doMove && map[i].id !== 0 && !doMove && map[i].map.length === 0 && map[i].id !== s.movingId) {
                    elS3.style.top = (y + (height / 2) - 5) + 'px';
                    //elS3.style.width = '50px!important';
                    elS3.style.left = (x + width + 6) + 'px';
                }

                map[i].posX = x;
                map[i].posY = y;

                if (s.doMove && map[i].id === s.movingId)
                    moving = true;
                else
                    moving = false;
                var bMove = doMove;
                if (moving)
                    bMove = true;
                s.drawMindMap(map[i].map, {"x": x + width, "y": y + (height / 2), "style": map[i].style, "minX": s.widestNodeR[level] + x + 30, "id": map[i].id}, (level + 1), bMove);
                if (typeof parent !== "undefined")
                    s.drawLine(parent.x - 27, parent.y, x, y + (height / 2), parent.style);
                z++;
                s.minYr[level] = nextY;
                if (s.farthestX < (x + width + 30))
                    s.farthestX = (x + width + 30);
                if (s.farthestY < (y + height + 27))
                    s.farthestY = (y + height + 27);
            }
        }


        nextY = 0;
        i = -1;
        if (typeof parent !== "undefined" && parent.id === 0) {

            parent.x = s.parentX;
            parent.minX = parent.x - 30;
            parent.y = s.parentY;
        }
        z = 0;
        //var widest = s.getWidestNode(map, 0);
        while (i++ < len) {
            if (map[i].toRight === 0 && !s.showAsTree) {

                var el, elS, elS1, elS3;
                if (s.doMove && map[i].id === s.sortingId || doMove) {
                    var exCl = '';
                    if (map[i].id !== 0 && map[i].id === s.sortingId)
                        exCl = 'selected';
                    el = document.createElement('div');
                    el.setAttribute("class", "node st" + map[i].style + " move-this " + exCl);
                } else {
                    el = document.createElement('a');
                    el.setAttribute("href", "#");
                    el.setAttribute("onselectstart", "return false;");
                    if (!s.doMove /*&& !is_firefox*/ && !is_ie8)
                        el.setAttribute("draggable", "true");
                    else
                        el.setAttribute("draggable", "false");
                    el.setAttribute("class", "node st" + map[i].style);
                }

                el.setAttribute("data-x", "o3");
                el.setAttribute("id", "o_" + map[i].id + "_" + map[i].toRight);
                el.innerHTML = s.replaceSem(map[i].title);

                if (s.doMove && map[i].id !== 0 && z === 0 && !doMove) { //&& map[i].toRight === s.movingRig
                    elS1 = document.createElement('a');
                    elS1.setAttribute("href", "#");
                    elS1.setAttribute("class", "nodeS st" + map[i].style);
                    elS1.setAttribute("data-x", "o9");
                    elS1.setAttribute("id", "f_" + i + '_' + map[i].id + '_' + map[i].toRight);
                    elS1.setAttribute("title", "Insert here");
                    s.append(con, elS1);
                }

                s.append(con, el);

                if (s.doMove && map[i].id !== 0 && !doMove) { // && map[i].toRight === s.movingRig
                    elS = document.createElement('a');
                    elS.setAttribute("href", "#");
                    elS.setAttribute("class", "nodeS st" + map[i].style);
                    elS.setAttribute("data-x", "o9");
                    elS.setAttribute("title", "Insert here");
                    elS.setAttribute("id", "f_" + (i + 1) + '_' + map[i].id + '_' + map[i].toRight);
                    s.append(con, elS);

                }

                if (s.doMove && map[i].id !== 0 && !doMove && map[i].map.length === 0 && map[i].id !== s.movingId) {
                    elS3 = document.createElement('a');
                    elS3.setAttribute("href", "#");
                    elS3.setAttribute("class", "nodeS st" + map[i].style);
                    elS3.setAttribute("data-x", "o3");
                    elS3.setAttribute("title", "Insert here");
                    elS3.setAttribute("id", "e_" + map[i].id + "_" + map[i].toRight);
                    s.append(con, elS3);

                }

                var width = el.innerWidth || el.clientWidth,
                        height = el.innerHeight || el.clientHeight;

                width = (width * 1) + 6;
                height = height * 1;
                map[i].width = width;
                map[i].height = height + 2;

                if (s.nextId <= map[i].id * 1)
                    s.nextId = map[i].id * 1 + 1;

                var y = nextY,
                        x = parent.minX;
                //if (level === 1) {
                x = x - width;
                //}
                if (z === 0) {
                    var hei1 = s.getTotalNodeHthisL(map, 0);
                    nextY = parent.y - (hei1 / 2);
                    if (nextY < 100)
                        nextY = 100;
                    y = map[i].posY = nextY;
                    nextY = nextY + height + 27;
                } else {
                    nextY = nextY + height + 27;
                }

                var hei2 = s.getTotalNodeHthisL(map[i].map, 0);

                if (map[i].map.length > 0) {
                    if (typeof s.minYl[level + 1] !== "undefined" && s.minYl[level + 1] !== 0) {
                        if ((s.minYl[level + 1] + 27) < (nextY - height - 27 - (hei2 / 2)) && map[i].map.length === 0) {
                            y = nextY;
                            nextY = nextY + height + 27;
                        } else {
                            var y1 = s.minYl[level + 1] + (hei2 / 2);
                            if (y1 > y)
                                y = y1;
                            nextY = y + height + 27;
                        }
                    } else {
                        y = nextY - height - 27 + (hei2 / 2) - 27;
                        nextY = y + height + 27;
                    }

                }

                if (s.doMove && map[i].id !== 0 && !doMove && map[i].map.length === 0 && map[i].id !== s.movingId) {
                    elS3.style.top = (y + (height / 2) - 5) + 'px';
                    //elS3.style.width = '50px!important';
                    elS3.style.left = (x - 37) + 'px';
                }

                if (s.doMove && map[i].id === s.movingId)
                    moving = true;
                else
                    moving = false;

                var bMove = doMove;
                if (moving)
                    bMove = true;
                s.drawMindMap(map[i].map, {"x": x, "y": y + (height / 2), "style": map[i].style, "minX": x - s.widestNodeL[level] - 30 + width, "id": map[i].id}, (level + 1), bMove);

                if (s.doMove && map[i].id !== 0 && !doMove) { // && map[i].toRight === s.movingRig
                    var nt = y + height + 3;
                    elS.style.top = nt + 'px';
                    elS.style.left = (x + width - 29) + 'px';
                    //elS.style.width = (width - 3 * 1) + 'px';
                    if (z === 0) {
                        nt = y - 13;
                        elS1.style.top = nt + 'px';
                        elS1.style.left = (x + width - 29) + 'px';
                        //elS1.style.width = (width - 3 * 1) + 'px';
                    }
                }

                el.style.top = y + 'px';
                el.style.left = x + 'px';
                el.style.width = (width - 26) + 'px';
                map[i].posX = x;
                map[i].posY = y;

                if (typeof parent !== "undefined") // - width
                    s.drawLine(parent.x + 27, parent.y, x + width, y + (height / 2), parent.style);
                z++;
                s.minYl[level] = nextY;
                if (s.farthestY < (y + height + 27))
                    s.farthestY = (y + height + 27);
            }
        }

        if (level === 0) {
            if (s.canvas.width < s.farthestX) {
                s.canvas.width = s.farthestX;
                s.drawOnliLines(s.opened.map);
            }
            if (s.canvas.height < s.farthestY) {
                s.canvas.height = s.farthestY;
                s.drawOnliLines(s.opened.map);
            }
        }

        return true;
    },
    /*
     * Drawing only lines
     * @param {Array of objects} map
     * @param {Object} parent - object of special paramaters from parent
     * @param {Integer} level - how deep is in tree
     * @returns {Boolean}
     */
    drawOnliLines: function(map, parent, level) {
        var s = this,
                len = map.length,
                i = -1;

        if (typeof level === "undefined") {
            level = 0;
            s.minYl = [];
            s.minYr = [];
        }
        if (typeof parent === "undefined") {
            s.ctx.clearRect(0, 0, s.canvas.width, s.canvas.height);
        }
        len = len - 1;
        var z = 0;

        while (i++ < len) {

            if (map[i].toRight === 1 || s.showAsTree) {

                var width = map[i].width,
                        height = map[i].height,
                        x = map[i].posX,
                        y = map[i].posY;

                if (map[i].id === 0) {
                    s.parentX = x;
                    s.parentY = y + height / 2;
                }

                s.drawOnliLines(map[i].map, {"x": x + width, "y": y + (height / 2), "style": map[i].style, "minX": s.widestNodeR[level] + x + 30 + 24, "id": map[i].id}, (level + 1));
                if (typeof parent !== "undefined")
                    s.drawLine(parent.x - 27, parent.y, x, y + (height / 2), parent.style);
                z++;
            }
        }

        i = -1;
        if (typeof parent !== "undefined" && parent.id === 0) {

            parent.x = s.parentX;
            parent.minX = parent.x - 30;
            parent.y = s.parentY;
        }
        z = 0;

        while (i++ < len) {
            if (map[i].toRight === 0 && !s.showAsTree) {

                var width = map[i].width,
                        height = map[i].height,
                        x = map[i].posX,
                        y = map[i].posY;

                s.drawOnliLines(map[i].map, {"x": x, "y": y + (height / 2), "style": map[i].style, "minX": x - s.widestNodeL[level] - 30 - 24 + width, "id": map[i].id}, (level + 1));

                if (typeof parent !== "undefined")
                    s.drawLine(parent.x + 27, parent.y, x + width, y + (height / 2), parent.style);
                z++;
            }
        }

        return true;
    },
    /*
     * Finding widest node in givem level
     * @param {Array of objects} map
     * @param {Integer} right - right (1) node or left (0)
     * @returns {Number}
     */
    getWidestNode: function(map, right) {
        var len = map.length,
                width = 0;
        while (len--) {
            if (typeof right === "undefined" || map[len].toRight === right || this.showAsTree) {
                var width1 = map[len].width;
                if (width1 > width)
                    width = width1;
            }
        }
        if (width === 0)
            return 0;
        return width;
    },
    /*
     * generating array of widests nodes in levels
     * @param {Array of objects} map
     * @param {Integer} right - right (1) or left (0)
     * @param {Integer} level
     * @returns {undefined}
     */
    generateWidestNodeInLevel: function(map, right, level) {
        var len = map.length,
                width = 0,
                s = this;
        level = level | 0;

        while (len--) {
            if (map[len].toRight === right || map[len].id === 0 || s.showAsTree) {
                var width1 = map[len].width * 1;
                if (width1 > width)
                    width = width1;
                s.generateWidestNodeInLevel(map[len].map, right, level + 1);
            }
        }

        if (right === 1) {
            if (typeof s.widestNodeR[level] === "undefined")
                s.widestNodeR[level] = 0;
            if (s.widestNodeR[level] < width)
                s.widestNodeR[level] = width;
        } else {
            if (typeof s.widestNodeL[level] === "undefined")
                s.widestNodeL[level] = 0;
            if (s.widestNodeL[level] < width)
                s.widestNodeL[level] = width;
        }
    },
    /*
     * Getting sum of widest node in each level
     * @returns {Number}
     */
    getTotalNodeW: function() {
        var s = this,
                width = 0,
                Ll = s.widestNodeL.length,
                Rl = s.widestNodeR.length;

        while (Ll--) {
            width = width + s.widestNodeL[Ll] + 30;
        }

        width = width - s.widestNodeL[0] - 30; //because we have o node in right

        while (Rl--) {
            width = width + s.widestNodeR[Rl] + 30;
        }

        return width + 60;
    },
    /*
     * Returns sum of bigest heigth in each level
     * @param {Array of objects} map
     * @returns {Integer}
     */
    getTotalNodeH: function(map, toRight, level) {
        var s = this,
                len = map.length,
                height = 0,
                i = -1;
        len--;
        if (typeof level === "undefined")
            level = 0;

        while (i++ < len) {
            if (map[i].id === 0)
                height = height + 100;
            if (map[i].toRight === toRight || map[i].id === 0 || s.showAsTree) {
                if (typeof s.countY[level] === "undefined")
                    s.countY[level] = 0;
                var lo = map[i].height * 1,
                        tmp = height;
                if (height > 0)
                    tmp = tmp + 27;
                s.countY[level] = tmp;
                var neXL = level + 1;
                s.getTotalNodeH(map[i].map, toRight, neXL);
                s.countY[level] = s.countY[level] + lo + 27 + 12;
                height = s.countY[level];
            }
        }
        if (height === 0)
            return 0;
        var lback = level - 1;
        if (lback >= 0)
            s.countY[lback] = s.countY[lback] + ((height + 27) / 2);
        return height;
    },
    /*
     * Getting only current level node total height
     * @param {Array of maps} map
     * @param {Integer} toRight
     * @returns {Number}
     */
    getTotalNodeHthisL: function(map, toRight) {
        var len = map.length,
                height = 0;
        while (len--) {
            if (map[len].toRight === toRight || this.showAsTree) {
                if (height > 0)
                    height = height + 27;
                height = map[len].height * 1 + height;
            }
        }
        return height;
    },
    /*
     * Returns element height
     * @param {Html element} obi
     * @returns {Number}
     */
    getNodeHeight: function(obi) {
        var s = this,
                ob = document.getElementsByTagName('body')[0];
        var el = document.createElement('a');
        el.setAttribute("class", "node");
        el.innerHTML = s.replaceSem(obi.title);
        s.append(ob, el);
        var lo = el.innerHeight || el.clientHeight;
        s.remove(el);

        return lo * 1 + 2;
    },
    /*
     * Showing edit dialog. If Id is NULL then editing main node with (id === 0)
     * @param {Integer} id - node id
     * @param {Html element} el - selected element (node)
     * @param {Integer} toR - selected node is on right (1) or on left (0)
     * @returns {Boolean}
     */
    editNode: function(id, el, toR) {

        this.show(document.getElementById('sheeld'));
        this.allowSelect = true;
        this.show(document.getElementById('openOrNew1'));
        this.hide(document.getElementById('menuCon'));
        this.hide(document.getElementById('canvasMimic'));

        var ob = document.getElementById('nodeT');
        ob.setAttribute('data', 'e_' + id + '_' + toR);
        ob.value = this.replaceSemBack(el.innerHTML);
        ob.focus();
        document.getElementById('charC').innerHTML = ob.value.length;

        return true;
    },
    /*
     * @TODO print mind map
     * @returns {Boolean}
     */
    print: function() {
        return true;
    },
    /*
     * Returns kordinates of mouse
     * @param {Event} e
     * @returns {Boolean|Array}
     */
    getMouseXY: function(e) {
        if (typeof e === "undefined" || typeof e.eclientX === "unknown" || typeof e.eclientY === "unknown")
            return false;
        if (typeof e.clientX !== "undefined") {
            return [e.clientX + document.body.scrollLeft, e.clientY + document.body.scrollTop];
        }
        else if (typeof e.targetTouches !== "undefined" && typeof e.targetTouches[0] !== "undefined") {
            return [e.targetTouches[0].pageX, e.targetTouches[0].pageY];
        } else {
            return [e.pageX, e.pageY];
        }


    },
    sortNodeRorL: function(toR) {
        if (this.showAsTree)
            toR = 1;
        var s = this,
                m = [];
        toR = toR * 1;
        s.doSort = false;
        s.doMove = false;

        s.show(document.getElementById('menuCon'));
        s.findNode(s.sortingId, s.opened.map, function(map, l) {
            m = JSON.parse(JSON.stringify(map[l]));
            m.toRight = toR;
            s.updateToRight(m.map, toR);
            map.splice(l, 1);
            s.opened.map[0].map.push(m);

            s.doSort = false;
            s.doMove = false;
            s.drawMindMap(s.opened.map);
            s.saveMindMap();
            s.show(document.getElementById('menuCon'));
            s.show(document.getElementById('visibleM').getElementsByTagName('li'));
            s.hide(document.getElementById('cancelM'));
            document.getElementById('o_' + s.sortingId + '_' + toR).focus();
            s.sortingId = 0;
            s.movingRig = 0;
            s.removeClass(s.canvasCon, 'move');


        });
    },
    sortNode: function(id, toR, level) {
        if (this.showAsTree)
            toR = 1;
        var s = this,
                m = [];
        id = id * 1;
        toR = toR * 1;
        s.doSort = false;
        s.doMove = false;

        s.show(document.getElementById('menuCon'));
        s.show(document.getElementById('visibleM').getElementsByTagName('li'));
        s.hide(document.getElementById('cancelM'));
        s.findNode(s.sortingId, s.opened.map, function(map, l) {
            m = map[l];
            m.toRight = toR;
            s.updateToRight(m.map, toR);

            if (s.isInMap(map, id)) {
                if (level > l) {
                    map.splice(level, 0, m);
                    map.splice(l, 1);
                } else if (level !== l && level !== l + 1) {
                    map.splice(level, 0, m);
                    map.splice((l + 1), 1);
                }
            } else {
                map.splice(l, 1);
                s.findNode(id, s.opened.map, function(map1, l1) {
                    var m1 = map1[l1];
                    m.toRight = m1.toRight;
                    s.updateToRight(m.map, toR);
                    map1.splice(level, 0, m);
                });
            }

            s.doSort = false;
            s.doMove = false;
            s.drawMindMap(s.opened.map);
            s.saveMindMap();
            document.getElementById('o_' + s.sortingId + '_' + toR).focus();
            s.sortingId = 0;
            s.movingRig = 0;
            s.removeClass(s.canvasCon, 'move');

        });
    },
    setMovableObject: function(id) {
        var s = this;
        s.findNode(id * 1, s.opened.map, function(map, l) {
            s.mouseDradOb = [];
            s.mouseDradOb['o_' + id] = document.getElementById('o_' + id + '_' + map[l].toRight);
            s.addClass(s.mouseDradOb['o_' + id], 'transparent');
            s.fillDragOb(map[l].map);
        });
    },
    fillDragOb: function(map) {
        var s = this,
                l = map.length;
        while (l--) {
            s.mouseDradOb['o_' + map[l].id] = document.getElementById('o_' + map[l].id + '_' + map[l].toRight);
            s.addClass(s.mouseDradOb['o_' + map[l].id], 'transparent');
            if (map[l].map.length > 0)
                s.fillDragOb(map[l].map);
        }

    },
    removeTrans: function() {
        var s = this,
                id = s.mouseDragId;

        s.findNode(id, s.opened.map, function(map, l) {
            s.removeClass(document.getElementById('o_' + id + '_' + map[l].toRight), 'transparent');
            s.removeClassTr(map[l].map);
        });
    },
    removeClassTr: function(map) {
        var s = this,
                l = map.length;
        while (l--) {
            s.removeClass(document.getElementById('o_' + map[l].id + '_' + map[l].toRight), 'transparent');
            if (map[l].map.length > 0)
                s.removeClassTr(map[l].map);
        }
    },
    moveTreeWithMouse: function(kor) {
        var s = this;
        // console.log('------->',s.mouseDradOb,s.mouseDragId,s.mouseDradOb['o_'+s.mouseDragId]);
        s.mouseDradOb['o_' + s.mouseDragId].style.left = kor[0] + 'px';
        s.mouseDradOb['o_' + s.mouseDragId].style.top = kor[1] + 'px';
    },
    showSortField: function(map, id, doMove) {  //
        var s = this;
        //s.findNode(id, s.opened.map, function(map, l) {
        var le = map.length,
                i = -1,
                z = 0;
        le--;
        while (i++ < le) {
            if (map[i].id === 0) {
                var el = document.getElementById('o_' + map[i].id + '_' + map[i].toRight);
                var height = el.innerHeight || el.clientHeight,
                        width = el.innerWidth || el.clientWidth;
                if (s.mouseDrag && map[i].id === 0) {
                    var contR = s.countItems(map[i].map, 1),
                            contL = s.countItems(map[i].map, 0),
                            elS2;
                    var el = document.getElementById('o_' + map[i].id + '_' + map[i].toRight);
                    var height = el.innerHeight || el.clientHeight;
                    if ((contR === 0 || contL === 0) && contR !== contL) {
                        elS2 = document.createElement('a');
                        elS2.setAttribute("href", "#");
                        elS2.setAttribute("class", "nodeS st" + map[i].style);
                        elS2.setAttribute("data-x", "o31");
                        elS2.setAttribute("draggable", "true");
                        var l = contR === 0 ? 1 : 0;
                        elS2.setAttribute("id", "f_" + l);
                        elS2.setAttribute("title", "Insert here");
                        s.append(document.getElementById('canvasMimic'), elS2);
                    }
                    if (s.mouseDrag && ((contR === 0 || contL === 0) && contR !== contL)) {
                        elS2.style.top = (map[i].posY + (height / 2) - 2.5) + 'px';
                        elS2.style.width = '60px';
                        if (contR === 0)
                            elS2.style.left = (map[i].posX + width + 10) + 'px';
                        else
                            elS2.style.left = (map[i].posX - 70) + 'px';
                    }

                }

                s.showSortField(map[i].map, id);
            }
            if (map[i].toRight === 1 && map[i].id !== 0 || (s.showAsTree && map[i].id !== 0)) {
                if (!doMove) {
                    var el = document.getElementById('o_' + map[i].id + '_' + map[i].toRight),
                            elS3;
                    var height = el.innerHeight || el.clientHeight,
                            width = el.innerWidth || el.clientWidth;
                    if (z === 0) {
                        var elS1 = document.createElement('a');
                        elS1.setAttribute("href", "#");
                        elS1.setAttribute("class", "nodeS st" + map[i].style);
                        elS1.setAttribute("data-x", "o9");
                        elS1.setAttribute("draggable", "true");
                        elS1.setAttribute("id", "f_" + i + '_' + map[i].id + '_' + map[i].toRight);
                        elS1.setAttribute("title", "Insert here");
                        s.append(s.canvasCon, elS1);
                        elS1.style.left = map[i].posX + 'px';
                        var h = map[i].posY - 13;
                        elS1.style.top = h + 'px';
                    }

                    if (s.mouseDrag && map[i].id !== 0 && !doMove && map[i].map.length === 0 && map[i].id !== s.mouseDragId) {
                        elS3 = document.createElement('a');
                        elS3.setAttribute("href", "#");
                        elS3.setAttribute("class", "nodeS st" + map[i].style);
                        elS3.setAttribute("data-x", "o3");
                        elS3.setAttribute("title", "Insert here");
                        elS3.setAttribute("id", "e_" + map[i].id + "_" + map[i].toRight);
                        s.append(s.canvasCon, elS3);
                        elS3.style.top = (map[i].posY + (height / 2) - 5) + 'px';
                        //elS3.style.width = '55px!important';
                        elS3.style.left = (map[i].posX + width + 6) + 'px';
                    }

                    var elS = document.createElement('a');
                    elS.setAttribute("href", "#");
                    elS.setAttribute("class", "nodeS st" + map[i].style);
                    elS.setAttribute("data-x", "o9");
                    elS.setAttribute("draggable", "true");
                    elS.setAttribute("title", "Insert here");
                    elS.setAttribute("id", "f_" + (i + 1) + '_' + map[i].id + '_' + map[i].toRight);
                    s.append(s.canvasCon, elS);

                    elS.style.left = map[i].posX + 'px';
                    elS.style.top = (map[i].posY + height * 1 + 3) + 'px';
                    z++;
                }
                var moving = false;
                if (s.mouseDrag && map[i].id === s.mouseDragId)
                    moving = true;
                var bMove = doMove;
                if (moving)
                    bMove = true;

                s.showSortField(map[i].map, id, bMove);
            }
        }

        i = -1;
        z = 0;
        while (i++ < le) {
            if (map[i].toRight === 0 && map[i].id !== 0 && !s.showAsTree) {
                if (!doMove) {
                    var el = document.getElementById('o_' + map[i].id + '_' + map[i].toRight),
                            elS3;
                    var height = el.innerHeight || el.clientHeight,
                            width = el.innerWidth || el.clientWidth;
                    if (z === 0) {
                        var elS1 = document.createElement('a');
                        elS1.setAttribute("href", "#");
                        elS1.setAttribute("class", "nodeS st" + map[i].style);
                        elS1.setAttribute("data-x", "o9");
                        elS1.setAttribute("draggable", "true");
                        elS1.setAttribute("id", "f_" + i + '_' + map[i].id + '_' + map[i].toRight);
                        elS1.setAttribute("title", "Insert here");
                        s.append(s.canvasCon, elS1);
                        elS1.style.left = (map[i].posX + width - 29) + 'px';
                        var h = map[i].posY - 13;
                        elS1.style.top = h + 'px';
                    }

                    if (s.mouseDrag && map[i].id !== 0 && !doMove && map[i].map.length === 0 && map[i].id !== s.mouseDragId) {
                        elS3 = document.createElement('a');
                        elS3.setAttribute("href", "#");
                        elS3.setAttribute("class", "nodeS st" + map[i].style);
                        elS3.setAttribute("data-x", "o3");
                        elS3.setAttribute("title", "Insert here");
                        elS3.setAttribute("id", "e_" + map[i].id + "_" + map[i].toRight);
                        s.append(s.canvasCon, elS3);
                        elS3.style.top = (map[i].posY + (height / 2) - 5) + 'px';
                        //elS3.style.width = '55px!important';
                        elS3.style.left = (map[i].posX - 37) + 'px';
                    }

                    var elS = document.createElement('a');
                    elS.setAttribute("href", "#");
                    elS.setAttribute("class", "nodeS st" + map[i].style);
                    elS.setAttribute("data-x", "o9");
                    elS.setAttribute("draggable", "true");
                    elS.setAttribute("title", "Insert here");
                    elS.setAttribute("id", "f_" + (i + 1) + '_' + map[i].id + '_' + map[i].toRight);
                    s.append(s.canvasCon, elS);

                    elS.style.left = (map[i].posX + width - 29) + 'px';
                    elS.style.top = (map[i].posY + height * 1 + 3) + 'px';
                    z++;
                }
                var moving = false;
                if (s.mouseDrag && map[i].id === s.mouseDragId)
                    moving = true;
                var bMove = doMove;
                if (moving)
                    bMove = true;

                s.showSortField(map[i].map, id, bMove);
            }
        }


        //});

    },
    removeSortFields: function() {
        var fie = this.canvasCon.getElementsByTagName('a');
        var l = fie.length;
        while (l--) {
            if (fie[l].getAttribute('data-x') === "o9" || fie[l].getAttribute('data-x') === "o31" || fie[l].getAttribute('id').split('_')[0] === 'e')
                this.remove(fie[l]);
        }
    },
    setCurrentMapSessionData: function() {
        var session_data_json = null,
                session_data = {};

        if (window.sessionStorage && JSON.parse) {
            session_data_json = window.sessionStorage.getItem(this.activityDataId);
            if (session_data_json === null) {
                session_data = this.makeSessionData();
            } else {
                session_data = JSON.parse(session_data_json);
            }
            if (this.opened !== false) {
                session_data.current_map.id = this.opened.id;
            } else {
                session_data.current_map.id = 0;
            }
            session_data_json = JSON.stringify(session_data);
            sessionStorage.setItem(this.activityDataId, session_data_json);
        }
    },
    isCurrentMapInSession: function() {
        var is_in_session = false,
                session_data_json = null,
                session_data = {},
                leng = this.mindMaps.length;

        if (window.sessionStorage && JSON.parse) {
            session_data_json = sessionStorage.getItem(this.activityDataId);
            if (session_data_json !== null) {
                session_data = JSON.parse(session_data_json);
                if (session_data.current_map.id !== 0) {
                    if (leng > 0) {
                        while (leng--) {
                            if (this.mindMaps[leng].id * 1 === session_data.current_map.id * 1) {
                                is_in_session = true;
                                break;
                            }
                        }
                    }
                }
            }
        }
        return is_in_session;
    },
    setVLEMessageSessionData: function() {
        var session_data_json = null,
                session_data = {};

        if (window.sessionStorage && JSON.parse) {
            session_data_json = window.sessionStorage.getItem(this.activityDataId);
            if (session_data_json === null) {
                session_data = this.makeSessionData();
            } else {
                session_data = JSON.parse(session_data_json);
                session_data.vle_message = true;

            }
            session_data_json = JSON.stringify(session_data);
            sessionStorage.setItem(this.activityDataId, session_data_json);
        }
    },
    isVLEMessageInSession: function() {
        var is_in_session = false,
                session_data_json = null,
                session_data = {};

        if (window.sessionStorage && JSON.parse) {
            session_data_json = sessionStorage.getItem(this.activityDataId);
            if (session_data_json !== null) {
                session_data = JSON.parse(session_data_json);
                if (session_data.vle_message === true) {
                    is_in_session = true;
                }
            }
        }
        return is_in_session;
    },
    /**
     * Make the basic data object to save in session storage. Two things are under session
     * storage's control: the loading of the current map; and whether or not to show a warning 
     * about not saving to the VLE if offline. 
     * @return Object The session data object
     */
    makeSessionData: function() {
        var session_data = {
            current_map: {id: 0},
            vle_message: false};

        return session_data;
    },
    /**
     * Open existing mind map from session data
     * @param {String} map_id. 
     */
    openMapFromSession: function(map_id) {
        var leng = this.mindMaps.length;

        if (leng > 0) {
            while (leng--) {
                if (this.mindMaps[leng].id * 1 === map_id * 1) {
                    this.opened = this.mindMaps[leng];
                    document.title = this.opened.title;
                    document.getElementById('mapTitle').innerHTML = this.replaceSem(this.opened.title);
                    if (this.canvas.width < this.opened.canvasW)
                        this.canvas.width = this.opened.canvasW;
                    if (this.canvas.height < this.opened.canvasH)
                        this.canvas.height = this.opened.canvasH;

                    this.hide(document.getElementById('sheeld'));
                    this.allowSelect = false;
                    this.hide(document.getElementById('openOrNew'));

                    this.show(document.getElementById('menuCon'));
                    this.show(document.getElementById('visibleM').getElementsByTagName('li'));
                    this.hide(document.getElementById('cancelM'));
                    this.show(document.getElementById('canvasMimic'));
                    this.drawMindMap(this.opened.map);
                    this.setCurrentMapSessionData();
                    /*this.ctx.beginPath();
                     this.ctx.fillStyle="red";
                     this.ctx.fillRect(0,0,300,150);
                     this.ctx.moveTo(0, 0);
                     this.ctx.lineTo(600, 600);
                     this.ctx.stroke();
                     this.ctx.closePath();*/

                    document.getElementById('o_0_1').focus();
                    break;
                }
            }
        }
    },
    /**
     * Adds custom data attributes to any elements with IDs that match any of those
     * in the 'custom_data_values' array. This is a hack that should be removed
     * when the VLE and ePubs allow HTML5 'data-' attributes.
     */
    addCustomDataValues: function() {
        var custom_data_values = [
            {"id": this.activityDataId, "data": "o8"},
            {"id": "addN", "data": "o6"},
            {"id": "editN", "data": "o10"},
            {"id": "moveN", "data": "o12"},
            {"id": "removeN", "data": "o13"},
            {"id": "menSh", "data": "o4"},
            {"id": "cancelMove", "data": "o30"},
            {"id": "openM", "data": "o14"},
            {"id": "createM", "data": "o15"},
            {"id": "deleteM", "data": "o16"},
            {"id": "saveAsM", "data": "o17"},
            //{"id": "saveAsIM", "data": "o40"},
            {"id": "saveAsIM", "data": "o41"},
            {"id": "printM", "data": "o19"},
            {"id": "renameM", "data": "o61"},
            {"id": "helpM", "data": "o20"},
            {"id": "openOrNewO", "data": "o1"},
            {"id": "openOrNewN", "data": "o2"},
            {"id": "openC1", "data": "o21"},
            {"id": "cancelC1", "data": "o23"},
            {"id": "nodeT", "data": "o7"},
            {"id": "saveB", "data": "o25"},
            {"id": "cancelB", "data": "o26"},
            {"id": "saveB1", "data": "o22"},
            {"id": "saveB4", "data": "o62"},
            {"id": "cancelB1", "data": "o23"},
            {"id": "cancelB4", "data": "o23"},
            {"id": "closeB", "data": "o24"},
            {"id": "deleteM1", "data": "o27"},
            {"id": "closeM1", "data": "o28"},
            {"id": "printM1", "data": "o29"},
            {"id": "canceM1", "data": "o23"},
            {"id": "saveI", "data": "o41"},
            {"id": "cancelI", "data": "o23"}
        ],
                i = 0,
                max = custom_data_values.length,
                element = {},
                element_attribute = '';

        for (; i < max; i += 1) {
            element = document.getElementById(custom_data_values[i].id);
            if (element !== null) {
                element_attribute = element.getAttribute(this.readAttr);
                if (element_attribute === null) {
                    element.setAttribute(this.readAttr, custom_data_values[i].data);
                }
            }
        }
    },
    slideDrag: function(e, eX, eY) {
        var s = this;
        var width = 100;
        var height = 50;
        var kor = s.getMouseXY(e);
        if (!kor)
            return false;
        s.x = s.canvasCon.scrollLeft;
        s.y = s.canvasCon.scrollTop;

        if (eX > 0) {
            s.x = s.x - 3;
            if (s.x <= 0)
                s.x = 0;
        } else if (eX < 0) {
            s.x = s.x + 3;
            width = s.canvasCon.innerWidth || s.canvasCon.clientWidth;
            var wei = s.canvasCon.scrollWidth - width;
            if (s.x > wei) {
                s.x = wei + 1;
            }

        }

        if (eY > 0) {
            s.y = s.y - 3;
            if (s.y <= 0)
                s.y = 0;
        } else if (eY < 0) {
            s.y = s.y + 3;
            height = s.canvasCon.innerHeight || s.canvasCon.clientHeight;
            var hei = s.canvasCon.scrollHeight - height;
            if (s.y > hei) {
                s.y = hei + 1;
            }
        }

        s.canvasCon.scrollTop = s.y;
        s.canvasCon.scrollLeft = s.x;

        clearTimeout(s.scrollTimer);

        if (s.mouseDrag) {

            var eventCopy = {};
            if (is_ie8) {
                for (var i in e) {
                    eventCopy[i] = e[i];
                }
            }
            if (kor[0] < 30 && kor[0] > 0) {
                s.scrollTimer = setTimeout(function() {
                    if (!s.mouseDrag)
                        return false;
                    s.slideDrag((is_ie8 ? eventCopy : e), 1, 0);
                }, 1);
            } else if (kor[0] > width - 30) {
                s.scrollTimer = setTimeout(function() {
                    if (!s.mouseDrag)
                        return false;
                    s.slideDrag((is_ie8 ? eventCopy : e), -1, 0);
                }, 1);
            } else if (kor[1] < 30 && kor[1] > 0) {
                s.scrollTimer = setTimeout(function() {
                    if (!s.mouseDrag)
                        return false;
                    s.slideDrag((is_ie8 ? eventCopy : e), 0, 1);
                }, 1);
            } else if (kor[1] > height - 30) {
                s.scrollTimer = setTimeout(function() {
                    if (!s.mouseDrag)
                        return false;
                    s.slideDrag((is_ie8 ? eventCopy : e), 0, -1);
                }, 1);
            }
        }
    },
    slideAndDrag: function(e, eX, eY) {
        var s = this;
        if (s.sliding) {
            var width = 100;
            var height = 50;
            var kor = s.getMouseXY(e);
            if (!kor)
                return false;
            if (s.oldX < kor[0]) {
                s.x = s.x - (kor[0] - s.oldX) + eX;
                if (s.x < 0)
                    s.x = 0;
            } else if (s.oldX > kor[0]) {
                //s.x++;
                s.x = s.x + (s.oldX - kor[0]) + eX;
                width = s.canvasCon.innerWidth || s.canvasCon.clientWidth;
                var wei = s.canvasCon.scrollWidth - width;
                if (s.x > wei) {
                    s.x = wei;
                }

            }

            if (s.oldY < kor[1]) {
                s.y = s.y - (kor[1] - s.oldY) + eY;
                if (s.y < 0)
                    s.y = 0;
            } else if (s.oldY > kor[1]) {
                s.y = s.y + (s.oldY - kor[1]) + eY;
                height = s.canvasCon.innerHeight || s.canvasCon.clientHeight;
                var hei = s.canvasCon.scrollHeight - height;
                if (s.y > hei) {
                    s.y = hei;
                }
            }

            s.oldX = kor[0];
            s.oldY = kor[1];

            s.canvasCon.scrollTop = s.y;
            s.canvasCon.scrollLeft = s.x;

        } else if (s.mouseDrag) {
            var kor = s.getMouseXY(e);

        }
    },
    /*
     * defining main functionality for events
     */
    events: function() {
        var s = mindmap;
        s.operations['touchstart'] = [];
        s.operations['touchenter'] = [];
        s.operations['touchend'] = [];
        s.operations['touchcancel'] = [];
        s.operations['touchmove'] = [];
        s.operations['click'] = [];

        /*
         * Open existing mind map
         */
        s.operations['click']['o1'] = function() {
            var ob = document.getElementById('openEx');

            if (ob.value > 0) {
                var leng = s.mindMaps.length;
                if (leng > 0) {
                    while (leng--) {
                        if (s.mindMaps[leng].id * 1 === ob.value * 1) {
                            s.opened = s.mindMaps[leng];
                            document.title = s.opened.title;
                            document.getElementById('mapTitle').innerHTML = s.replaceSem(s.opened.title);
                            if (s.canvas.width < s.opened.canvasW)
                                s.canvas.width = s.opened.canvasW;
                            if (s.canvas.height < s.opened.canvasH)
                                s.canvas.height = s.opened.canvasH;

                            s.hide(document.getElementById('sheeld'));
                            s.allowSelect = false;
                            s.hide(document.getElementById('openOrNew'));

                            s.show(document.getElementById('menuCon'));
                            s.show(document.getElementById('visibleM').getElementsByTagName('li'));
                            s.hide(document.getElementById('cancelM'));
                            s.show(document.getElementById('canvasMimic'));
                            s.drawMindMap(s.opened.map);
                            s.setCurrentMapSessionData();
                            /*s.ctx.beginPath();
                             s.ctx.fillStyle="red";
                             s.ctx.fillRect(0,0,300,150);
                             s.ctx.moveTo(0, 0);
                             s.ctx.lineTo(600, 600);
                             s.ctx.stroke();
                             s.ctx.closePath();*/

                            document.getElementById('o_0_1').focus();
                            break;
                        }
                    }
                }
            }
        };

        s.operations['click']['o21'] = function(e) {
            var ob = document.getElementById('openEx1');
            if (ob.value > 0) {
                var leng = s.mindMaps.length;
                if (leng > 0) {
                    while (leng--) {
                        if (s.mindMaps[leng].id * 1 === ob.value * 1) {
                            s.opened = s.mindMaps[leng];
                            document.title = s.opened.title;
                            document.getElementById('mapTitle').innerHTML = s.replaceSem(s.opened.title);
                            if (s.canvas.width < s.opened.canvasW)
                                s.canvas.width = s.opened.canvasW;
                            if (s.canvas.height < s.opened.canvasH)
                                s.canvas.height = s.opened.canvasH;

                            s.hide(document.getElementById('sheeld'));
                            s.allowSelect = false;
                            s.hide(document.getElementById('open'));
                            s.show(document.getElementById('menuCon'));
                            s.show(document.getElementById('visibleM').getElementsByTagName('li'));
                            s.hide(document.getElementById('cancelM'));
                            s.show(document.getElementById('canvasMimic'));
                            s.drawMindMap(s.opened.map);
                            s.setCurrentMapSessionData();
                            document.getElementById('o_0_1').focus();
                            break;
                        }
                    }
                }
            }
            /*if (e.keyCode === 0)*/
            s.ignoreEdit = true;
        };

        /*
         * Creating new mind map
         */
        s.operations['click']['o2'] = function() {
            var ob = document.getElementById('newT1');

            if (ob.value.trim() === "") {
                alert('Please add title!');
                return;
            } else {

                var l = s.mindMaps.length;
                while (l--) {
                    if (s.mindMaps[l].title === ob.value.trim()) {
                        alert('This title already exists!');
                        return;
                    }
                }
            }
            s.show(document.getElementById('menuCon'));
            s.show(document.getElementById('visibleM').getElementsByTagName('li'));
            s.hide(document.getElementById('cancelM'));
            s.createMap(ob.value);

        };

        s.operations['click']['o22'] = function(e) {
            var ob = document.getElementById('newT2');

            if (ob.value.trim() === "") {
                alert('Please add title!');
                return;
            } else {

                var l = s.mindMaps.length;
                while (l--) {
                    if (s.mindMaps[l].title === ob.value.trim()) {
                        alert('This title already exists!');
                        return;
                    }
                }
            }
            s.hide(document.getElementById('sheeld'));
            s.allowSelect = false;
            s.hide(document.getElementById('new'));
            s.show(document.getElementById('menuCon'));
            s.show(document.getElementById('visibleM').getElementsByTagName('li'));
            s.hide(document.getElementById('cancelM'));
            s.show(document.getElementById('canvasMimic'));
            /*if (e.keyCode === 0)*/
            s.ignoreEdit = true;
            if (s.saveAs) {
                s.saveMapAs(ob.value);
            } else {
                s.createMap(ob.value);
            }

        };

        s.operations['click']['o62'] = function(e) {
            var ob = document.getElementById('newT4');

            if (ob.value.trim() === "") {
                alert('Please add title!');
                return;
            } else {

                var l = s.mindMaps.length;
                while (l--) {
                    if (s.mindMaps[l].title === ob.value.trim() && s.mindMaps[l].id !== s.opened.id) {
                        alert('This title already exists!');
                        return;
                    }
                }
            }

            s.opened.title = ob.value.trim();
            document.title = s.opened.title;
            document.getElementById('mapTitle').innerHTML = s.replaceSem(s.opened.title);
            s.hide(document.getElementById('sheeld'));
            s.allowSelect = false;
            s.hide(document.getElementById('new'));
            s.hide(document.getElementById('editTitle'));
            s.show(document.getElementById('menuCon'));
            s.show(document.getElementById('visibleM').getElementsByTagName('li'));
            s.hide(document.getElementById('cancelM'));
            s.show(document.getElementById('canvasMimic'));
            s.saveMindMap();

        };

        s.operations['click']['o24'] = function(e) {
            s.hide(document.getElementById('sheeld'));
            s.allowSelect = false;
            s.hide(document.getElementById('help'));
            s.show(document.getElementById('menuCon'));
            s.show(document.getElementById('visibleM').getElementsByTagName('li'));
            s.hide(document.getElementById('cancelM'));
            s.show(document.getElementById('canvasMimic'));
            document.getElementById('o_0_1').focus();
            /*if (e.keyCode === 0)*/
            s.ignoreEdit = true;
        };

        s.operations['click']['o23'] = function(e) {

            s.hide(document.getElementById('sheeld'));
            s.allowSelect = false;
            s.hide(document.getElementById('new'));
            s.hide(document.getElementById('open'));
            s.hide(document.getElementById('print'));
            s.hide(document.getElementById('delete'));
            s.hide(document.getElementById('saveImage'));
            s.hide(document.getElementById('editTitle'));
            s.show(document.getElementById('menuCon'));
            s.show(document.getElementById('canvasMimic'));
            document.getElementById('o_0_1').focus();
            if (typeof e.preventDefault !== "undefined")
                e.preventDefault();
            else
                e.returnValue = false;
            /*if (e.keyCode === 0)*/
            s.ignoreEdit = true;
            s.show(document.getElementById('visibleM').getElementsByTagName('li'));
            s.hide(document.getElementById('cancelM'));
            //s.drawMindMap(s.opened);
        };

        s.operations['click']['o30'] = function(e) {
            if (typeof e.preventDefault !== "undefined")
                e.preventDefault();
            else
                e.returnValue = false;
            s.show(document.getElementById('visibleM').getElementsByTagName('li'));
            s.hide(document.getElementById('cancelM'));
            s.doMove = false;
            s.doSort = false;
            s.drawMindMap(s.opened.map);
            s.removeClass(s.canvasCon, 'move');
        };

        s.operations['click']['o29'] = function() {

            s.hide(document.getElementById('print'));
            var size = document.getElementById('psize').value;
            var land = document.getElementById('pLand').value;
            var mind = JSON.stringify(s.opened);

            /*var oz = document.getElementById('printStyle');
             var st = "@page { size: " + size + " " + land + "; }";
             if (typeof oz.styleSheet !== "undefined")
             oz.styleSheet.cssText = st;
             else
             oz.innerHTML = st;*/

            s.ajax({
                "method": "POST",
                "error": function() {
                    alert('Failed to print. Please try again later');
                    s.hide(document.getElementById('sheeld'));
                    s.allowSelect = false;
                    s.show(document.getElementById('menuCon'));
                    s.show(document.getElementById('visibleM').getElementsByTagName('li'));
                    s.hide(document.getElementById('cancelM'));
                    s.show(document.getElementById('canvasMimic'));
                    document.getElementById('o_0_1').focus();
                },
                "action": function(data) {
                    s.hide(document.getElementById('sheeld'));
                    s.allowSelect = false;
                    if (data == "0")
                        alert('Failed to print. Please try again later');
                    else {
                        var ob = document.getElementById('printData');
                        ob.innerHTML = data;
                        s.show(ob);
                        setTimeout(function() {
                            if (is_firefox) {
                                window.onafterprint = function() {
                                    s.hide(ob);
                                    s.show(document.getElementById('menuCon'));
                                    s.show(document.getElementById('visibleM').getElementsByTagName('li'));
                                    s.hide(document.getElementById('cancelM'));
                                    s.show(document.getElementById('canvasMimic'));
                                    document.getElementById('o_0_1').focus();
                                }
                            }
                            window.focus();
                            window.print();
                            if (!is_firefox) {
                                setTimeout(function() {
                                    s.hide(ob);
                                    s.show(document.getElementById('menuCon'));
                                    s.show(document.getElementById('visibleM').getElementsByTagName('li'));
                                    s.hide(document.getElementById('cancelM'));
                                    s.show(document.getElementById('canvasMimic'));
                                    document.getElementById('o_0_1').focus();
                                }, 200);
                            }
                        }, 300);
                    }

                },
                "url": s.printURL,
                "data": "print=" + mind + "&landscape=" + land + "&pagesize=" + size + "&width=" + Math.round(s.farthestX) + "&height=" + Math.round(s.farthestY)
            });

        };

        s.operations['click']['o41'] = function() {

            var ob1 = document.getElementById('extraMenu');
            var el = document.getElementById('menSh');
            s.hide(ob1);
            el.innerHTML = 'More';
            el.setAttribute("title", "More - Show extra actions");

            s.hide(document.getElementById('saveImage'));
            var size = 0;//document.getElementById('newTpicW').value;
            var mind = JSON.stringify(s.opened);

            var form = document.createElement("form");
            form.action = s.printURL;
            form.method = 'POST';
            form.target = "_blank";

            var input = document.createElement("textarea");
            input.name = 'print';
            input.value = mind;
            form.appendChild(input);

            var input1 = document.createElement("textarea");
            input1.name = 'width';
            input1.value = Math.round(s.farthestX);
            form.appendChild(input1);

            var input2 = document.createElement("textarea");
            input2.name = 'height';
            input2.value = Math.round(s.farthestY);
            form.appendChild(input2);

            var input3 = document.createElement("textarea");
            input3.name = 'pictureSize';
            input3.value = size;
            form.appendChild(input3);

            s.hide(form);
            s.append(document.body, form);
            form.submit();
            s.remove(form);

            s.hide(document.getElementById('sheeld'));
            s.allowSelect = false;
            s.show(document.getElementById('menuCon'));
            s.show(document.getElementById('visibleM').getElementsByTagName('li'));
            s.hide(document.getElementById('cancelM'));
            s.show(document.getElementById('canvasMimic'));
            document.getElementById('o_0_1').focus();

        };

        /*
         * Show hide extra menu
         */
        s.operations['click']['o4'] = function(e) {
            if (typeof e.preventDefault !== "undefined")
                e.preventDefault();
            else
                e.returnValue = false;

            var el = s.getOb(e);
            var ob = document.getElementById('extraMenu');
            if (s.isvisible(ob)) {
                s.hide(ob);
                el.innerHTML = 'More';
                el.setAttribute("title", "More - Show extra actions");
            } else {
                s.show(ob);
                el.innerHTML = 'Less';
                el.setAttribute("title", "Less - Hide extra actions");
            }

        };

        s.operations['click']['o6'] = function(e) {
            if (typeof e.preventDefault !== "undefined") {
                e.preventDefault();
                e.stopPropagation();
            } else
                e.returnValue = false;

            if (!s.isExistInMap(s.opened.map, s.selectedNode)) {
                s.selectedNode = 0;
                s.selectedNodeR = 1;
            }
            if (s.selectedNode === 0)
                s.addNode(s.selectedNode);
            else
                s.addNode(s.selectedNode, s.selectedNodeR);
            /*if (e.keyCode === 0)*/
            s.ignoreEdit = true;

        };

        s.operations['click']['o10'] = function(e) {
            if (typeof e.preventDefault !== "undefined")
                e.preventDefault();
            else
                e.returnValue = false;
            if (!s.isExistInMap(s.opened.map, s.selectedNode)) {
                s.selectedNode = 0;
                s.selectedNodeR = 1;
            }
            s.editNode(s.selectedNode, document.getElementById('o_' + s.selectedNode + '_' + s.selectedNodeR), s.selectedNodeR);
            /*if (e.keyCode === 0)*/
            s.ignoreEdit = true;
        };

        s.operations['click']['o11'] = function(e) {
            if (typeof e.preventDefault !== "undefined")
                e.preventDefault();
            else
                e.returnValue = false;
            if (!s.isExistInMap(s.opened.map, s.selectedNode)) {
                s.selectedNode = 0;
                s.selectedNodeR = 1;
            }

            s.doSort = true;
            s.hide(document.getElementById('menuCon'));
            s.sortingId = s.selectedNode;
            s.movingRig = s.selectedNodeR;
            if (s.sortingId === 0)
            {
                s.sortingId = 0;
                s.doSort = false;
                s.show(document.getElementById('menuCon'));
                s.show(document.getElementById('visibleM').getElementsByTagName('li'));
                s.hide(document.getElementById('cancelM'));
                return;
            }
            s.addClass(s.canvasCon, 'move');
            s.drawMindMap(s.opened.map);
            s.canvasCon.getElementsByTagName('a')[0].focus();
        };

        s.operations['click']['o12'] = function(e) {
            if (typeof e.preventDefault !== "undefined")
                e.preventDefault();
            else
                e.returnValue = false;
            if (!s.isExistInMap(s.opened.map, s.selectedNode)) {
                s.selectedNode = 0;
                s.selectedNodeR = 1;
            }

            s.doMove = true;
            s.doSort = true;
            //s.hide(document.getElementById('menuCon'));
            s.hide(document.getElementById('visibleM').getElementsByTagName('li'));
            s.show(document.getElementById('cancelM'));
            s.movingId = s.selectedNode * 1;
            s.movingRig = s.selectedNodeR * 1;
            s.sortingId = s.selectedNode * 1;
            if (s.movingId === 0)
            {
                alert("You can't move main box. Please select other box");
                s.movingId = 0;
                s.sortingId = 0;
                s.doMove = false;
                s.doSort = false;
                s.show(document.getElementById('menuCon'));
                s.show(document.getElementById('visibleM').getElementsByTagName('li'));
                s.hide(document.getElementById('cancelM'));
                s.movingRig = 0;
                return;
            }
            s.addClass(s.canvasCon, 'move');
            s.drawMindMap(s.opened.map);
            document.getElementById('o_0_1').focus();
            /*if (e.keyCode === 0)*/
            s.ignoreEdit = true;

        };

        s.operations['click']['o13'] = function(e) {
            if (typeof e.preventDefault !== "undefined")
                e.preventDefault();
            else
                e.returnValue = false;
            if (!s.isExistInMap(s.opened.map, s.selectedNode)) {
                s.selectedNode = 0;
                s.selectedNodeR = 1;
            }

            if (s.selectedNode === 0) {
                alert("You can't delete main node!");
            } else {
                var r = confirm('Are you sure want to delete "' + s.replaceSemBack(document.getElementById('o_' + s.selectedNode + '_' + s.selectedNodeR).innerHTML) + '"?');
                if (r) {
                    s.deleteNode(s.selectedNode);
                } else {
                    document.getElementById('o_' + s.selectedNode + '_' + s.selectedNodeR).focus();
                }
            }
            /*if (e.keyCode === 0)*/
            s.ignoreEdit = true;
        };

        s.operations['click']['o14'] = function(e) {
            if (typeof e.preventDefault !== "undefined")
                e.preventDefault();
            else
                e.returnValue = false;

            s.hide(document.getElementById('menuCon'));
            s.show(document.getElementById('sheeld'));
            s.allowSelect = true;
            s.show(document.getElementById('open'));
            s.hide(document.getElementById('menuCon'));
            s.hide(document.getElementById('canvasMimic'));

            var ob1 = document.getElementById('extraMenu');
            var el = document.getElementById('menSh');
            s.hide(ob1);
            el.innerHTML = 'More';
            el.setAttribute("title", "More - Show extra actions");

            var leng = s.mindMaps.length;

            if (leng > 0) {
                var ob = document.getElementById('openEx1'),
                        newOpt = new Option('Please select', 0);
                var length = ob.options.length;
                while (length--) {
                    ob.options[length] = null;
                }
                ob.add(newOpt);
                while (leng--) {
                    newOpt = new Option(s.mindMaps[leng].title, s.mindMaps[leng].id);
                    if (typeof s.mindMaps[leng].title !== "undefined")
                        ob.add(newOpt);
                }
            }

        };

        s.operations['click']['o15'] = function(e) {
            if (typeof e.preventDefault !== "undefined")
                e.preventDefault();
            else
                e.returnValue = false;

            s.hide(document.getElementById('menuCon'));
            s.show(document.getElementById('sheeld'));
            s.allowSelect = true;
            s.hide(document.getElementById('menuCon'));
            s.hide(document.getElementById('canvasMimic'));
            s.show(document.getElementById('new'));

            var ob = document.getElementById('extraMenu');
            var el = document.getElementById('menSh');
            s.hide(ob);
            el.innerHTML = 'More';
            el.setAttribute("title", "More - Show extra actions");

            ob = document.getElementById('newT2');
            ob.value = '';
            ob.focus();
        };

        s.operations['click']['o61'] = function(e) {
            if (typeof e.preventDefault !== "undefined")
                e.preventDefault();
            else
                e.returnValue = false;

            s.hide(document.getElementById('menuCon'));
            s.show(document.getElementById('sheeld'));
            s.allowSelect = true;
            s.hide(document.getElementById('menuCon'));
            s.hide(document.getElementById('canvasMimic'));
            s.show(document.getElementById('editTitle'));

            var ob = document.getElementById('extraMenu');
            var el = document.getElementById('menSh');
            s.hide(ob);
            el.innerHTML = 'More';
            el.setAttribute("title", "More - Show extra actions");

            ob = document.getElementById('newT4');
            ob.value = s.opened.title;
            ob.focus();
        };

        s.operations['click']['o19'] = function(e) {
            if (typeof e.preventDefault !== "undefined")
                e.preventDefault();
            else
                e.returnValue = false;

            s.hide(document.getElementById('menuCon'));
            s.show(document.getElementById('sheeld'));
            s.allowSelect = true;
            s.hide(document.getElementById('menuCon'));
            s.hide(document.getElementById('canvasMimic'));
            s.show(document.getElementById('print'));

            var ob = document.getElementById('extraMenu');
            var el = document.getElementById('menSh');
            s.hide(ob);
            el.innerHTML = 'More';
            el.setAttribute("title", "More - Show extra actions");

            ob = document.getElementById('psize');
            ob.focus();
        };

        s.operations['click']['o17'] = function(e) {
            if (typeof e.preventDefault !== "undefined")
                e.preventDefault();
            else
                e.returnValue = false;
            s.saveAs = true;

            s.hide(document.getElementById('menuCon'));
            s.show(document.getElementById('sheeld'));
            s.allowSelect = true;
            s.hide(document.getElementById('menuCon'));
            s.hide(document.getElementById('canvasMimic'));
            s.show(document.getElementById('new'));

            var ob = document.getElementById('extraMenu');
            var el = document.getElementById('menSh');
            s.hide(ob);
            el.innerHTML = 'More';
            el.setAttribute("title", "More - Show extra actions");

            ob = document.getElementById('newT2');
            ob.value = '';
            ob.focus();
        };

        s.operations['click']['o40'] = function(e) {
            if (typeof e.preventDefault !== "undefined")
                e.preventDefault();
            else
                e.returnValue = false;
            s.saveAs = true;

            s.hide(document.getElementById('menuCon'));
            s.show(document.getElementById('sheeld'));
            s.allowSelect = true;
            s.hide(document.getElementById('menuCon'));
            s.hide(document.getElementById('canvasMimic'));
            s.show(document.getElementById('saveImage'));

            var ob = document.getElementById('extraMenu');
            var el = document.getElementById('menSh');
            s.hide(ob);
            el.innerHTML = 'More';
            el.setAttribute("title", "More - Show extra actions");

            ob = document.getElementById('newTpicW');
            ob.value = '';
            ob.focus();
        };

        s.operations['click']['o20'] = function() {
            s.show(document.getElementById('sheeld'));
            s.allowSelect = true;
            s.show(document.getElementById('help'));
            s.hide(document.getElementById('menuCon'));
            s.hide(document.getElementById('canvasMimic'));
            var ob = document.getElementById('extraMenu');
            var el = document.getElementById('menSh');
            s.hide(ob);
            el.innerHTML = 'More';
            el.setAttribute("title", "More - Show extra actions");
        };

        s.operations['click']['o3'] = function(e) {
            //console.log('=====> click')
            var id = s.getOb(e).id.split('_');

            s.selectedNode = id[1] * 1;
            s.selectedNodeR = id[2] * 1;

            var dontCh = false;
            if (s.doMove) {
                //setTimeout(function() {
                dontCh = s.ignoreEdit = true;
                s.moveNode(id[1] * 1, id[2] * 1);
                if (typeof e.preventDefault !== "undefined") {
                    e.stopPropagation();
                }
                //}, 400);
            } else {
                s.ignoreEdit = false;
                s.getOb(e).focus();
            }
            //setTimeout(function() {
            if (s.doSort || s.doMove)
                s.ignoreEdit = true;
            else if (dontCh === false)
                s.ignoreEdit = false;

            if (typeof e.preventDefault !== "undefined") {
                e.preventDefault();
            } else
                e.returnValue = false;
            //}, 400);

        };

        s.operations['click']['o9'] = function(e) {
            var id = s.getOb(e).id.split('_');
            s.sortNode(id[2], id[3], id[1]);
            s.show(document.getElementById('menuCon'));
            s.show(document.getElementById('visibleM').getElementsByTagName('li'));
            s.hide(document.getElementById('cancelM'));
            s.ignoreEdit = true;
            if (typeof e.preventDefault !== "undefined")
                e.preventDefault();
            else
                e.returnValue = false;


        };

        s.operations['click']['o31'] = function(e) {
            var id = s.getOb(e).id.split('_');

            s.sortNodeRorL(id[1]);
            s.ignoreEdit = true;
            if (typeof e.preventDefault !== "undefined")
                e.preventDefault();
            else
                e.returnValue = false;


        };

        s.operations['click']['o26'] = function(e) {
            s.hide(document.getElementById('openOrNew1'));
            s.hide(document.getElementById('sheeld'));
            s.allowSelect = false;
            s.show(document.getElementById('menuCon'));
            s.show(document.getElementById('visibleM').getElementsByTagName('li'));
            s.hide(document.getElementById('cancelM'));
            s.show(document.getElementById('canvasMimic'));

            id = document.getElementById('nodeT').getAttribute('data').split('_');
            if (s.oldId * 1 === 0)
                s.oldFocus = 1;
            if (s.newNode)
                document.getElementById('o_' + s.oldId + '_' + s.oldFocus).focus();
            else
                document.getElementById('o_' + id[1] + '_' + id[2] * 1).focus();

            if (typeof e.preventDefault !== "undefined") {
                e.preventDefault();
                e.stopPropagation();
            } else
                e.returnValue = false;
            s.newNode = false;
            /*if (e.keyCode === 0)*/
            s.ignoreEdit = true;
        };

        s.operations['click']['o25'] = function(e) {
            var ob = document.getElementById('nodeT'),
                    id = ob.getAttribute('data').split('_');
            document.getElementById('charC').innerHTML = ob.value.length;
            if (ob.value.trim() === "") {
                ob.value = '';
                alert('Please add title for node!');
                ob.focus();
            } else if (s.newNode) {
                s.createNode(id[1] * 1, ob, id[2] * 1);
                /*if (e.keyCode === 0)*/
                s.ignoreEdit = true;
            } else {
                s.findNode(id[1] * 1, s.opened.map, function(map, l) {
                    var el = document.createElement('a');
                    el.setAttribute("class", "node");
                    el.innerHTML = s.replaceSem(ob.value.trim());
                    s.append(document.getElementsByTagName('body')[0], el);
                    var width1 = el.innerWidth || el.clientWidth;
                    var heith1 = el.innerHeight || el.clientHeight;
                    s.remove(el);

                    map[l].width = width1 * 1 + 30;
                    map[l].height = heith1;
                    map[l].title = ob.value.trim();
                    s.hide(document.getElementById('openOrNew1'));
                    s.hide(document.getElementById('sheeld'));
                    s.allowSelect = false;
                    s.show(document.getElementById('menuCon'));
                    s.show(document.getElementById('visibleM').getElementsByTagName('li'));
                    s.hide(document.getElementById('cancelM'));
                    s.show(document.getElementById('canvasMimic'));
                    s.drawMindMap(s.opened.map);
                    s.saveMindMap();
                    document.getElementById('o_' + id[1] + '_' + id[2]).focus();
                    /*if (e.keyCode === 0)*/
                    s.ignoreEdit = true;
                });
            }
            if (typeof e.stopPropagation !== "undefined")
                e.stopPropagation();
            else
                e.returnValue = false;
            if (typeof e.preventDefault !== "undefined")
                e.preventDefault();
            else
                e.returnValue = false;
        };

        s.operations['click']['o16'] = function(e) {
            var ob1 = document.getElementById('extraMenu');
            var el = document.getElementById('menSh');
            s.hide(ob1);
            el.innerHTML = 'More';
            el.setAttribute("title", "More - Show extra actions");

            if (typeof e.preventDefault !== "undefined")
                e.preventDefault();
            else
                e.returnValue = false;
            s.show(document.getElementById('delete'));
            s.show(document.getElementById('sheeld'));
            s.allowSelect = true;
            s.hide(document.getElementById('menuCon'));
            s.hide(document.getElementById('canvasMimic'));

            var con = document.getElementById('deletL'),
                    len = s.mindMaps.length,
                    html = "";
            while (len--) {
                if (typeof s.mindMaps[len].id !== "undefined")
                    html += '<label for="ckk' + len + '"><input type="checkbox" value="' + s.mindMaps[len].id + '" name="delCh" id="ckk' + len + '"/> ' + s.replaceSem(s.mindMaps[len].title) + '</label><br/>';
            }

            con.innerHTML = html;
        };

        s.operations['click']['o27'] = function(e) {
            var select = document.getElementsByName('delCh'),
                    sl = select.length,
                    ro = 0;
            s.ignoreEdit = true;
            while (sl--) {
                if (select[sl].checked) {
                    ro++;
                }
            }
            if (ro === 0)
                alert('Select mind map to delete');
            else {
                var r = confirm('Are you sure want to delete mind map(s)?');
                if (r) {
                    sl = select.length;
                    while (sl--) {
                        if (select[sl].checked) {
                            var id = select[sl].value * 1;
                            if (id === s.opened.id * 1)
                                s.opened = false;
                            var i = s.mindMaps.length;
                            while (i--) {
                                if (s.mindMaps[i].id === id) {
                                    s.mindMaps.splice(i, 1);
                                }

                            }
                        }
                    }

                    s.saveMindMap();
                    s.setCurrentMapSessionData();
                    var con = document.getElementById('deletL'),
                            len = s.mindMaps.length,
                            html = "";
                    while (len--) {
                        if (typeof s.mindMaps[len].id !== "undefined")
                            html += '<label for="ckk' + len + '"><input type="checkbox" value="' + s.mindMaps[len].id + '" name="delCh" id="ckk' + len + '"/> ' + s.replaceSem(s.mindMaps[len].title) + '</label><br/>';
                    }

                    con.innerHTML = html;
                    s.ignoreEdit = true;
                }
            }
            s.ignoreEdit = true;
            if (typeof e.preventDefault !== "undefined") {
                e.preventDefault();
                e.stopPropagation();
            } else
                e.returnValue = false;


        };

        s.operations['click']['o28'] = function(e) {

            if (s.opened === false) {
                s.hide(document.getElementById('delete'));
                s.loadMindmap();
            } else {

                s.hide(document.getElementById('sheeld'));
                s.allowSelect = false;
                s.hide(document.getElementById('delete'));
                s.show(document.getElementById('menuCon'));
                s.show(document.getElementById('visibleM').getElementsByTagName('li'));
                s.hide(document.getElementById('cancelM'));
                s.show(document.getElementById('canvasMimic'));

                document.getElementById('o_0_1').focus();
                /*if (e.keyCode === 0)*/
                s.ignoreEdit = true;
            }
        };

        s.operations['dblclick'] = [];

        s.operations['dblclick']['o3'] = function(e) {
            //console.log('=====> dblclick')
            if (s.doMove)
                return false;
            var id = s.getOb(e).id.split('_');
            if (s.doMove) {
                s.moveNode(id[1] * 1, id[2] * 1);
            } else {
                s.editNode(id[1] * 1, s.getOb(e), id[2] * 1);
            }

            if (typeof e.preventDefault !== "undefined")
                e.preventDefault();
            else
                e.returnValue = false;
        };

        s.operations['mousedown'] = [];

        /*
         * Prepere for moving all drawing
         */
        s.operations['mousedown']['o100'] = s.operations['mousedown']['o5'] = function(e) {
            if (typeof e.preventDefault !== "undefined")
                e.preventDefault();
            else
                e.returnValue = false;
            s.sliding = true;
            var kor = s.getMouseXY(e);
            if (!kor)
                return false;
            s.oldX = kor[0];
            s.oldY = kor[1];
            s.x = s.canvasCon.scrollLeft;
            s.y = s.canvasCon.scrollTop;

            var ob = document.getElementById('extraMenu');
            if (s.isvisible(ob)) {
                var el = document.getElementById('menSh');
                s.hide(ob);
                el.innerHTML = 'More';
                el.setAttribute("title", "More - Show extra actions");
            }
            s.getOb(e).style.cursor = "move";
        };

        s.operations['mousedown']['o3'] = function(e) {
            var ob = s.getOb(e);
            //console.log('=====> mousedown')
            if (ob.dragDrop && !s.hasClass(s.canvasCon, 'move'))
                s.dragTime = setTimeout(function() {
                    ob.dragDrop();
                }, 300);
        };

        /*s.operations['mousedown']['o100'] = function(e) {
         var ob = document.getElementById('extraMenu');
         if (s.isvisible(ob)) {
         var el = document.getElementById('menSh');
         s.hide(ob);
         el.innerHTML = 'More';
         el.setAttribute("title", "Show menu for extra actions");
         }
         };*/

        s.operations['mousemove'] = [];
        /*
         * Changing cordinates for drawing
         */
        s.operations['mousemove']['o100'] = s.operations['mousemove']['o5'] = function(e) {
            s.slideAndDrag(e, 0, 0);
        };
        s.operations['mousemove']['o3'] = function(e) {
            //console.log('=====> mousemove')

            if (typeof e.preventDefault !== "undefined") {
                e.preventDefault();
                e.stopPropagation();
            } else
                e.returnValue = false;
        };
        s.operations['mouseover'] = [];
        s.operations['mouseout'] = [];
        s.operations['mouseup'] = [];

        /*
         * Stop moving all drawing
         */
        s.operations['mouseup']['o100'] = s.operations['touchend']['o5'] = s.operations['mouseup']['o5'] = function(e) {
            s.sliding = false;
            s.getOb(e).style.cursor = "auto";
        };
        s.operations['mouseup']['o3'] = function(e) {
            //console.log('=====> mouseup')
            clearTimeout(s.dragTime);
            s.sliding = false;
            s.canvas.style.cursor = "auto";
            var ob = document.getElementById('extraMenu');
            if (s.isvisible(ob)) {
                var el = document.getElementById('menSh');
                s.hide(ob);
                el.innerHTML = 'More';
                el.setAttribute("title", "More - Show extra actions");
            }
        };
        s.operations['keydown'] = [];

        s.operations['keydown']['o7'] = function(e) {
        };

        s.operations['keypress'] = [];

        s.operations['keyup'] = [];

        s.operations['keyup']['o3'] = function(e) {
            //console.log('=====> keyup')
            //console.log('------>',e.keyCode); // 77 
            if (e.keyCode === 69 || (e.keyCode === 13 && s.ignoreEdit === false)) {//edit (e/E)
                var id = s.getOb(e).id.split('_');
                if (s.doMove) {
                    s.moveNode(id[1] * 1, id[2] * 1);
                } else {
                    s.editNode(id[1] * 1, s.getOb(e), id[2] * 1);
                }
            } else if (e.keyCode === 73) {//Insert below to parent (i/I)
                var id = s.getOb(e).id.split('_');
                s.oldId = id[1] * 1;
                s.oldFocus = id[2] * 1;

                if (id[1] * 1 === 0) {
                    var count = s.getNodeCountLR(),
                            toRight = 0;
                    if (count[0] >= count[1])
                        toRight = 1;
                    s.addNode(id[1] * 1, toRight);
                } else {
                    s.addNode(id[1] * 1, id[2] * 1);
                }
            } else if (e.keyCode === 65) {//Add childe (a/A)
                var id = s.getOb(e).id.split('_');
                s.oldId = id[1] * 1;
                s.oldFocus = id[2] * 1;
                if (id[1] * 1 === 0) {
                    var count = s.getNodeCountLR(),
                            toRight = 0;
                    if (count[0] >= count[1])
                        toRight = 1;
                    s.addNode(id[1] * 1, toRight);
                    s.addNode(id[1] * 1);
                } else {
                    toRight = id[2] * 1;
                    if (s.findNodeParent(id[1] * 1, s.opened.map) === 0) {
                        var count = s.getNodeCountLR(),
                                toRight = 0;
                        if (count[0] >= count[1])
                            toRight = 1;
                    }
                    s.addNode(s.findNodeParent(id[1] * 1, s.opened.map), toRight);
                }
            } else if (e.keyCode === 77) {//Move (m/M)
                if (!s.doMove) {
                    s.doMove = true;
                    s.doSort = true;
                    s.hide(document.getElementById('menuCon'));
                    var ob = s.getOb(e);
                    ob = ob.getAttribute('id').split('_');
                    s.movingId = ob[1] * 1;
                    s.movingRig = ob[2] * 1;
                    s.sortingId = ob[1] * 1;
                    if (s.movingId === 0)
                    {
                        s.movingId = 0;
                        s.doMove = false;
                        s.show(document.getElementById('menuCon'));
                        s.show(document.getElementById('visibleM').getElementsByTagName('li'));
                        s.hide(document.getElementById('cancelM'));
                        s.movingRig = 0;
                        return;
                    }
                    s.addClass(s.canvasCon, 'move');
                    s.drawMindMap(s.opened.map);
                    document.getElementById('o_0_1').focus();
                }
                else {
                    s.removeClass(s.canvasCon, 'move');
                    s.doMove = false;
                    s.doSort = false;
                    s.show(document.getElementById('menuCon'));
                    s.show(document.getElementById('visibleM').getElementsByTagName('li'));
                    s.hide(document.getElementById('cancelM'));
                    s.drawMindMap(s.opened.map);
                    var ob = s.getOb(e);
                    ob = ob.getAttribute('id').split('_');
                    document.getElementById('o_' + ob[1] + '_' + ob[2]).focus();
                    s.movingId = 0;
                    s.sortingId = 0;
                    s.movingRig = 0;
                }
            } /*else if (e.keyCode === 83) {//Sort (s/S)
             if (!s.doSort) {
             s.doSort = true;
             s.hide(document.getElementById('menuCon'));
             var ob = s.getOb(e);
             ob = ob.getAttribute('id').split('_');
             s.sortingId = ob[1] * 1;
             s.movingRig = ob[2] * 1;
             if (s.sortingId === 0)
             {
             s.sortingId = 0;
             s.doSort = false;
             s.show(document.getElementById('menuCon'));
             return;
             }
             s.addClass(s.canvasCon, 'move');
             s.drawMindMap(s.opened.map);
             s.canvasCon.getElementsByTagName('a')[0].focus();
             }
             else {
             s.removeClass(s.canvasCon, 'move');
             s.doSort = false;
             s.show(document.getElementById('menuCon'));
             s.drawMindMap(s.opened.map);
             var ob = s.getOb(e);
             ob = ob.getAttribute('id').split('_');
             document.getElementById('o_' + ob[1] + '_' + ob[2]).focus();
             s.sortingId = 0;
             }
             } */ else if (e.keyCode === 46 || e.keyCode === 68) {//Delete or key d/D
                var ob = s.getOb(e),
                        id = ob.id;
                if (id === "o_0_1") {
                    alert('You can\'t delete main box!');
                } else {
                    id = id.split('_');
                    var r = confirm('Are you sure want to delete "' + s.replaceSemBack(ob.innerHTML) + '"?');
                    s.ignoreEdit = true;
                    if (r) {
                        s.deleteNode(id[1] * 1);
                    } else {
                        document.getElementById('o_' + id[1] + '_' + id[2]).focus();
                    }
                }
            } else if (e.keyCode === 27) {//escape
                s.doSort = false;
                s.show(document.getElementById('menuCon'));
                s.show(document.getElementById('visibleM').getElementsByTagName('li'));
                s.hide(document.getElementById('cancelM'));
                s.doMove = false;
                s.drawMindMap(s.opened.map);
                if (s.movingId > 0 || s.sortingId) {
                    var o = s.sortingId;
                    if (s.movingId > s.sortingId)
                        o = s.movingId;
                    document.getElementById('o_' + o + '_' + s.movingRig).focus();
                }
                s.movingId = 0;
                s.sortingId = 0;
                s.movingRig = 0;
                s.removeClass(s.canvasCon, 'move');
                s.show(document.getElementById('visibleM').getElementsByTagName('li'));
                s.hide(document.getElementById('cancelM'));
            } else if (e.keyCode === 83) {
                if (s.isvisible(document.getElementById('addNli')))
                    document.getElementById('addN').focus();
            }
            if (s.ignoreEdit)
                s.ignoreEdit = false;
        };

        s.operations['keyup']['o7'] = function(e) {
            var ob = s.getOb(e),
                    id = ob.getAttribute('data').split('_');
            document.getElementById('charC').innerHTML = ob.value.length;
            if (e.keyCode === 13 && s.ignoreEdit === false) {
                if (ob.value.trim() === "") {
                    ob.value = '';
                    alert('Please add title for node!');
                    ob.focus();
                } else if (s.newNode) {
                    s.createNode(id[1] * 1, ob, id[2] * 1);
                } else {
                    s.findNode(id[1] * 1, s.opened.map, function(map, l) {
                        var el = document.createElement('a');
                        el.setAttribute("class", "node");
                        el.innerHTML = s.replaceSem(ob.value.trim());
                        s.append(document.getElementsByTagName('body')[0], el);
                        var width1 = el.innerWidth || el.clientWidth;
                        var heith1 = el.innerHeight || el.clientHeight;
                        s.remove(el);

                        map[l].width = (width1 * 1) + 30;
                        map[l].height = heith1;
                        map[l].title = ob.value.trim();
                        s.hide(document.getElementById('openOrNew1'));
                        s.hide(document.getElementById('sheeld'));
                        s.allowSelect = false;
                        s.show(document.getElementById('menuCon'));
                        s.show(document.getElementById('visibleM').getElementsByTagName('li'));
                        s.hide(document.getElementById('cancelM'));
                        s.show(document.getElementById('canvasMimic'));
                        s.drawMindMap(s.opened.map);
                        s.saveMindMap();
                        document.getElementById('o_' + id[1] + '_' + id[2]).focus();

                    });
                }
                if (typeof e.stopPropagation !== "undefined")
                    e.stopPropagation();
                else
                    e.returnValue = false;
                if (typeof e.preventDefault !== "undefined")
                    e.preventDefault();
                else
                    e.returnValue = false;
            } else if (e.keyCode === 27) {
                s.hide(document.getElementById('openOrNew1'));
                s.hide(document.getElementById('sheeld'));
                s.allowSelect = false;
                s.show(document.getElementById('menuCon'));
                s.show(document.getElementById('visibleM').getElementsByTagName('li'));
                s.hide(document.getElementById('cancelM'));
                s.show(document.getElementById('canvasMimic'));
                if (s.oldId * 1 === 0)
                    s.oldFocus = 1;
                if (s.newNode)
                    document.getElementById('o_' + s.oldId + '_' + s.oldFocus).focus();
                else
                    document.getElementById('o_' + id[1] + '_' + id[2] * 1).focus();
                if (typeof e.stopPropagation !== "undefined")
                    e.stopPropagation();
                else
                    e.returnValue = false;
                if (typeof e.preventDefault !== "undefined")
                    e.preventDefault();
                else
                    e.returnValue = false;
                s.show(document.getElementById('visibleM').getElementsByTagName('li'));
                s.hide(document.getElementById('cancelM'));
                s.removeClass(s.canvasCon, 'move');
            }
            if (e.preventDefault) {
                e.preventDefault();
                e.stopPropagation();
            }
            else
                e.returnValue = false;
            if (s.ignoreEdit)
                s.ignoreEdit = false;
        };

        s.operations['keyup']['o8'] = function(e) {
            if (e.keyCode === 105 || e.keyCode === 73 || e.keyCode === 97 || e.keyCode === 65) {
                s.addNode(0);
            } else if (e.keyCode === 27) {

                s.doSort = false;
                s.show(document.getElementById('menuCon'));
                s.show(document.getElementById('visibleM').getElementsByTagName('li'));
                s.hide(document.getElementById('cancelM'));
                s.doMove = false;
                s.drawMindMap(s.opened.map);
                if (s.movingId > 0 || s.sortingId) {
                    var o = s.sortingId;
                    if (s.movingId > s.sortingId)
                        o = s.movingId;
                    document.getElementById('o_' + o + '_' + s.movingRig).focus();
                }
                s.movingRig = 0;
                s.movingId = 0;
                s.sortingId = 0;
                s.removeClass(s.canvasCon, 'move');
                s.show(document.getElementById('visibleM').getElementsByTagName('li'));
                s.hide(document.getElementById('cancelM'));
            } else if (e.keyCode === 83) {
                document.getElementById('addN').focus();
            }
        };

        s.operations['keyup']['o31'] = s.operations['keyup']['o9'] = function(e) {
            if (e.keyCode === 27) {

                s.doSort = false;
                s.show(document.getElementById('menuCon'));
                s.show(document.getElementById('visibleM').getElementsByTagName('li'));
                s.hide(document.getElementById('cancelM'));
                s.drawMindMap(s.opened.map);
                if (s.sortingId > 0) {
                    document.getElementById('o_' + s.sortingId + '_' + s.movingRig).focus();
                }
                s.movingRig = 0;
                s.movingId = 0;
                s.sortingId = 0;
                s.removeClass(s.canvasCon, 'move');
                s.show(document.getElementById('visibleM').getElementsByTagName('li'));
                s.hide(document.getElementById('cancelM'));
            }
        };

        s.operations['change'] = [];
        s.operations['select'] = [];
        s.operations['blur'] = [];

        /*s.operations['blur']['o7'] = function(e) {
         var ob = s.getOb(e),
         id = ob.getAttribute('data').split('_');
         
         if (s.newNode) {
         s.createNode(id[1] * 1, ob);
         } else if (ob.value.trim() === "" && s.isvisible(document.getElementById('openOrNew1'))) {
         ob.value = '';
         alert('Please add title for node!');
         ob.focus();
         } else if (s.isvisible(document.getElementById('openOrNew1'))) {
         s.findNode(id[1] * 1, s.opened.map, function(map, l) {
         map[l].title = ob.value;
         s.hide(document.getElementById('openOrNew1'));
         s.hide(document.getElementById('sheeld'));
         s.show(document.getElementById('menuCon'));
         s.drawMindMap(s.opened.map);
         s.saveMindMap();
         document.getElementById('o_' + id[1] + '_' + id[2] * 1).focus();
         
         });
         }
         };*/

        s.operations['focus'] = [];

        s.operations['focus']['o3'] = function(e) {
            //console.log('=====> focus')
            var ob = document.getElementById('extraMenu');
            if (s.isvisible(ob)) {
                var el = document.getElementById('menSh');
                s.hide(ob);
                el.innerHTML = 'More';
                el.setAttribute("title", "More - Show extra actions");

            }

            ob = s.getOb(e);
            var id = ob.getAttribute('id').split('_');
            s.selectedNode = id[1] * 1;
            s.selectedNodeR = id[2] * 1;
            if (!s.mouseDrag)
                if (!s.isNodeVisible(ob)) {
                    s.focusNode(ob);
                }
        };

        s.operations['focus']['o31'] = s.operations['focus']['o9'] = function(e) {
            var ob = document.getElementById('extraMenu');
            if (s.isvisible(ob)) {
                var el = document.getElementById('menSh');
                s.hide(ob);
                el.innerHTML = 'More';
                el.setAttribute("title", "More - Show extra actions");
            }

            ob = s.getOb(e);
            if (!s.isNodeVisible(ob)) {
                s.focusNode(ob);
            }
        };

        s.operations['dragstart'] = [];

        /*s.operations['touchstart']['o3'] =*/ s.operations['dragstart']['o3'] = function(e) {
            if (s.hasClass(s.canvasCon, 'move') /*|| is_firefox*/ || is_ie8 || s.isvisible(document.getElementById('cancelM'))) {
                if (typeof e.preventDefault !== "undefined") {
                    e.preventDefault();
                    e.stopPropagation();
                } else
                    e.returnValue = false;
                return false;
            }
            var ob = s.getOb(e);
            s.mouseDrag = true;
            var id = ob.getAttribute('id').split('_');
            if (id[1] * 1 === 0) {
                ob.focus();
                if (typeof e.preventDefault !== "undefined") {
                    e.preventDefault();
                    e.stopPropagation();
                } else
                    e.returnValue = false;
                this.ondrag = null;
                return false;
            }
            s.mouseDragId = id[1] * 1;
            s.mouseDragToR = id[2] * 1;
            s.setMovableObject(id[1]);
            s.addClass(s.canvasCon, 'move');
            ob.style.cursor = "move";
            if (typeof e.dataTransfer !== "undefined") {
                e.dataTransfer.dropEffect = "move";
                e.dataTransfer.effectAllowed = "move";
                var width = ob.innerWidth || ob.clientWidth,
                        height = ob.innerHeight || ob.clientHeight;
                if (e.dataTransfer.setDragImage)
                    e.dataTransfer.setDragImage(ob, width / 2, height / 2);
            }
            s.hide(document.getElementById('menuCon'));
            s.showSortField(s.opened.map, s.mouseDragId);
            /*if (ob.dragDrop)
             ob.dragDrop();*/
            //console.log('----->dragstart');  
        };

        s.operations['dragover'] = [];
        s.operations['dragover']['o3'] = function(e) {
            //console.log('----->dragover');
            if (typeof e.preventDefault !== "undefined") {
                e.preventDefault();
                e.stopPropagation();
            } else
                e.returnValue = false;
            if (s.isvisible(document.getElementById('cancelM')) /*|| is_firefox*/ || is_ie8)
                return false;
            //
        };

        s.operations['dragover']['o31'] = s.operations['dragover']['o9'] = function(e) {
            if (typeof e.preventDefault !== "undefined") {
                e.preventDefault();
                e.stopPropagation();
            } else
                e.returnValue = false;
            if (s.isvisible(document.getElementById('cancelM')) /*|| is_firefox*/ || is_ie8)
                return false;
        };

        s.operations['dragenter'] = [];

        /*s.operations['touchenter']['o3'] = */s.operations['dragenter']['o3'] = function(e) {
            var ob = s.getOb(e),
                    id = ob.getAttribute('id').split('_');
            if (s.hasClass(ob, 'transparent') /*|| is_firefox*/ || is_ie8)
                return false;
            if (s.isvisible(document.getElementById('cancelM')))
                return false;
            s.addClass(ob, 'selected');
            s.doMove = true;
            s.hide(document.getElementById('menuCon'));
            s.movingId = s.mouseDragId;
            s.movingRig = id[2] * 1;
            //console.log('----->dragenter');
        };

        /*s.operations['touchenter']['o9'] = */s.operations['dragenter']['o9'] = s.operations['dragenter']['o31'] = function(e) {
            if (s.isvisible(document.getElementById('cancelM')) /*|| is_firefox*/ || is_ie8)
                return false;
            var ob = s.getOb(e),
                    id = ob.getAttribute('id').split('_');
            s.addClass(ob, 'selected');
            s.doSort = true;
            s.hide(document.getElementById('menuCon'));
            s.sortingId = s.mouseDragId;
            s.movingRig = id[2] * 1;
        };

        s.operations['dragleave'] = [];
        s.operations['dragleave']['o3'] = function(e) {
            var ob = s.getOb(e);
            s.removeClass(ob, 'selected');
            //console.log('----->dragenter');
        };

        s.operations['dragleave']['o31'] = s.operations['dragleave']['o9'] = function(e) {
            var ob = s.getOb(e);
            s.removeClass(ob, 'selected');
        };

        s.operations['dragend'] = [];
        /*s.operations['touchcancel']['o3'] = s.operations['touchend']['o3'] = */s.operations['dragend']['o3'] = function(e) {
            if (s.isvisible(document.getElementById('cancelM')) /*|| is_firefox*/ || is_ie8)
                return;
            var ob = s.getOb(e);
            ob.style.cursor = 'default';
            s.removeTrans();
            s.removeSortFields();
            //console.log('----->dragend');
            if (s.mouseDragId !== 0 && s.mouseDragToR !== 0)
                document.getElementById('o_' + s.mouseDragId + '_' + s.mouseDragToR).focus();
            s.mouseDrag = false;
            s.mouseDragId = 0;
            s.mouseDragToR = 0;
            s.mouseDradOb = [];
            s.doMove = false;
            s.movingRig = 0;
            s.movingId = 0;
            s.sortingId = 0;
            s.removeClass(s.canvasCon, 'move');
            s.show(document.getElementById('menuCon'));
            s.show(document.getElementById('visibleM').getElementsByTagName('li'));
            s.hide(document.getElementById('cancelM'));
        };

        s.operations['drag'] = [];
        s.operations['drag']['o3'] = function(e) { //console.log('----->drag');
            if (s.isvisible(document.getElementById('cancelM')) /*|| is_firefox*/ || is_ie8)
                return false;
            clearTimeout(s.scrollTimer);
            if (!is_ie8 && !is_firefox) {
                var kor = s.getMouseXY(e),
                        height = s.canvasCon.innerHeight || s.canvasCon.clientHeight,
                        width = s.canvasCon.innerWidth || s.canvasCon.clientWidth;
                if (!kor)
                    return false;
                if (kor[0] < 30 && kor[0] > 0) {
                    s.slideDrag(e, 1, 0);
                } else if (kor[0] > width - 30) {
                    s.slideDrag(e, -1, 0);
                } else if (kor[1] < 30 && kor[1] > 0) {
                    s.slideDrag(e, 0, 1);
                } else if (kor[1] > height - 30) {
                    s.slideDrag(e, 0, -1);
                }
            }
        };

        s.operations['drop'] = [];
        s.operations['drop']['o3'] = function(e) { //console.log('----->drop');
            if (typeof e.preventDefault !== "undefined") {
                e.preventDefault();
                e.stopPropagation();
            } else
                e.returnValue = false;
            var ob = s.getOb(e),
                    id = ob.getAttribute('id').split('_');

            if (id[1] * 1 === s.mouseDragId)
                return;
            ob.style.cursor = "move";
            s.removeClass(ob, 'selected');
            s.mouseDrag = false;
            s.doMove = false;
            s.doSort = false;
            s.show(document.getElementById('menuCon'));
            s.show(document.getElementById('visibleM').getElementsByTagName('li'));
            s.hide(document.getElementById('cancelM'));
            if (!s.hasClass(ob, 'transparent'))
                s.moveNode(id[1] * 1, id[2] * 1);
            s.removeTrans();

            s.mouseDragId = 0;
            s.mouseDragToR = 0;
            s.mouseDradOb = [];
            s.movingRig = 0;
            s.movingId = 0;
            s.sortingId = 0;
        };

        s.operations['drop']['o9'] = function(e) { //console.log('----->drop');
            if (typeof e.preventDefault !== "undefined") {
                e.preventDefault();
                e.stopPropagation();
            } else
                e.returnValue = false;
            var ob = s.getOb(e),
                    id = ob.getAttribute('id').split('_');

            ob.style.cursor = "move";
            s.removeClass(ob, 'selected');
            s.doSort = false;
            s.show(document.getElementById('menuCon'));
            s.show(document.getElementById('visibleM').getElementsByTagName('li'));
            s.hide(document.getElementById('cancelM'));
            s.mouseDrag = false;
            s.doMove = false;
            s.removeTrans();
            s.sortNode(id[2] * 1, id[3] * 1, id[1] * 1);



            s.mouseDragId = 0;
            s.mouseDragToR = 0;
            s.mouseDradOb = [];
            s.movingRig = 0;
            s.movingId = 0;
            s.sortingId = 0;
        };

        s.operations['drop']['o31'] = function(e) {
            if (typeof e.preventDefault !== "undefined") {
                e.preventDefault();
                e.stopPropagation();
            } else
                e.returnValue = false;
            var ob = s.getOb(e),
                    id = ob.getAttribute('id').split('_');
            ob.style.cursor = "move";
            s.removeClass(ob, 'selected');
            s.show(document.getElementById('menuCon'));
            s.show(document.getElementById('visibleM').getElementsByTagName('li'));
            s.hide(document.getElementById('cancelM'));
            s.mouseDrag = false;
            s.doMove = false;
            s.removeTrans();
            s.sortingId = s.mouseDragId;
            s.sortNodeRorL(id[1] * 1);

            s.mouseDragId = 0;
            s.mouseDragToR = 0;
            s.mouseDradOb = [];
            s.movingRig = 0;
            s.movingId = 0;
            s.sortingId = 0;
        };

    }

};

window.onload = function() {
    mindmap.init();
};


var autoScroll = {
    readAttr: 'data-x',
    holderOb: {},
    body: {},
    top: {},
    bottom: {},
    left: {},
    right: {},
    ph: 0,
    pw: 0,
    canScT: 0,
    canSbT: 0,
    iframeParentBody: {},
    iframeInParent: false,
    scrollTimer: false,
    scrollTimerSide: false,
    isInIframe: false,
    init: function(holderId) {
        var s = this,
                ob = document.getElementsByTagName('body')[0];

        s.holderOb = document.getElementById(holderId);
        s.body = document.getElementsByTagName('body')[0];

        if (!s.holderOb)
            return;

        if (window !== window.top) {
            s.isInIframe = true;
            try {
                s.iframeParentBody = window.parent.document.getElementsByTagName('body')[0];
                var arrFrames = parent.document.getElementsByTagName("iframe");
                s.ph = window.parent.innerHeight || window.parent.clientHeight;
                s.pw = window.parent.innerWidth || window.parent.clientWidth;
                for (var i = 0, j = arrFrames.length; i < j; i++) {
                    if (arrFrames[i].contentWindow === window)
                        s.iframeInParent = arrFrames[i];
                }
                if (!s.iframeInParent)
                    s.isInIframe = false;
            } catch (e) {
                s.isInIframe = false;
            }
        }



        s.right = document.createElement('span');
        s.right.setAttribute('id', 'scrollright');
        s.right.setAttribute(s.readAttr, 'o10001');
        s.right.setAttribute('style', 'position: absolute;bottom: 0;right: 0;top: 0;width: 20px;z-index: 99;');
        s.hide(s.right);
        s.append(s.holderOb, s.right);

        s.left = document.createElement('span');
        s.left.setAttribute('id', 'scrollleft');
        s.left.setAttribute(s.readAttr, 'o10003');
        s.left.setAttribute('style', 'position: absolute;bottom: 0;left: 0;top: 0;width: 20px;z-index: 99;');
        s.hide(s.left);
        s.append(s.holderOb, s.left);

        s.top = document.createElement('span');
        s.top.setAttribute('id', 'scrolltop');
        s.top.setAttribute(s.readAttr, 'o10000');
        s.top.setAttribute('style', 'position: absolute;top: 0;left: 0;right: 0;height: 20px;z-index: 99;');
        s.hide(s.top);
        s.append(s.holderOb, s.top);

        s.bottom = document.createElement('span');
        s.bottom.setAttribute('id', 'scrollbottom');
        s.bottom.setAttribute(s.readAttr, 'o10002');
        s.bottom.setAttribute('style', 'position: absolute;bottom: 0;left: 0;right: 0;height: 20px;z-index: 99;');
        s.hide(s.bottom);
        s.append(s.holderOb, s.bottom);

        s.addEL(ob, 'dragstart', s.evA, 0);
        s.addEL(ob, 'dragenter', s.evA, 0);
        s.addEL(ob, 'dragleave', s.evA, 0);
        s.addEL(ob, 'dragend', s.evA, 0);
        s.addEL(ob, 'mouseover', s.evA, 0);

        s.operations();
    },
    addEL: (window.document.addEventListener
            ? function(e, t, f, r) {
                e.addEventListener(t, f, r);
            }
    : function(e, t, f) {
        e.attachEvent('on' + t, f);
    }),
    evA: function(ev) {
        var e = ev || window.event,
                s = autoScroll,
                ob = s.getOb(e);
        if (typeof ob === "undefined" || typeof ob.getAttribute === "undefined")
            return;

        var a = ob.getAttribute(s.readAttr);

        if (typeof (s.operations[e.type]) !== 'undefined' && typeof (s.operations[e.type][a]) !== 'undefined')
            s.operations[e.type][a](e);
        else if (typeof (s.operations[e.type]) !== 'undefined' && typeof (s.operations[e.type]) === "function")
            s.operations[e.type](e);
    },
    getOb: function(e) {
        return (e && e.target) ? e.target : e.srcElement;
    },
    hide: function(e) {
        if (e && e.length !== undefined) {
            var i = e.length;
            while (i--)
                e[i].style.display = 'none';
        } else if (e)
            e.style.display = 'none';
    },
    show: function(e) {
        if (e && e.length !== undefined) {
            var i = e.length;
            while (i--)
                e[i].style.display = 'block';
        } else if (e)
            e.style.display = 'block';
    },
    remove: function(e) {
        if (e && e.length !== undefined) {
            var i = e.length;
            while (i--)
                e[i].parentNode.removeChild(e[i]);
        } else if (e)
            e.parentNode.removeChild(e);
    },
    append: function(e, child) {
        if (e && child)
            e.appendChild(child);
    },
    operations: function() {
        var s = this;
        s.operations['dragenter'] = [];
        s.operations['dragleave'] = [];
        s.operations['dragstart'] = [];
        s.operations['dragend'] = [];
        s.operations['mouseover'] = [];

        s.operations['dragenter']['o10000'] = function() {
            s.scrollTop();
        };
        s.operations['dragenter']['o10001'] = function() {
            s.scrollRight();
        };
        s.operations['dragenter']['o10002'] = function() {
            s.scrollBottom();
        };
        s.operations['dragenter']['o10003'] = function() {
            s.scrollLeft();
        };

        s.operations['dragleave']['o10000'] = function() {
            clearTimeout(s.scrollTimer);
        };
        s.operations['dragleave']['o10001'] = function() {
            clearTimeout(s.scrollTimerSide);
        };
        s.operations['dragleave']['o10002'] = function() {
            clearTimeout(s.scrollTimer);
        };
        s.operations['dragleave']['o10003'] = function() {
            clearTimeout(s.scrollTimerSide);
        };

        s.operations['dragstart'] = function() {
            s.canScT = s.holderOb.scrollHeight - (s.holderOb.innerHeight || s.holderOb.clientHeight);
            s.canSbT = s.holderOb.scrollWidth - (s.holderOb.innerWidth || s.holderOb.clientWidth);
            s.putToTop();
            s.putToBottom();
            s.putToLeft();
            s.putToRight();
            s.show(s.top);
            s.show(s.right);
            s.show(s.bottom);
            s.show(s.left);
        };

        s.operations['mouseover'] = function() {
            s.hideScroll();
        };

        s.operations['dragend'] = function() {
            s.hideScroll();
        };

    },
    putToTop: function() {
        var s = this,
                height = s.holderOb.innerHeight || s.holderOb.clientHeight,
                scTop = s.body.scrollTop,
                //scH = s.body.scrollHeight,
                conT = s.holderOb.offsetTop,
                ext = 0;

        if (s.isInIframe && s.iframeParentBody.scrollTop > s.iframeInParent.offsetTop) {
            ext = s.iframeParentBody.scrollTop - s.iframeInParent.offsetTop;
        }

        if (scTop > conT && scTop < (conT + height - 40)) {
            s.top.style.top = (scTop - conT + s.holderOb.scrollTop + ext) + 'px';
            s.top.style.bottom = 'auto';
        } else if (scTop > (conT + height - 40) && scTop < (conT + height - 20)) {
            s.top.style.top = 'auto';
            s.top.style.bottom = (20 + s.holderOb.scrollTop + ext) + 'px';
        } else {
            s.top.style.top = ext + s.holderOb.scrollTop + 'px';
            s.top.style.bottom = 'auto';
        }
        s.left.style.top = (s.holderOb.scrollTop + ext) + 'px';
        s.right.style.top = (s.holderOb.scrollTop + ext) + 'px';
        s.left.style.bottom = ((s.holderOb.scrollTop + ext) * -1) + 'px';
        s.right.style.bottom = ((s.holderOb.scrollTop + ext) * -1) + 'px';
    },
    putToBottom: function() {
        var s = this,
                height = s.holderOb.innerHeight || s.holderOb.clientHeight,
                winH = window.innerHeight || window.clientHeight,
                scTop = s.body.scrollTop,
                //scH = s.body.scrollHeight,
                conT = s.holderOb.offsetTop,
                /*conH = s.holderOb.scrollHeight,*/
                conST = s.holderOb.scrollTop,
                ext = 0;

        if (s.isInIframe && (s.iframeParentBody.scrollTop + s.ph) < (s.iframeInParent.offsetTop + winH)) {
            ext = ((s.iframeParentBody.scrollTop + s.ph) - (s.iframeInParent.offsetTop + winH));
            if (ext === 0)
                ext = -10;
        }

        if (conT + height > scTop + winH) {
            s.bottom.style.top = 'auto';
            s.bottom.style.bottom = (((conT + height) - (scTop + winH)) - conST - ext) + 'px';
        } else {
            s.bottom.style.bottom = (0 - conST - ext) + 'px';
        }

    },
    putToLeft: function() {
        var s = this,
                width = s.holderOb.innerWidth || s.holderOb.clientWidth,
                scLeft = s.body.scrollLeft,
                conL = s.holderOb.offsetLeft,
                ext = 0;

        if (s.isInIframe && s.iframeParentBody.scrollLeft > s.iframeInParent.offsetLeft) {
            ext = s.iframeParentBody.scrollLeft - s.iframeInParent.offsetLeft;
        }

        if (scLeft > conL && scLeft < (conL + width - 40)) {
            s.left.style.left = (scLeft - conL + s.holderOb.scrollLeft + ext) + 'px';
            s.left.style.right = 'auto';
        } else if (scLeft > (conL + width - 40) && scLeft < (conL + width - 20)) {
            s.left.style.left = 'auto';
            s.left.style.right = (20 + s.holderOb.scrollLeft + ext) + 'px';
        } else {
            s.left.style.left = ext + s.holderOb.scrollLeft + 'px';
            s.left.style.right = 'auto';
        }
        s.top.style.left = (s.holderOb.scrollLeft + ext) + 'px';
        s.bottom.style.left = (s.holderOb.scrollLeft + ext) + 'px';
        s.top.style.right = ((s.holderOb.scrollLeft + ext) * -1) + 'px';
        s.bottom.style.right = ((s.holderOb.scrollLeft + ext) * -1) + 'px';
    },
    putToRight: function() {
        var s = this,
                width = s.holderOb.innerWidth || s.holderOb.clientWidth,
                winW = window.innerWidth || window.clientWidth,
                scLef = s.body.scrollLeft,
                conL = s.holderOb.offsetLeft,
                conSL = s.holderOb.scrollLeft,
                ext = 0;

        if (s.isInIframe && (s.iframeParentBody.scrollLeft + s.pw) < (s.iframeInParent.offsetLeft + winW)) {
            ext = ((s.iframeParentBody.scrollLeft + s.pw) - (s.iframeInParent.offsetLeft + winW));
        }

        if (conL + width > scLef + winW) {
            s.right.style.left = 'auto';
            s.right.style.right = (((conL + width) - (scLef + winW)) - conSL - ext) + 'px';
        } else {
            s.right.style.right = (0 - conSL - ext) + 'px';
        }

    },
    hideScroll: function() {
        var s = this;
        clearTimeout(s.scrollTimer);
        clearTimeout(s.scrollTimerSide);
        s.hide(s.top);
        s.hide(s.right);
        s.hide(s.bottom);
        s.hide(s.left);
    },
    scrollTop: function() {
        var s = this,
                scroll = false;
        clearTimeout(s.scrollTimer);
        if (s.holderOb.scrollTop > 0) {
            s.holderOb.scrollTop--;
            scroll = true;
        } else if (s.body.scrollTop > s.holderOb.offsetTop) {
            s.body.scrollTop--;
            scroll = true;
        } else if (s.isInIframe && s.iframeParentBody.scrollTop > s.iframeInParent.offsetTop) {
            s.iframeParentBody.scrollTop--;
            scroll = true;
        }
        s.putToTop();
        s.putToBottom();

        if (scroll) {
            s.scrollTimer = setTimeout(function() {
                s.scrollTop();
            }, 1);
        }

    },
    scrollBottom: function() {
        var s = this,
                scroll = false,
                height = s.holderOb.innerHeight || s.holderOb.clientHeight,
                winH = window.innerHeight || window.clientHeight;
        clearTimeout(s.scrollTimer);

        if (s.holderOb.scrollTop < s.canScT) {
            s.holderOb.scrollTop++;
            scroll = true;
        } else if (s.holderOb.offsetTop + height > s.body.scrollTop + winH) {
            s.body.scrollTop++;
            scroll = true;
        } else if ((s.iframeInParent.offsetTop + winH) > (s.iframeParentBody.scrollTop + s.ph)) {
            s.iframeParentBody.scrollTop++;
            scroll = true;
        }
        s.putToTop();
        s.putToBottom();

        if (scroll) {
            s.scrollTimer = setTimeout(function() {
                s.scrollBottom();
            }, 1);
        }

    },
    scrollRight: function() {
        var s = this,
                scroll = false,
                width = s.holderOb.innerWidth || s.holderOb.clientWidth,
                winW = window.innerWidth || window.clientWidth;
        clearTimeout(s.scrollTimerSide);

        if (s.holderOb.scrollLeft < s.canSbT) {
            s.holderOb.scrollLeft++;
            scroll = true;
        } else if (s.holderOb.offsetLeft + width > s.body.scrollLeft + winW) {
            s.body.scrollLeft++;
            scroll = true;
        } else if ((s.iframeInParent.offsetLeft + winW) > (s.iframeParentBody.scrollLeft + s.pw)) {
            s.iframeParentBody.scrollLeft++;
            scroll = true;
        }
        s.putToLeft();
        s.putToRight();

        if (scroll) {
            s.scrollTimerSide = setTimeout(function() {
                s.scrollRight();
            }, 1);
        }
    },
    scrollLeft: function() {
        var s = this,
                scroll = false;
        clearTimeout(s.scrollTimerSide);
        if (s.holderOb.scrollLeft > 0) {
            s.holderOb.scrollLeft--;
            scroll = true;
        } else if (s.body.scrollLeft > s.holderOb.offsetLeft) {
            s.body.scrollLeft--;
            scroll = true;
        } else if (s.isInIframe && s.iframeParentBody.scrollLeft > s.iframeInParent.offsetLeft) {
            s.iframeParentBody.scrollLeft--;
            scroll = true;
        }
        s.putToLeft();
        s.putToRight();

        if (scroll) {
            s.scrollTimerSide = setTimeout(function() {
                s.scrollLeft();
            }, 1);
        }

    }


};
if (is_firefox)
    autoScroll.init('canvasMimic');
