var PubSub = function (e) {
    this.options = {
        split: " ",
        debug: true,
        logger: null,
        defaultEvents: ["window:orientationchange", "window:resize"]
    };
    if (e) {
        for (var t in e) {
            this.options[t] = e[t]
        }
    }
    this._events = {}
}
PubSub.prototype._log = function () {
    if (!this.options.debug) return;
    if (this.options.logger) {
        this.options.logger.apply(this.options.logger, arguments)
    } else {
        console.log.apply(console, arguments)
    }
};
PubSub.prototype.on = function (e, t, n) {
    if (typeof e !== "string") {
        if (this.options.debug) {
            throw new TypeError("PubSub.on() requires a string at arguments[0] for event name(s).", "PubSub.js", 41)
        }
    } else if (typeof t !== "function") {
        if (this.options.debug) {
            throw new TypeError("PubSub.on() requires a function at arguments[1] to apply to the subscription.", "PubSub.js", 47)
        }
    } else if (n && typeof n !== "object") {
        if (this.options.debug) {
            throw new TypeError("PubSub.on() requires an object for the scope argument at arguments[2].", "PubSub.js", 53)
        }
    }
    e = e.split(this.options.split);
    for (var r = 0, i = e.length; r < i; ++r) {
        if (!this._events[e[r]]) {
            this._events[e[r]] = [t, n];
            this._log("PubSub.on: Created new event for", e[r])
        } else {
            this._events[e[r]].push(t, n);
            this._log("PubSub.on: Subscribed to existing event", e[r])
        }
    }
};
PubSub.prototype.off = function (e, t) {
    var n = typeof t === "function",
        r;
    if (typeof e !== "string") {
        if (this.options.debug) {
            throw new TypeError("PubSub.off() requires a string at arguments[0] for event name(s).", "PubSub.js", 93)
        }
    } else if (typeof t !== "function") {
        if (this.options.debug) {
            throw new TypeError("PubSub.off() requires a function at arguments[1] to apply to the subscription.", "PubSub.js", 99)
        }
    }
    e = e.split(this.options.split);
    for (var i = 0, s = e.length; i < s; ++i) {
        if (!this._events[e[i]]) {
            this._log("PubSub.off: No events found for", e[i] + ". Skipping", e[i]);
            continue
        }
        r = this._events[e[i]];
        if (n) {
            for (var o = 0, u = r.length; o < u; o += 2) {
                if (t === r[o]) {
                    r.splice(o, 2);
                    this._log("PubSub.off: Unsubscribed a function from", e[i]);
                    break
                }
            }
        } else {
            delete this._events[e[i]];
            this._log("PubSub.off: Entirely removed", e[i], "event.")
        }
    }
    return this
};
PubSub.prototype.fire = function (e, t) {
    var n, r, i, s = Array.prototype.splice.call(arguments, 2);
    e = e.split(this.options.split);
    for (var o = 0, u = e.length; o < u; ++o) {
        n = e[o];
        if (!this._events[e[o]]) {
            this._log("PubSub.fire: No events found for", e[o] + ". Skipping", e[o]);
            continue
        }
        n = this._events[n];
        for (var a = 0, f = n.length; a < f; a += 2) {
            r = n[a];
            i = n[a + 1];
            this._log("PubSub.fire: Firing", e[o] + ".");
            r.apply(i || t || window, s)
        }
    }
    return this
};
PubSub.prototype.addDefaultEvents = function () {
    var e = this.options.defaultEvents,
        t, n = this;
    for (var r = 0, i = e.length; r < i; ++r) {
        t = e[r].split(":");
        if (t[0] === "window") t[0] = window;
        t[0].addEventListener(t[1], function (e, t) {
            return function (r) {
                n.fire(e, t, r)
            }
        }(t[1], this), false)
    }
};