!function() {
  "use strict";
  var sn = {
    version: "0.9.0"
  };
  sn.api = {};
  var sn_api_timestampFormat = d3.time.format.utc("%Y-%m-%d %H:%M:%S.%LZ");
  sn.api.control = {};
  sn.api.user = {};
  sn.api.node = {};
  var global = function() {
    if (typeof self !== "undefined") {
      return self;
    }
    if (typeof global !== "undefined") {
      return global;
    }
    return new Function("return this")();
  }();
  sn.net = {};
  sn.net.parseURLQueryTerms = sn_net_parseURLQueryTerms;
  /**
 * Parse the query portion of a URL string, and return a parameter object for the
 * parsed key/value pairs.
 * 
 * <p>Multiple parameters of the same name will be stored as an array on the returned object.</p>
 * 
 * @param {String} search the query portion of the URL, which may optionally include 
 *                        the leading '?' character
 * @return {Object} the parsed query parameters, as a parameter object
 * @preserve
 */
  function sn_net_parseURLQueryTerms(search) {
    var params = {};
    var pairs;
    var pair;
    var i, len, k, v;
    if (search !== undefined && search.length > 0) {
      if (search.match(/^\?/)) {
        search = search.substring(1);
      }
      pairs = search.split("&");
      for (i = 0, len = pairs.length; i < len; i++) {
        pair = pairs[i].split("=", 2);
        if (pair.length === 2) {
          k = decodeURIComponent(pair[0]);
          v = decodeURIComponent(pair[1]);
          if (params[k]) {
            if (!Array.isArray(params[k])) {
              params[k] = [ params[k] ];
            }
            params[k].push(v);
          } else {
            params[k] = v;
          }
        }
      }
    }
    return params;
  }
  var sn_env = {
    debug: false,
    host: "data.solarnetwork.net",
    tls: function() {
      return global !== undefined && global.locaion !== undefined && global.location.protocol !== undefined && global.location.protocol.toLowerCase().indexOf("https") === 0 ? true : false;
    }(),
    path: "/solarquery",
    solarUserPath: "/solaruser",
    secureQuery: false
  };
  function sn_env_setDefaultEnv(defaults) {
    var prop;
    for (prop in defaults) {
      if (defaults.hasOwnProperty(prop)) {
        if (sn_env[prop] === undefined) {
          sn_env[prop] = defaults[prop];
        }
      }
    }
  }
  function sn_env_setEnv(environment) {
    var prop;
    for (prop in environment) {
      if (environment.hasOwnProperty(prop)) {
        sn_env[prop] = environment[prop];
      }
    }
  }
  sn.env = sn_env;
  sn.setEnv = sn_env_setEnv;
  sn.setDefaultEnv = sn_env_setDefaultEnv;
  if (global !== undefined && global.location !== undefined && global.location.search !== undefined) {
    sn_env_setEnv(sn_net_parseURLQueryTerms(global.location.search));
  }
  sn.config = {
    debug: false,
    host: "data.solarnetwork.net",
    tls: function() {
      return global !== undefined && global.locaion !== undefined && global.location.protocol !== undefined && global.location.protocol.toLowerCase().indexOf("https") === 0 ? true : false;
    }(),
    path: "/solarquery",
    solarUserPath: "/solaruser",
    secureQuery: false
  };
  sn.util = {
    arraysAreEqual: sn_util_arraysAreEqual,
    copy: sn_util_copy,
    copyAll: sn_util_copyAll,
    superMethod: sn_util_superMethod
  };
  /**
 * Copy the enumerable own properties of `obj1` onto `obj2` and return `obj2`.
 * 
 * @param {Object} obj1 - The object to copy enumerable properties from.
 * @param {Object} [obj2] - The optional object to copy the properties to. If not
 *                          provided a new object will be created.
 * @returns {Object} The object whose properties were copied to.
 * @since 0.0.5
 * @preserve
 */
  function sn_util_copy(obj1, obj2) {
    var prop, desc;
    if (obj2 === undefined) {
      obj2 = {};
    }
    for (prop in obj1) {
      if (obj1.hasOwnProperty(prop)) {
        desc = Object.getOwnPropertyDescriptor(obj1, prop);
        if (desc) {
          Object.defineProperty(obj2, prop, desc);
        } else {
          obj2[prop] = obj1[prop];
        }
      }
    }
    return obj2;
  }
  /**
 * Copy the enumerable and non-enumerable own properties of `obj` onto `obj2` and return `obj2`.
 * 
 * @param {Object} obj1 - The object to copy enumerable properties from.
 * @param {Object} [obj2] - The optional object to copy the properties to. If not
 *                          provided a new object will be created.
 * @returns {Object} The object whose properties were copied to.
 * @since 0.0.5
 * @preserve
 */
  function sn_util_copyAll(obj1, obj2) {
    var keys = Object.getOwnPropertyNames(obj1), i, len, key, desc;
    if (obj2 === undefined) {
      obj2 = {};
    }
    for (i = 0, len = keys.length; i < len; i += 1) {
      key = keys[i];
      desc = Object.getOwnPropertyDescriptor(obj1, key);
      if (desc) {
        Object.defineProperty(obj2, key, desc);
      } else {
        obj2[key] = obj1[key];
      }
    }
    return obj2;
  }
  /**
 * Compare two arrays for equality, that is they have the same length and same values
 * using strict quality.
 *
 * @param {Array} a1 The first array to compare.
 * @param {Array} a2 The second array to compare.
 * @return {Boolean} True if the arrays are equal.
 * @since 0.2.0
 * @preserve
 */
  function sn_util_arraysAreEqual(a1, a2) {
    var i, len;
    if (!(Array.isArray(a1) && Array.isArray(a2))) {
      return false;
    }
    if (a1.length !== a2.length) {
      return false;
    }
    for (i = 0, len = a1.length; i < len; i += 1) {
      if (Array.isArray(a1[i]) && Array.isArray(a2[i]) && arraysAreEqual(a1[i], a2[i]) !== true) {
        return false;
      } else if (a1[i] !== a2[i]) {
        return false;
      }
    }
    return true;
  }
  /**
 * Get a proxy method for a "super" class' method on the `this` objct.
 * 
 * @param {String} name - The name of the method to get a proxy for.
 * @returns {Function} A function that calls the `name` function of the `this` object.
 * @since 0.0.4
 * @preserve
 */
  function sn_util_superMethod(name) {
    var that = this, method = that[name];
    return function() {
      return method.apply(that, arguments);
    };
  }
  sn.api.node.registerUrlHelperFunction = sn_api_node_registerUrlHelperFunction;
  var sn_api_node_urlHelperFunctions;
  sn.api.node.nodeUrlHelper = function(node, configuration) {
    var that = {
      version: "1.1.0"
    };
    var nodeId = node;
    var config = sn.util.copy(configuration, {
      host: "data.solarnetwork.net",
      tls: true,
      path: "/solarquery",
      secureQuery: false
    });
    function hostURL() {
      return "http" + (config.tls === true ? "s" : "") + "://" + config.host;
    }
    function baseURL() {
      return hostURL() + config.path + "/api/v1/" + (config.secureQuery === true ? "sec" : "pub");
    }
    function reportableIntervalURL(sourceIds) {
      var url = baseURL() + "/range/interval?nodeId=" + nodeId;
      if (Array.isArray(sourceIds)) {
        url += "&" + sourceIds.map(function(e) {
          return "sourceIds=" + encodeURIComponent(e);
        }).join("&");
      }
      return url;
    }
    function availableSourcesURL(startDate, endDate) {
      var url = baseURL() + "/range/sources?nodeId=" + nodeId;
      if (startDate !== undefined) {
        url += "&start=" + encodeURIComponent(sn.format.dateFormat(startDate));
      }
      if (endDate !== undefined) {
        url += "&end=" + encodeURIComponent(sn.format.dateFormat(endDate));
      }
      return url;
    }
    function dateTimeListURL(startDate, endDate, agg, sourceIds, pagination) {
      var url = baseURL() + "/datum/list?nodeId=" + nodeId;
      if (startDate) {
        url += "&startDate=" + encodeURIComponent(sn.format.dateTimeFormatURL(startDate));
      }
      if (endDate) {
        url += "&endDate=" + encodeURIComponent(sn.format.dateTimeFormatURL(endDate));
      }
      if (agg) {
        url += "&aggregate=" + encodeURIComponent(agg);
      }
      if (Array.isArray(sourceIds) && sourceIds.length > 0) {
        url += "&" + sourceIds.map(function(e) {
          return "sourceIds=" + encodeURIComponent(e);
        }).join("&");
      }
      if (pagination !== undefined) {
        if (pagination.max > 0) {
          url += "&max=" + encodeURIComponent(pagination.max);
        }
        if (pagination.offset > 0) {
          url += "&offset=" + encodeURIComponent(pagination.offset);
        }
      }
      return url;
    }
    function mostRecentURL(sourceIds) {
      var url = baseURL() + "/datum/mostRecent?nodeId=" + nodeId;
      if (Array.isArray(sourceIds)) {
        url += "&" + sourceIds.map(function(e) {
          return "sourceIds=" + encodeURIComponent(e);
        }).join("&");
      }
      return url;
    }
    function nodeID(value) {
      if (!arguments.length) return nodeId;
      nodeId = value;
      return that;
    }
    function keyDescription() {
      return "node " + nodeId;
    }
    Object.defineProperties(that, {
      secureQuery: {
        get: function() {
          return config.secureQuery === true;
        },
        enumerable: true
      },
      keyDescription: {
        value: keyDescription
      },
      nodeId: {
        get: function() {
          return nodeId;
        },
        enumerable: true
      },
      nodeID: {
        value: nodeID
      },
      hostURL: {
        value: hostURL
      },
      baseURL: {
        value: baseURL
      },
      reportableIntervalURL: {
        value: reportableIntervalURL
      },
      availableSourcesURL: {
        value: availableSourcesURL
      },
      dateTimeListURL: {
        value: dateTimeListURL
      },
      mostRecentURL: {
        value: mostRecentURL
      }
    });
    (function() {
      if (Array.isArray(sn_api_node_urlHelperFunctions)) {
        sn_api_node_urlHelperFunctions.forEach(function(helper) {
          if (that.hasOwnProperty(helper.name) === false) {
            Object.defineProperty(that, helper.name, {
              value: function() {
                return helper.func.apply(that, arguments);
              }
            });
          }
        });
      }
    })();
    return that;
  };
  function sn_api_node_registerUrlHelperFunction(name, func) {
    if (typeof func !== "function") {
      return;
    }
    if (sn_api_node_urlHelperFunctions === undefined) {
      sn_api_node_urlHelperFunctions = [];
    }
    name = name.replace(/[^0-9a-zA-Z_]/, "");
    sn_api_node_urlHelperFunctions.push({
      name: name,
      func: func
    });
  }
  sn.api.user.registerUrlHelperFunction = sn_api_user_registerUrlHelperFunction;
  var sn_api_user_urlHelperFunctions;
  function sn_api_user_baseURL(urlHelper) {
    return urlHelper.hostURL() + (sn.config && sn.config.solarUserPath ? sn.config.solarUserPath : "/solaruser") + "/api/v1/sec";
  }
  /**
 * An active user-specific URL utility object. This object does not require
 * any specific user ID to be configured, as all requests are assumed to apply
 * to the active user credentials.
 * 
 * @class
 * @constructor
 * @param {Object} configuration The configuration options to use.
 * @returns {sn.api.user.userUrlHelper}
 * @preserve
 */
  sn.api.user.userUrlHelper = function(configuration) {
    var self = {
      version: "1.0.0"
    };
    var config = sn.util.copy(configuration, {
      host: "data.solarnetwork.net",
      tls: true,
      path: "/solaruser",
      secureQuery: true
    });
    /**
	 * Get a URL for just the SolarNet host, without any path.
	 *
	 * @returns {String} the URL to the SolarNet host
	 * @memberOf sn.datum.nodeUrlHelper
	 * @preserve
	 */
    function hostURL() {
      return "http" + (config.tls === true ? "s" : "") + "://" + config.host;
    }
    /**
	 * Get a URL for the SolarNet host and the base API path, e.g. <code>/solaruser/api/v1/sec</code>.
	 *
	 * @returns {String} the URL to the SolarUser base API path
	 * @memberOf sn.api.user.userUrlHelper
	 * @preserve
	 */
    function baseURL() {
      return hostURL() + config.path + "/api/v1/" + (config.secureQuery === true ? "sec" : "pub");
    }
    /**
	 * Get a description of this helper object.
	 *
	 * @return {String} The description of this object.
	 * @memberOf sn.api.user.userUrlHelper
	 * @preserve
	 */
    function keyDescription() {
      return "user";
    }
    /**
	 * Generate a SolarUser {@code /nodes} URL.
	 * 
	 * @return {String} the URL to access the active user's nodes
	 * @memberOf sn.api.user.userUrlHelper
	 * @preserve
	 */
    function viewNodesURL() {
      var url = baseURL() + "/nodes";
      return url;
    }
    Object.defineProperties(self, {
      keyDescription: {
        value: keyDescription
      },
      hostURL: {
        value: hostURL
      },
      baseURL: {
        value: baseURL
      },
      viewNodesURL: {
        value: viewNodesURL
      }
    });
    (function() {
      if (Array.isArray(sn_api_user_urlHelperFunctions)) {
        sn_api_user_urlHelperFunctions.forEach(function(helper) {
          if (self.hasOwnProperty(helper.name) === false) {
            Object.defineProperty(self, helper.name, {
              value: function() {
                return helper.func.apply(self, arguments);
              }
            });
          }
        });
      }
    })();
    return self;
  };
  /**
 * Register a custom function to generate URLs with {@link sn.api.user.userUrlHelper}.
 * 
 * @param {String} name The name to give the custom function. By convention the function
 *                      names should end with 'URL'.
 * @param {Function} func The function to add to sn.api.user.userUrlHelper instances.
 * @preserve
 */
  function sn_api_user_registerUrlHelperFunction(name, func) {
    if (typeof func !== "function") {
      return;
    }
    if (sn_api_user_urlHelperFunctions === undefined) {
      sn_api_user_urlHelperFunctions = [];
    }
    name = name.replace(/[^0-9a-zA-Z_]/, "");
    sn_api_user_urlHelperFunctions.push({
      name: name,
      func: func
    });
  }
  sn_api_node_registerUrlHelperFunction("viewInstruction", sn_api_user_viewInstruction);
  sn_api_node_registerUrlHelperFunction("viewActiveInstructionsURL", sn_api_user_viewActiveInstructionsURL);
  sn_api_node_registerUrlHelperFunction("viewPendingInstructionsURL", sn_api_user_viewPendingInstructionsURL);
  sn_api_node_registerUrlHelperFunction("updateInstructionStateURL", sn_api_user_updateInstructionStateURL);
  sn_api_node_registerUrlHelperFunction("queueInstructionURL", sn_api_user_queueInstructionURL);
  function sn_api_user_viewInstruction(instructionID) {
    return sn_api_user_baseURL(this) + "/instr/view?id=" + encodeURIComponent(instructionID);
  }
  function sn_api_user_viewActiveInstructionsURL() {
    return sn_api_user_baseURL(this) + "/instr/viewActive?nodeId=" + this.nodeId;
  }
  function sn_api_user_viewPendingInstructionsURL() {
    return sn_api_user_baseURL(this) + "/instr/viewPending?nodeId=" + this.nodeId;
  }
  function sn_api_user_updateInstructionStateURL(instructionID, state) {
    return sn_api_user_baseURL(this) + "/instr/updateState?id=" + encodeURIComponent(instructionID) + "&state=" + encodeURIComponent(state);
  }
  /**
 * Generate a URL for posting an instruction request.
 *
 * @param {String} topic - The instruction topic.
 * @param {Array} parameters - An array of parameter objects in the form <code>{name:n1, value:v1}</code>.
 * @preserve
 */
  function sn_api_user_queueInstructionURL(topic, parameters) {
    var url = sn_api_user_baseURL(this) + "/instr/add?nodeId=" + this.nodeId + "&topic=" + encodeURIComponent(topic);
    if (Array.isArray(parameters)) {
      var i, len;
      for (i = 0, len = parameters.length; i < len; i++) {
        url += "&" + encodeURIComponent("parameters[" + i + "].name") + "=" + encodeURIComponent(parameters[i].name) + "&" + encodeURIComponent("parameters[" + i + "].value") + "=" + encodeURIComponent(parameters[i].value);
      }
    }
    return url;
  }
  /**
 * Manage the state of a boolean control switch using SolarNetwork SetControlParameter instructions.
 * 
 * @preserve
 */
  sn.api.control.toggler = function(urlHelper) {
    "use strict";
    var self = {
      version: "1.3.0"
    };
    var timer;
    var lastKnownStatus;
    var lastKnownInstruction;
    var lastHadCredentials;
    var callback;
    var refreshMs = 2e4;
    var pendingRefreshMs = 5e3;
    var controlID = "/power/switch/1";
    var nodeUrlHelper = urlHelper;
    var secHelper = sn.net.sec;
    function notifyDelegate(error) {
      if (callback !== undefined) {
        try {
          callback.call(self, error);
        } catch (callbackError) {
          sn.log("Error in callback: {0}", callbackError);
        }
      }
    }
    function getActiveInstruction(data) {
      if (!Array.isArray(data) || data.length === 0) {
        return undefined;
      }
      var instruction = data.reduce(function(prev, curr) {
        if (curr.topic === "SetControlParameter" && Array.isArray(curr.parameters) && curr.parameters.length > 0 && curr.parameters[0].name === controlID && (prev === undefined || prev.created < curr.created)) {
          return curr;
        }
        return prev;
      }, undefined);
      if (instruction !== undefined) {
        sn.log("Active instruction for {3} found in state {0} (set control {1} to {2})", instruction.state, controlID, instruction.parameters[0].value, nodeUrlHelper.keyDescription());
      }
      return instruction;
    }
    function lastKnownInstructionState() {
      return lastKnownInstruction === undefined ? undefined : lastKnownInstruction.state;
    }
    function lastKnownInstructionValue() {
      return lastKnownInstruction === undefined ? undefined : Number(lastKnownInstruction.parameters[0].value);
    }
    function currentRefreshMs() {
      return [ "Queued", "Received", "Executing" ].indexOf(lastKnownInstructionState()) < 0 ? refreshMs : pendingRefreshMs;
    }
    function value(desiredValue) {
      if (!arguments.length) return lastKnownStatus === undefined ? undefined : lastKnownStatus.val;
      var q = queue();
      var currentValue = lastKnownStatus === undefined ? undefined : lastKnownStatus.val;
      var pendingState = lastKnownInstructionState();
      var pendingValue = lastKnownInstructionValue();
      if (pendingState === "Queued" && pendingValue !== desiredValue) {
        sn.log("Canceling {2} pending control {0} switch to {1}", controlID, pendingValue, nodeUrlHelper.keyDescription());
        q.defer(secHelper.json, nodeUrlHelper.updateInstructionStateURL(lastKnownInstruction.id, "Declined"), "POST");
        lastKnownInstruction = undefined;
        pendingState = undefined;
        pendingValue = undefined;
      }
      if (currentValue !== desiredValue && pendingValue !== desiredValue) {
        sn.log("Request {2} to change control {0} to {1}", controlID, desiredValue, nodeUrlHelper.keyDescription());
        q.defer(secHelper.json, nodeUrlHelper.queueInstructionURL("SetControlParameter", [ {
          name: controlID,
          value: String(desiredValue)
        } ]), "POST");
      }
      q.awaitAll(function(error, results) {
        if (error) {
          sn.log("Error updating {2} control toggler {0}: {1}", controlID, error.status, nodeUrlHelper.keyDescription());
          notifyDelegate(error);
          return;
        }
        if (results.length < 1) {
          return;
        }
        var cancelResult = results[0];
        if (cancelResult.data == null && cancelResult.success === true) {
          lastKnownInstruction = undefined;
        }
        var instructionResult = results[results.length - 1].data;
        if (!(instructionResult == null)) {
          lastKnownInstruction = instructionResult;
        }
        notifyDelegate();
        if (timer) {
          self.stop();
          self.start(currentRefreshMs());
        }
      });
      return self;
    }
    function mostRecentValue(controlStatus, instruction) {
      var statusDate, instructionDate;
      if (!instruction || instruction.status === "Declined") {
        return controlStatus ? controlStatus.val : undefined;
      } else if (!controlStatus) {
        return Number(instruction.parameters[0].value);
      }
      statusDate = sn_api_timestampFormat.parse(controlStatus.created);
      instructionDate = sn_api_timestampFormat.parse(instruction.created);
      return statusDate.getTime() > instructionDate.getTime() ? controlStatus.val : Number(instruction.parameters[0].value);
    }
    function update() {
      var q = queue();
      q.defer(nodeUrlHelper.secureQuery ? secHelper.json : d3.json, nodeUrlHelper.mostRecentURL([ controlID ]));
      if (secHelper.hasTokenCredentials() === true) {
        q.defer(secHelper.json, nodeUrlHelper.viewPendingInstructionsURL(), "GET");
        if (lastKnownInstruction && [ "Completed", "Declined" ].indexOf(lastKnownInstructionState()) < 0) {
          q.defer(secHelper.json, nodeUrlHelper.viewInstruction(lastKnownInstruction.id));
        }
      }
      q.await(function(error, status, active, executing) {
        if (error) {
          sn.log("Error querying control toggler {0} for {2} status: {1}", controlID, error.status, nodeUrlHelper.keyDescription());
          notifyDelegate(error);
        } else {
          var i, len;
          var controlStatus = undefined;
          if (status.data && Array.isArray(status.data.results)) {
            for (i = 0, len = status.data.results.length; i < len && controlStatus === undefined; i++) {
              if (status.data.results[i].sourceId === controlID) {
                controlStatus = status.data.results[i];
              }
            }
          }
          var execInstruction = executing ? executing.data : undefined;
          var pendingInstruction = active ? getActiveInstruction(active.data) : undefined;
          var newValue = mostRecentValue(controlStatus, execInstruction ? execInstruction : pendingInstruction ? pendingInstruction : lastKnownInstruction);
          var currValue = value();
          if (newValue !== currValue || lastHadCredentials !== secHelper.hasTokenCredentials()) {
            sn.log("Control {0} for {1} value is currently {2}", controlID, nodeUrlHelper.keyDescription(), newValue !== undefined ? newValue : "N/A");
            lastKnownStatus = controlStatus;
            if (lastKnownStatus && !pendingInstruction) {
              lastKnownStatus.val = newValue;
            }
            lastKnownInstruction = execInstruction ? execInstruction : pendingInstruction;
            lastHadCredentials = secHelper.hasTokenCredentials();
            notifyDelegate();
          }
        }
        if (timer !== undefined) {
          timer = setTimeout(update, currentRefreshMs());
        }
      });
      return self;
    }
    /**
	 * Start automatically updating the status of the configured control.
	 * 
	 * @param {Number} when - An optional offset in milliseconds to start at, defaults to 20ms.
	 * @return this object
	 * @memberOf sn.api.control.toggler
	 * @preserve
	 */
    self.start = function(when) {
      if (timer === undefined) {
        timer = setTimeout(update, when || 20);
      }
      return self;
    };
    /**
	 * Stop automatically updating the status of the configured control.
	 * 
	 * @return this object
	 * @memberOf sn.api.control.toggler
	 * @preserve
	 */
    self.stop = function() {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
      return self;
    };
    /**
	 * Get or set the control ID.
	 * 
	 * @param {String} [value] the control ID to set
	 * @return when used as a getter, the current control ID value, otherwise this object
	 * @memberOf sn.api.control.toggler
	 * @preserve
	 */
    self.controlID = function(value) {
      if (!arguments.length) return controlID;
      controlID = value;
      return self;
    };
    /**
	 * Get or set the refresh rate, in milliseconds.
	 * 
	 * @param {Number} [value] the millisecond value to set
	 * @return when used as a getter, the current refresh millisecond value, otherwise this object
	 * @memberOf sn.api.control.toggler
	 * @preserve
	 */
    self.refreshMs = function(value) {
      if (!arguments.length) return refreshMs;
      if (typeof value === "number") {
        refreshMs = value;
      }
      return self;
    };
    /**
	 * Get or set the refresh rate, in milliseconds, when a toggle instruction is queued.
	 * 
	 * @param {Number} [value] the millisecond value to set
	 * @return when used as a getter, the current refresh millisecond value, otherwise this object
	 * @memberOf sn.api.control.toggler
	 * @since 1.2
	 * @preserve
	 */
    self.pendingRefreshMs = function(value) {
      if (!arguments.length) return pendingRefreshMs;
      if (typeof value === "number") {
        pendingRefreshMs = value;
      }
      return self;
    };
    /**
	 * Get or set the {@link sn.api.node.urlHelper} to use.
	 * 
	 * @param {Object} [value] the {@link sn.api.node.urlHelper} to set
	 * @return when used as a getter, the current helper value, otherwise this object
	 * @memberOf sn.api.control.toggler
	 * @preserve
	 */
    self.nodeUrlHelper = function(value) {
      if (!arguments.length) return nodeUrlHelper;
      nodeUrlHelper = value;
      return self;
    };
    /**
	 * Get or set the callback function, which is called after the state of the control changes.
	 * The `this` reference will be set to this object.
	 * 
	 * @param {function} [value] the callback
	 * @return when used as a getter, the current callback function, otherwise this object
	 * @memberOf sn.api.control.toggler
	 * @preserve
	 */
    self.callback = function(value) {
      if (!arguments.length) return callback;
      if (typeof value === "function") {
        callback = value;
      }
      return self;
    };
    Object.defineProperties(self, {
      pendingInstructionState: {
        value: lastKnownInstructionState
      },
      pendingInstructionValue: {
        value: lastKnownInstructionValue
      },
      lastKnownInstructionState: {
        value: lastKnownInstructionState
      },
      lastKnownInstructionValue: {
        value: lastKnownInstructionValue
      },
      value: {
        value: value
      }
    });
    return self;
  };
  sn.api.datum = {};
  sn.api.datum.aggregateNestedDataLayers = sn_api_datum_aggregateNestedDataLayers;
  /**
 * Combine the layers resulting from a d3.nest() operation into a single, aggregated
 * layer. This can be used to combine all sources of a single data type, for example
 * to show all "power" sources as a single layer of chart data. The resulting object
 * has the same structure as the input <code>layerData</code> parameter, with just a
 * single layer of data.
 * 
 * @param {object} layerData - An object resulting from d3.nest().entries()
 * @param {string} resultKey - The <code>key</code> property to assign to the returned layer.
 * @param {array} copyProperties - An array of string property names to copy as-is from 
 *                                 the <b>first</b> layer's data values.
 * @param {array} sumProperties - An array of string property names to add together from
 *                                <b>all</b> layer data.
 * @param {object} staticProperties - Static properties to copy as-is to all output data.
 * @return {object} An object with the same structure as returned by d3.nest().entries()
 * @since 0.0.4
 * @preserve
 */
  function sn_api_datum_aggregateNestedDataLayers(layerData, resultKey, copyProperties, sumProperties, staticProperties) {
    var layerCount = layerData.length, dataLength, i, j, k, copyPropLength = copyProperties.length, sumPropLength = sumProperties.length, d, val, clone, array;
    dataLength = layerData[0].values.length;
    if (dataLength > 0) {
      array = [];
      for (i = 0; i < dataLength; i += 1) {
        d = layerData[0].values[i];
        clone = {};
        if (staticProperties !== undefined) {
          for (val in staticProperties) {
            if (staticProperties.hasOwnProperty(val)) {
              clone[val] = staticProperties[val];
            }
          }
        }
        for (k = 0; k < copyPropLength; k += 1) {
          clone[copyProperties[k]] = d[copyProperties[k]];
        }
        for (k = 0; k < sumPropLength; k += 1) {
          clone[sumProperties[k]] = 0;
        }
        for (j = 0; j < layerCount; j += 1) {
          for (k = 0; k < sumPropLength; k += 1) {
            val = layerData[j].values[i][sumProperties[k]];
            if (val !== undefined) {
              clone[sumProperties[k]] += val;
            }
          }
        }
        array.push(clone);
      }
      layerData = [ {
        key: resultKey,
        values: array
      } ];
    }
    return layerData;
  }
  sn.format = {};
  sn.format.dateTimeFormat = d3.time.format.utc("%Y-%m-%d %H:%M");
  sn.format.timestampFormat = d3.time.format.utc("%Y-%m-%d %H:%M:%S.%LZ");
  sn.format.dateTimeFormatLocal = d3.time.format("%Y-%m-%d %H:%M");
  sn.format.dateTimeFormatURL = d3.time.format.utc("%Y-%m-%dT%H:%M");
  sn.format.dateFormat = d3.time.format.utc("%Y-%m-%d");
  sn.api.datum.datumDate = sn_api_datum_datumDate;
  /**
 * Get a Date object for a datum. This function will return the first available date according
 * to the first available property found according to these rules:
 * 
 * <ol>
 * <li><code>date</code> - assumed to be a Date object already</li>
 * <li><code>localDate</code> - a string in <b>yyyy-MM-dd</b> form, optionally with a String
 *     <code>localTime</code> property for an associated time in <b>HH:mm</b> form.</li>
 * <li><code>created</code> - a string in <b>yyyy-MM-dd HH:mm:ss.SSS'Z'</b> form.</li>
 * </ul>
 *
 * @param {Object} d The datum to get the Date for.
 * @returns {Date} The found Date, or <em>null</em> if not available
 * @preserve
 */
  function sn_api_datum_datumDate(d) {
    if (d) {
      if (d.date) {
        return d.date;
      } else if (d.localDate) {
        return sn.format.dateTimeFormat.parse(d.localDate + (d.localTime ? " " + d.localTime : " 00:00"));
      } else if (d.created) {
        return sn.format.timestampFormat.parse(d.created);
      }
    }
    return null;
  }
  sn.log = sn_log;
  function sn_log() {
    if (sn.config.debug === true && console !== undefined) {
      console.log(sn.format.fmt.apply(this, arguments));
    }
  }
  /**
 * Load data for a set of source IDs, date range, and aggregate level using the 
 * {@code dateTimeListURL} endpoint. This object is designed 
 * to be used once per query. After creating the object and configuring an asynchronous
 * callback function with {@link #callback(function)}, call {@link #load()} to start
 * loading the data. The callback function will be called once all data has been loaded.
 * 
 * @class
 * @param {string[]} sourceIds - array of source IDs to load data for
 * @param {function} urlHelper - a {@link sn.nodeUrlHelper} or {@link sn.locationUrlHelper}
 * @param {date} start - the start date, or {@code null}
 * @param {date} end - the end date, or {@code null}
 * @param {string} aggregate - aggregate level
 * @returns {sn.api.datum.loader}
 * @preserve
 */
  sn.api.datum.loader = function(sourceIds, urlHelper, start, end, aggregate) {
    var that = {
      version: "1.0.0"
    };
    var finishedCallback;
    var urlParameters;
    var state = 0;
    var results;
    function requestCompletionHandler(error) {
      state = 2;
      if (finishedCallback) {
        finishedCallback.call(that, error, results);
      }
    }
    function loadData(offset) {
      var pagination = {}, url, dataExtractor, offsetExtractor;
      if (offset) {
        pagination.offset = offset;
      }
      url = urlHelper.dateTimeListURL(start, end, aggregate, sourceIds, pagination);
      if (urlParameters) {
        (function() {
          var tmp = sn_net_encodeURLQueryTerms(urlParameters);
          if (tmp.length) {
            url += "&" + tmp;
          }
        })();
      }
      dataExtractor = function(json) {
        if (json.success !== true || json.data === undefined || Array.isArray(json.data.results) !== true) {
          return undefined;
        }
        return json.data.results;
      };
      offsetExtractor = function(json) {
        return json.data.returnedResultCount + json.data.startingOffset < json.data.totalResults ? json.data.returnedResultCount + json.data.startingOffset : 0;
      };
      d3.json(url, function(error, json) {
        var dataArray, nextOffset;
        if (error) {
          sn.log("Error requesting data for {0}: {2}", urlHelper.keyDescription(), error);
          return;
        }
        dataArray = dataExtractor(json);
        if (dataArray === undefined) {
          sn.log("No data available for {0}", urlHelper.keyDescription());
          requestCompletionHandler(error);
          return;
        }
        if (results === undefined) {
          results = dataArray;
        } else {
          results = results.concat(dataArray);
        }
        nextOffset = offsetExtractor(json);
        if (nextOffset > 0) {
          loadData(nextOffset);
        } else {
          requestCompletionHandler(error);
        }
      });
    }
    /**
	 * Get or set the callback function, invoked after all data has been loaded. The callback
	 * function will be passed two arguments: an error and the results.
	 * 
	 * @param {function} [value] the callback function to use
	 * @return when used as a getter, the current callback function, otherwise this object
	 * @memberOf sn.api.datum.loader
	 * @preserve
	 */
    that.callback = function(value) {
      if (!arguments.length) {
        return finishedCallback;
      }
      if (typeof value === "function") {
        finishedCallback = value;
      }
      return that;
    };
    /**
	 * Get or set additional URL parameters. The parameters are set as object properties.
	 * If a property value is an array, multiple parameters for that property will be added.
	 * 
	 * @param {object} [value] the URL parameters to include with the JSON request
	 * @return when used as a getter, the URL parameters, otherwise this object
	 * @memberOf sn.api.datum.loader
	 * @preserve
	 */
    that.urlParameters = function(value) {
      if (!arguments.length) return urlParameters;
      if (typeof value === "object") {
        urlParameters = value;
      }
      return that;
    };
    /**
	 * Initiate loading the data. As an alternative to configuring the callback function via
	 * the {@link #callback(value)} method, a callback function can be passed as an argument
	 * to this function. This allows this function to be passed to <code>queue.defer</code>,
	 * for example.
	 * 
	 * @param {function} [callback] a callback function to use
	 * @return this object
	 * @memberOf sn.api.datum.loader
	 * @preserve
	 */
    that.load = function(callback) {
      if (typeof callback === "function") {
        finishedCallback = callback;
      }
      state = 1;
      loadData();
      return that;
    };
    return that;
  };
  sn.api.datum.loaderQueryRange = sn_api_datum_loaderQueryRange;
  /**
 * Get a query range appropriate for using with {@link sn.api.datum.loader}. Returns an object
 * with <code>start</code> and <code>end</code> Date properties, using the given <code>endDate</code>
 * parameter as the basis for calculating the start as an offset, based on the given <code>aggregate</code>
 * level.
 * 
 * @param {string} aggregate - the aggregate level
 * @param {object} aggregateTimeCount - either a Number or an Object with Number properties named 
 *                 <code>numXs</code> where <code>X</code> is the aggregate level, representing
 *                 the number of aggregate time units to include in the query
 * @param {Date} endDate - the end date
 * @returns {Object}
 * @since 0.0.4
 * @preserve
 */
  function sn_api_datum_loaderQueryRange(aggregate, aggregateTimeCount, endDate) {
    var end, start, timeUnit, timeCount, precision;
    function exclusiveEndDate(time, date) {
      var result = time.utc.ceil(date);
      if (result.getTime() === date.getTime()) {
        result = time.offset(result, 1);
      }
      return result;
    }
    function timeCountValue(propName) {
      var result;
      if (isNaN(Number(aggregateTimeCount))) {
        if (aggregateTimeCount[propName] !== undefined) {
          result = Number(aggregateTimeCount[propName]);
        } else {
          result = 1;
        }
      } else {
        result = aggregateTimeCount;
      }
      if (typeof result !== "number") {
        result = 1;
      }
      return result;
    }
    function precisionValue(agg) {
      var result = 10;
      if (agg.search(/^Five/) === 0) {
        result = 5;
      } else if (agg.search(/^Fifteen/) === 0) {
        result = 15;
      }
      return result;
    }
    if (aggregate.search(/Minute$/) >= 0) {
      timeCount = timeCountValue("numHours");
      timeUnit = "hour";
      end = exclusiveEndDate(d3.time.minute, endDate);
      precision = precisionValue(aggregate);
      end.setUTCMinutes(end.getUTCMinutes() + precision - end.getUTCMinutes() % precision, 0, 0);
      start = d3.time.hour.utc.offset(end, -timeCount);
    } else if (aggregate === "Month") {
      timeCount = timeCountValue("numYears");
      timeUnit = "year";
      end = exclusiveEndDate(d3.time.month, endDate);
      start = d3.time.year.utc.offset(d3.time.month.utc.floor(endDate), -timeCount);
    } else if (aggregate === "Day") {
      timeCount = timeCountValue("numMonths");
      timeUnit = "month";
      end = exclusiveEndDate(d3.time.day, endDate);
      start = d3.time.month.utc.offset(d3.time.day.utc.floor(endDate), -timeCount);
    } else {
      timeCount = timeCountValue("numDays");
      timeUnit = "day";
      end = exclusiveEndDate(d3.time.hour, endDate);
      start = d3.time.day.utc.offset(d3.time.hour.utc.floor(end), -timeCount);
    }
    return {
      start: start,
      end: end,
      timeUnit: timeUnit,
      timeCount: timeCount
    };
  }
  /**
 * Load data from multiple {@link sn.api.datum.loader} objects, invoking a callback function
 * after all data has been loaded. Call {@link #load()} to start loading the data.
 * 
 * @class
 * @param {sn.api.datum.loader[]} loaders - array of {@link sn.api.datum.loader} objects
 * @returns {sn.api.datum.multiLoader}
 * @preserve
 */
  sn.api.datum.multiLoader = function(loaders) {
    var that = {
      version: "1.0.0"
    };
    var finishedCallback, q = queue();
    that.callback = function(value) {
      if (!arguments.length) {
        return finishedCallback;
      }
      if (typeof value === "function") {
        finishedCallback = value;
      }
      return that;
    };
    that.load = function() {
      loaders.forEach(function(e) {
        q.defer(e.load);
      });
      q.awaitAll(function(error, results) {
        if (finishedCallback) {
          finishedCallback.call(that, error, results);
        }
      });
      return that;
    };
    return that;
  };
  sn.api.datum.nestedStackDataNormalizeByDate = sn_api_datum_nestedStackDataNormalizeByDate;
  /**
 * Normalize the data arrays resulting from a <code>d3.nest</code> operation so that all
 * group value arrays have the same number of elements, based on a Date property named 
 * <code>date</code>. The data values are assumed to be sorted by <code>date</code> already.
 * The value arrays are modified in-place. This makes the data suitable to passing to 
 * <code>d3.stack</code>, which expects all stack data arrays to have the same number of 
 * values, for the same keys.
 * 
 * The <code>layerData</code> parameter should look something like this:
 * 
 * <pre>[
 *   { key : 'A', values : [{date : Date(2011-12-02 12:00)}, {date : Date(2011-12-02 12:10)}] },
 *   { key : 'B', values : [{date : Date(2011-12-02 12:00)}] }
 * ]</pre>
 * 
 * After calling this method, <code>layerData</code> would look like this (notice the 
 * filled in secod data value in the <b>B</b> group):
 * 
 * <pre>[
 *   { key : 'A', values : [{date : Date(2011-12-02 12:00)}, {date : Date(2011-12-02 12:10)}] },
 *   { key : 'B', values : [{date : Date(2011-12-02 12:00)}, {date : Date(2011-12-02 12:10)}] }] }
 * ]</pre>
 * 
 * @param {array} layerData - An arry of objects, each object with a <code>key</code> group ID
 *                            and a <code>values</code> array of data objects.
 * @param {object} fillTemplate - An object to use as a template for any "filled in" data objects.
 *                                The <code>date</code> property will be populated automatically.
 *
 * @param {array} fillFn - An optional function to fill in objects with.
 * @since 0.0.4
 * @preserve
 */
  function sn_api_datum_nestedStackDataNormalizeByDate(layerData, fillTemplate, fillFn) {
    var i = 0, j, k, jMax = layerData.length - 1, dummy, prop, copyIndex;
    if (jMax > 0) {
      while (i < d3.max(layerData.map(function(e) {
        return e.values.length;
      }))) {
        dummy = undefined;
        for (j = 0; j <= jMax; j++) {
          if (layerData[j].values.length <= i) {
            continue;
          }
          if (j < jMax) {
            k = j + 1;
          } else {
            k = 0;
          }
          if (layerData[k].values.length <= i || layerData[j].values[i].date.getTime() < layerData[k].values[i].date.getTime()) {
            dummy = {
              date: layerData[j].values[i].date,
              sourceId: layerData[k].key
            };
            if (fillTemplate) {
              for (prop in fillTemplate) {
                if (fillTemplate.hasOwnProperty(prop)) {
                  dummy[prop] = fillTemplate[prop];
                }
              }
            }
            if (fillFn) {
              copyIndex = layerData[k].values.length > i ? i : i > 0 ? i - 1 : null;
              fillFn(dummy, layerData[k].key, copyIndex !== null ? layerData[k].values[copyIndex] : undefined);
            }
            layerData[k].values.splice(i, 0, dummy);
          }
        }
        if (dummy === undefined) {
          i++;
        }
      }
    }
  }
  /**
 * Calculate a sum total aggregate for a single property over all time on a single SolarNode
 * for a set of source IDs. The class periodically updates the total as time progresses, to
 * keep the total up to date. Configure the class by calling the various methods on it before
 * calling the {@link #start()} method. For example:
 * 
 * <pre>var counter = sn.api.datum.sumCounter(myUrlHelper)
 *     .sourceIds('Main')
 *     .callback(function(sum) {
 *         sn.log('Got sum: {0}', sum);
 *      })
 *      .start();
 * </pre>
 * 
 * @class
 * @param {function} nodeUrlHelper - a {@link sn.api.node.urlHelper}
 * @returns {sn.api.datum.sumCounter}
 * @preserve
 */
  sn.api.datum.sumCounter = function(nodeUrlHelper) {
    var that = {
      version: "1.1.0"
    };
    var callback, sourceIds = [ "Main" ], aggProperty = "wattHours", refreshMs = 6e4, timer, aggValue = 0;
    function sumResults(results) {
      var sum = 0;
      results.forEach(function(d) {
        var val = Number(d[aggProperty]);
        if (isNaN(val)) {
          val = 0;
        }
        sum += val;
      });
      return sum;
    }
    function performSum(finishedCallback) {
      sn.api.datum.loader(sourceIds, nodeUrlHelper, null, null, "RunningTotal").callback(function(error, results) {
        var sum = error ? 0 : sumResults(results);
        aggValue = sum;
        finishedCallback();
      }).load();
    }
    function update() {
      function finished() {
        if (callback) {
          callback.call(that, aggValue);
        }
        if (timer !== undefined) {
          timer = setTimeout(update, refreshMs);
        }
      }
      performSum(finished);
    }
    /**
	 * Start updating the counter.
	 * 
	 * @return this object
	 * @memberOf sn.api.datum.sumCounter
	 * @preserve
	 */
    function start() {
      if (timer !== undefined) {
        return;
      }
      timer = setTimeout(update, 20);
      return that;
    }
    /**
	 * Stop updating the counter.
	 * 
	 * @return this object
	 * @memberOf sn.api.datum.sumCounter
	 * @preserve
	 */
    function stop() {
      if (timer === undefined) {
        return;
      }
      clearTimeout(timer);
      timer = undefined;
      return that;
    }
    /**
	 * Get or set the callback function. The callback will be passed the current sum total, whenever the sum total changes.
	 * 
	 * @param {function} [value] the source exclude callback
	 * @return when used as a getter, the current source exclude callback function, otherwise this object
	 * @memberOf sn.api.datum.sumCounter
	 * @preserve
	 */
    that.callback = function(value) {
      if (!arguments.length) return callback;
      if (typeof value === "function") {
        callback = value;
      }
      return that;
    };
    /**
	 * Get or set the callback function. The callback will be passed the current sum total, whenever the sum total changes.
	 * 
	 * @param {array|string} [value] the array of source ID values, or if a string a comma-delimited list of source ID values
	 * @return when used as a getter, the current source IDs, otherwise this object
	 * @memberOf sn.api.datum.sumCounter
	 * @preserve
	 */
    that.sourceIds = function(value) {
      if (!arguments.length) return sourceIds;
      if (Array.isArray(value)) {
        sourceIds = value;
      } else if (typeof value === "string") {
        sourceIds = value.split(/\s*,\s*/);
      }
      return that;
    };
    Object.defineProperties(that, {
      start: {
        value: start
      },
      stop: {
        value: stop
      }
    });
    return that;
  };
  sn.api.node.availableDataRange = sn_api_node_availableDataRange;
  /**
 * Call the {@code reportableIntervalURL} web service for a set of source IDs and
 * invoke a callback function with the results.
 * 
 * <p>The callback function will be passed the same 'data' object returned
 * by the {@code reportableIntervalURL} endpoint, but the start/end dates will be
 * a combination of the earliest available and latest available results for
 * every different node ID provided.
 * 
 * @param {Array} sourceSets An array of objects, each with a {@code sourceIds} array 
 *                property and a {@code nodeUrlHelper} {@code sn.api.node.nodeUrlHelper}
 *                or {@code locationUrlHelper} {@code sn.datum.locationUrlHelper}
 *                propery.
 * @param {Function} [callback] A callback function which will be passed the result object.
 * @preserve
 */
  function sn_api_node_availableDataRange(sourceSets, callback) {
    var q = queue(), helpers = [];
    (function() {
      var i, url, urlHelper;
      for (i = 0; i < sourceSets.length; i += 1) {
        if (sourceSets[i].nodeUrlHelper) {
          urlHelper = sourceSets[i].nodeUrlHelper;
        } else if (sourceSets[i].locationUrlHelper) {
          urlHelper = sourceSets[i].locationUrlHelper;
        } else {
          urlHelper = sourceSets[i].urlHelper;
        }
        if (urlHelper && urlHelper.reportableIntervalURL) {
          helpers.push(urlHelper);
          url = urlHelper.reportableIntervalURL(sourceSets[i].sourceIds);
          q.defer(d3.json, url);
        }
      }
    })();
    function extractReportableInterval(results) {
      var result, i = 0, repInterval;
      for (i = 0; i < results.length; i += 1) {
        repInterval = results[i];
        if (repInterval.data === undefined || repInterval.data.endDate === undefined) {
          sn.log("No data available for {0} sources {1}", helpers[i].keyDescription(), sourceSets[i].sourceIds.join(","));
          continue;
        }
        repInterval = repInterval.data;
        if (result === undefined) {
          result = repInterval;
        } else {
          if (repInterval.endDateMillis > result.endDateMillis) {
            result.endDateMillis = repInterval.endDateMillis;
            result.endDate = repInterval.endDate;
          }
          if (repInterval.startDateMillis < result.startDateMillis) {
            result.startDateMillis = repInterval.startDateMillis;
            result.startDate = repInterval.startDate;
          }
        }
      }
      return result;
    }
    q.awaitAll(function(error, results) {
      if (error) {
        sn.log("Error requesting available data range: " + error);
        return;
      }
      var intervalObj = extractReportableInterval(results);
      if (intervalObj.startDateMillis !== undefined) {
        intervalObj.sDate = new Date(intervalObj.startDateMillis);
      }
      if (intervalObj.endDateMillis !== undefined) {
        intervalObj.eDate = new Date(intervalObj.endDateMillis);
      }
      if (typeof callback === "function") {
        callback(intervalObj);
      }
    });
  }
  sn.api.node.availableSources = sn_api_node_availableSources;
  /**
 * Call the {@code availableSourcesURL} web service and invoke a callback function with the results.
 * 
 * <p>The callback function will be passed an error object and the array of sources.
 * 
 * @param {sn.api.node.nodeUrlHelper} urlHelper A {@link sn.api.node.nodeUrlHelper} or 
                                             {@link sn.datum.locationUrlHelper} object.
 * @param {Function} callback A callback function which will be passed an error object
 *                            and the result array.
 * @preserve
 */
  function sn_api_node_availableSources(urlHelper, callback) {
    if (!(urlHelper && urlHelper.availableSourcesURL && callback)) {
      return;
    }
    var url = urlHelper.availableSourcesURL();
    d3.json(url, function(error, json) {
      var sources;
      if (error) {
        callback(error);
      } else if (!json) {
        callback("No data returned from " + url);
      } else if (json.success !== true) {
        callback(json.message ? json.message : "Query not successful.");
      } else {
        sources = Array.isArray(json.data) ? json.data.sort() : [];
        sources.sort();
        callback(null, sources);
      }
    });
  }
  sn.api.loc = {};
  sn.api.loc.registerUrlHelperFunction = sn_api_loc_registerUrlHelperFunction;
  var sn_api_loc_urlHelperFunctions;
  /**
 * A location-specific URL utility object.
 * 
 * @class
 * @constructor
 * @param {Number} location The location ID to use.
 * @param {Object} configuration The configuration options to use.
 * @returns {sn.api.loc.locationUrlHelper}
 * @preserve
 */
  sn.api.loc.locationUrlHelper = function(location, configuration) {
    var that = {
      version: "1.0.0"
    };
    var locationId = location;
    var config = sn.util.copy(configuration, {
      host: "data.solarnetwork.net",
      tls: true,
      path: "/solarquery",
      secureQuery: false
    });
    /**
	 * Get a URL for just the SolarNet host, without any path.
	 *
	 * @returns {String} the URL to the SolarNet host
	 * @memberOf sn.api.node.nodeUrlHelper
	 * @preserve
	 */
    function hostURL() {
      return "http" + (config.tls === true ? "s" : "") + "://" + config.host;
    }
    /**
	 * Get a URL for the SolarNet host and the base API path, e.g. <code>/solarquery/api/v1/sec</code>.
	 *
	 * @returns {String} the URL to the SolarNet base API path
	 * @memberOf sn.api.loc.locationUrlHelper
	 * @preserve
	 */
    function baseURL() {
      return hostURL() + config.path + "/api/v1/" + (config.secureQuery === true ? "sec" : "pub");
    }
    /**
	 * Get a URL for the "reportable interval" for this location, optionally limited to a specific source ID.
	 *
	 * @param {Array} sourceIds An array of source IDs to limit query to. If not provided then all available 
	 *                sources will be returned.
	 * @returns {String} the URL to find the reportable interval
	 * @memberOf sn.api.loc.locationUrlHelper
	 * @preserve
	 */
    function reportableIntervalURL(sourceIds) {
      var url = baseURL() + "/location/datum/interval?locationId=" + locationId;
      if (Array.isArray(sourceIds)) {
        url += "&" + sourceIds.map(function(e) {
          return "sourceIds=" + encodeURIComponent(e);
        }).join("&");
      }
      return url;
    }
    /**
	 * Get a available source IDs for this location, optionally limited to a date range.
	 *
	 * @param {Date} startDate An optional start date to limit the results to.
	 * @param {Date} endDate An optional end date to limit the results to.
	 * @returns {String} the URL to find the available source
	 * @memberOf sn.api.loc.locationUrlHelper
	 * @preserve
	 */
    function availableSourcesURL(startDate, endDate) {
      var url = baseURL() + "/location/datum/sources?locationId=" + locationId;
      if (startDate !== undefined) {
        url += "&start=" + encodeURIComponent(sn.format.dateFormat(startDate));
      }
      if (endDate !== undefined) {
        url += "&end=" + encodeURIComponent(sn.format.dateFormat(endDate));
      }
      return url;
    }
    /**
	 * Generate a SolarNet {@code /datum/list} URL.
	 * 
	 * @param {Date} startDate The starting date for the query, or <em>null</em> to omit
	 * @param {Date} endDate The ending date for the query, or <em>null</em> to omit
	 * @param {String|Number} agg A supported aggregate type (e.g. Hour, Day, etc) or a minute precision Number
	 * @param {Array} sourceIds Array of source IDs to limit query to
	 * @param {Object} pagination An optional pagination object, with <code>offset</code> and <code>max</code> properties.
	 * @return {String} the URL to perform the list with
	 * @memberOf sn.api.loc.locationUrlHelper
	 * @preserve
	 */
    function dateTimeListURL(startDate, endDate, agg, sourceIds, pagination) {
      var url = baseURL() + "/location/datum/list?locationId=" + locationId;
      if (startDate) {
        url += "&startDate=" + encodeURIComponent(sn.format.dateTimeFormatURL(startDate));
      }
      if (endDate) {
        url += "&endDate=" + encodeURIComponent(sn.format.dateTimeFormatURL(endDate));
      }
      if (agg) {
        url += "&aggregate=" + encodeURIComponent(agg);
      }
      if (Array.isArray(sourceIds)) {
        url += "&" + sourceIds.map(function(e) {
          return "sourceIds=" + encodeURIComponent(e);
        }).join("&");
      }
      if (pagination !== undefined) {
        if (pagination.max > 0) {
          url += "&max=" + encodeURIComponent(pagination.max);
        }
        if (pagination.offset > 0) {
          url += "&offset=" + encodeURIComponent(pagination.offset);
        }
      }
      return url;
    }
    /**
	 * Generate a SolarNet {@code /datum/mostRecent} URL.
	 * 
	 * @param {Array} sourceIds Array of source IDs to limit query to
	 * @return {String} the URL to perform the most recent query with
	 * @memberOf sn.api.loc.locationUrlHelper
	 * @preserve
	 */
    function mostRecentURL(sourceIds) {
      var url = baseURL() + "/location/datum/mostRecent?locationId=" + locationId;
      if (Array.isArray(sourceIds)) {
        url += "&" + sourceIds.map(function(e) {
          return "sourceIds=" + encodeURIComponent(e);
        }).join("&");
      }
      return url;
    }
    /**
	 * Get or set the location ID to use.
	 * 
	 * @param {String} [value] the location ID to use
	 * @return when used as a getter, the location ID, otherwise this object
	 * @memberOf sn.api.loc.locationUrlHelper
	 * @preserve
	 */
    function locationID(value) {
      if (!arguments.length) return locationId;
      locationId = value;
      return that;
    }
    /**
	 * Get a description of this helper object.
	 *
	 * @return {String} The description of this object.
	 * @memberOf sn.api.node.nodeUrlHelper
	 * @preserve
	 */
    function keyDescription() {
      return "node " + nodeId;
    }
    Object.defineProperties(that, {
      keyDescription: {
        value: keyDescription
      },
      locationId: {
        get: function() {
          return locationId;
        },
        enumerable: true
      },
      locationID: {
        value: locationID
      },
      hostURL: {
        value: hostURL
      },
      baseURL: {
        value: baseURL
      },
      reportableIntervalURL: {
        value: reportableIntervalURL
      },
      availableSourcesURL: {
        value: availableSourcesURL
      },
      dateTimeListURL: {
        value: dateTimeListURL
      },
      mostRecentURL: {
        value: mostRecentURL
      }
    });
    (function() {
      if (Array.isArray(sn_api_loc_urlHelperFunctions)) {
        sn_api_loc_urlHelperFunctions.forEach(function(helper) {
          if (that.hasOwnProperty(helper.name) === false) {
            Object.defineProperty(that, helper.name, {
              value: function() {
                return helper.func.apply(that, arguments);
              }
            });
          }
        });
      }
    })();
    return that;
  };
  /**
 * Register a custom function to generate URLs with {@link sn.api.loc.locationUrlHelper}.
 * 
 * @param {String} name The name to give the custom function. By convention the function
 *                      names should end with 'URL'.
 * @param {Function} func The function to add to sn.api.loc.locationUrlHelper instances.
 * @preserve
 */
  function sn_api_loc_registerUrlHelperFunction(name, func) {
    if (typeof func !== "function") {
      return;
    }
    if (sn_api_loc_urlHelperFunctions === undefined) {
      sn_api_loc_urlHelperFunctions = [];
    }
    name = name.replace(/[^0-9a-zA-Z_]/, "");
    sn_api_loc_urlHelperFunctions.push({
      name: name,
      func: func
    });
  }
  sn.chart = {};
  /**
 * A configuration utility object.
 * 
 * For any properties passed on {@code initialMap}, getter/setter accessors will be defined
 * on the returned {@code sn.Configuration} instance, so you can use normal JavaScript
 * accessor methods to get/set those values. You can always get/set arbitrary values using
 * the {@link #value(key, newValue)} function.
 * 
 * @class
 * @constructor
 * @param {Object} initialMap the initial properties to store (optional)
 * @returns {sn.Configuration}
 * @preserve
 */
  sn.Configuration = function(initialMap) {
    this.map = {};
    if (initialMap !== undefined) {
      var me = this;
      (function() {
        var createGetter = function(prop) {
          return function() {
            return me.map[prop];
          };
        };
        var createSetter = function(prop) {
          return function(value) {
            me.map[prop] = value;
          };
        };
        var prop;
        for (prop in initialMap) {
          if (initialMap.hasOwnProperty(prop) && !me.hasOwnProperty(prop)) {
            Object.defineProperty(me, prop, {
              enumerable: true,
              configurable: true,
              get: createGetter(prop),
              set: createSetter(prop)
            });
          }
          me.map[prop] = initialMap[prop];
        }
      })();
    }
  };
  sn.Configuration.prototype = {
    /**
	 * Test if a key is enabled, via the {@link #toggle} function.
	 * 
	 * @param {String} key the key to test
	 * @returns {Boolean} <em>true</em> if the key is enabled
	 * @preserve
	 */
    enabled: function(key) {
      if (key === undefined) {
        return false;
      }
      return this.map[key] !== undefined;
    },
    /**
	 * Set or toggle the enabled status of a given key.
	 * 
	 * <p>If the <em>enabled</em> parameter is not passed, then the enabled
	 * status will be toggled to its opposite value.</p>
	 * 
	 * @param {String} key they key to set
	 * @param {Boolean} enabled the optional enabled value to set
	 * @returns {sn.Configuration} this object to allow method chaining
	 * @preserve
	 */
    toggle: function(key, enabled) {
      var val = enabled;
      if (key === undefined) {
        return this;
      }
      if (val === undefined) {
        val = this.map[key] === undefined;
      }
      return this.value(key, val === true ? true : null);
    },
    /**
	 * Get or set a configuration value.
	 * 
	 * @param {String} key The key to get or set the value for 
	 * @param [newValue] If defined, the new value to set for the given {@code key}.
	 *                   If {@code null} then the value will be removed.
	 * @returns If called as a getter, the associated value for the given {@code key},
	 * otherwise this object.
	 * @preserve
	 */
    value: function(key, newValue) {
      var me = this;
      if (arguments.length === 1) {
        return this.map[key];
      }
      if (newValue === null) {
        delete this.map[key];
        if (this.hasOwnProperty(key)) {
          delete this[key];
        }
      } else {
        this.map[key] = newValue;
        if (!this.hasOwnProperty(key)) {
          Object.defineProperty(this, key, {
            enumerable: true,
            configurable: true,
            get: function() {
              return me.map[key];
            },
            set: function(value) {
              me.map[key] = value;
            }
          });
        }
      }
      return this;
    }
  };
  sn.ui = {};
  sn.ui.pixelWidth = sn_ui_pixelWidth;
  function sn_ui_pixelWidth(selector) {
    if (selector === undefined) {
      return undefined;
    }
    var styleWidth = d3.select(selector).style("width");
    if (!styleWidth) {
      return null;
    }
    var pixels = styleWidth.match(/([0-9.]+)px/);
    if (pixels === null) {
      return null;
    }
    var result = Math.floor(pixels[1]);
    if (isNaN(result)) {
      return null;
    }
    return result;
  }
  sn.chart.baseTimeChart = function(containerSelector, chartConfig) {
    var self = {
      version: "1.0.0"
    };
    var me = self;
    var internalPropName = "__internal__";
    var aggregates = [ "FiveMinute", "TenMinute", "FifteenMinute", "Hour", "HourOfDay", "SeasonalHourOfDay", "Day", "DayOfWeek", "SeasonalDayOfWeek", "Month" ];
    var config = chartConfig || new sn.Configuration();
    var containerWidth = sn.ui.pixelWidth(containerSelector);
    var p = config.padding || [ 10, 0, 20, 30 ], w = (config.width || containerWidth || 812) - p[1] - p[3], h = (config.height || 300) - p[0] - p[2], x = d3.time.scale.utc().range([ 0, w ]), y = d3.scale.linear().range([ h, 0 ]);
    var aggregateType;
    var plotProperties;
    var transitionMs;
    var ruleOpacity;
    var vertRuleOpacity;
    var svgRoot, svgTickGroupX, svgDataRoot, svgRuleRoot, svgAnnotRoot, svgHoverRoot, svgPointerCapture;
    var displayFactorCallback = undefined;
    var drawAnnotationsCallback = undefined;
    var xAxisTickCallback = undefined;
    var hoverEnterCallback = undefined, hoverMoveCallback = undefined, hoverLeaveCallback = undefined, rangeSelectionCallback = undefined, doubleClickCallback = undefined;
    var userInteractionHandlerCount = function() {
      var counts = {};
      Object.keys(sn.tapEventNames).forEach(function(n) {
        counts[sn.tapEventNames[n]] = 0;
      });
      return counts;
    }();
    var lastUserInteractionInfo = {
      time: 0
    };
    var displayFactor = 1;
    var displayFormatter = d3.format(",d");
    var xAxisTickCount = 12;
    var yAxisTickCount = 5;
    var draw = function() {
      drawAxisX();
      drawAxisY();
    };
    var handleHoverEnter = function() {
      if (!hoverEnterCallback) {
        return;
      }
      hoverEnterCallback.call(me, svgHoverRoot, sn.tapCoordinates(this));
    };
    var handleHoverMove = function() {
      if (!hoverMoveCallback) {
        return;
      }
      hoverMoveCallback.call(me, svgHoverRoot, sn.tapCoordinates(this));
    };
    var handleHoverLeave = function() {
      if (!hoverLeaveCallback) {
        return;
      }
      hoverLeaveCallback.call(me, svgHoverRoot, sn.tapCoordinates(this));
    };
    var handleClick = function() {
      if (!clickCallback) {
        return;
      }
      clickCallback.call(me, svgHoverRoot, sn.tapCoordinates(this));
    };
    var handleDoubleClick = function() {
      if (!doubleClickCallback) {
        return;
      }
      doubleClickCallback.call(me, svgHoverRoot, sn.tapCoordinates(this));
    };
    function registerUserInteractionHandler(tapEventName, container, handler) {
      var eventName = sn.tapEventNames[tapEventName];
      if (!eventName) {
        return;
      }
      if (!container.on(eventName)) {
        container.on(eventName, handler);
      }
      userInteractionHandlerCount[eventName] += 1;
    }
    function unregisterUserInteractionHandler(tapEventName, container, handler) {
      var eventName = sn.tapEventNames[tapEventName];
      if (!eventName) {
        return;
      }
      userInteractionHandlerCount[eventName] -= 1;
      if (userInteractionHandlerCount[eventName] < 1) {
        container.on(eventName, null);
      }
    }
    function handleClickInternal() {
      var event = d3.event, time = new Date().getTime(), dt = time - lastUserInteractionInfo.time, that = this;
      lastUserInteractionInfo.time = time;
      if (event.type === "dblclick" || sn.hasTouchSupport && dt < 500) {
        if (lastUserInteractionInfo.timer) {
          clearTimeout(lastUserInteractionInfo.timer);
          delete lastUserInteractionInfo.timer;
        }
        handleDoubleClick.call(that);
      } else if (sn.hasTouchSupport) {
        lastUserInteractionInfo.timer = setTimeout(function() {
          var prevEvent = d3.event;
          try {
            d3.event = event;
            handleClick.call(that);
          } finally {
            d3.event = prevEvent;
          }
        }, 500);
        event.preventDefault();
      } else {
        handleClick.call(that);
      }
    }
    function parseConfiguration() {
      self.aggregate(config.aggregate);
      self.plotProperties(config.value("plotProperties"));
      transitionMs = config.value("transitionMs") || 600;
      ruleOpacity = config.value("ruleOpacity") || .1;
      vertRuleOpacity = config.value("vertRuleOpacity") || .05;
    }
    svgRoot = d3.select(containerSelector).select("svg");
    if (svgRoot.empty()) {
      svgRoot = d3.select(containerSelector).append("svg:svg");
    }
    svgRoot.attr("class", "chart").attr("width", w + p[1] + p[3]).attr("height", h + p[0] + p[2]).selectAll("*").remove();
    svgDataRoot = svgRoot.append("g").attr("class", "data-root").attr("transform", "translate(" + p[3] + "," + p[0] + ")");
    svgTickGroupX = svgRoot.append("g").attr("class", "ticks").attr("transform", "translate(" + p[3] + "," + (h + p[0] + p[2]) + ")");
    svgRoot.append("g").attr("class", "crisp rule").attr("transform", "translate(0," + p[0] + ")");
    svgRuleRoot = svgRoot.append("g").attr("class", "rule").attr("transform", "translate(" + p[3] + "," + p[0] + ")");
    svgAnnotRoot = svgRoot.append("g").attr("class", "annot-root").attr("transform", "translate(" + p[3] + "," + p[0] + ")");
    function computeUnitsY() {
      var fmt;
      var maxY = d3.max(y.domain(), function(v) {
        return Math.abs(v);
      });
      displayFactor = 1;
      if (displayFactorCallback) {
        displayFactor = displayFactorCallback.call(me, maxY);
      } else if (maxY >= 1e9) {
        displayFactor = 1e9;
      } else if (maxY >= 1e6) {
        displayFactor = 1e6;
      } else if (maxY >= 1e3) {
        displayFactor = 1e3;
      }
      if (displayFactor === 1) {
        fmt = ",d";
      } else {
        fmt = ",g";
      }
      displayFormatter = d3.format(fmt);
    }
    function displayFormat(d) {
      return displayFormatter(d / displayFactor);
    }
    function plotPropertyName() {
      return plotProperties[aggregateType];
    }
    function plotReversePropertyName() {
      return plotProperties[aggregateType] + "Reverse";
    }
    function setup() {
      computeUnitsY();
    }
    function axisYTransform(d) {
      return "translate(0," + (Math.round(y(d) + .5) - .5) + ")";
    }
    function axisRuleClassY(d) {
      return d === 0 ? "origin" : "m";
    }
    function axisTextClassY(d) {
      return d === 0 ? "origin" : null;
    }
    function axisXTickClassMajor(d) {
      return aggregateType.indexOf("Minute") >= 0 && d.getUTCHours() === 0 || aggregateType === "Hour" && d.getUTCHours() === 0 || aggregateType === "Day" && d.getUTCDate() === 1 || aggregateType === "Month" && d.getUTCMonth() === 0;
    }
    function xAxisTicks() {
      return x.ticks(xAxisTickCount);
    }
    function xAxisTickFormatter() {
      var fxDefault = x.tickFormat(xAxisTickCount);
      return function(d, i) {
        if (xAxisTickCallback) {
          return xAxisTickCallback.call(me, d, i, x, fxDefault);
        } else {
          return fxDefault(d, i);
        }
      };
    }
    function drawAxisX() {
      if (d3.event && d3.event.transform) {
        d3.event.transform(x);
      }
      var ticks = xAxisTicks();
      var fx = xAxisTickFormatter();
      var labels = svgTickGroupX.selectAll("text").data(ticks).classed({
        major: axisXTickClassMajor
      });
      labels.transition().duration(transitionMs).attr("x", x).text(fx);
      labels.enter().append("text").attr("dy", "-0.5em").style("opacity", 1e-6).attr("x", x).classed({
        major: axisXTickClassMajor
      }).transition().duration(transitionMs).style("opacity", 1).text(fx).each("end", function() {
        d3.select(this).style("opacity", null);
      });
      labels.exit().transition().duration(transitionMs).style("opacity", 1e-6).remove();
    }
    function yAxisTicks() {
      return y.ticks(yAxisTickCount);
    }
    function drawAxisY() {
      var yTicks = yAxisTicks();
      var axisLines = svgRoot.select("g.rule").selectAll("g").data(yTicks, Object);
      var axisLinesT = axisLines.transition().duration(transitionMs);
      axisLinesT.attr("transform", axisYTransform).select("text").text(displayFormat).attr("class", axisTextClassY);
      axisLinesT.select("line").attr("class", axisRuleClassY);
      axisLines.exit().transition().duration(transitionMs).style("opacity", 1e-6).remove();
      var entered = axisLines.enter().append("g").style("opacity", 1e-6).attr("transform", axisYTransform);
      entered.append("line").attr("x2", w + p[3]).attr("x1", p[3]).attr("class", axisRuleClassY);
      entered.append("text").attr("x", p[3] - 10).text(displayFormat).attr("class", axisTextClassY);
      entered.transition().duration(transitionMs).style("opacity", 1).each("end", function() {
        d3.select(this).style("opacity", null);
      });
    }
    /**
	 * Scale a date for the x-axis.
	 * 
	 * @param {Date} the Date to scale
	 * @return {Number} the scaled value
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
    self.scaleDate = function(date) {
      return x(date);
    };
    /**
	 * Scale a value for the y-axis.
	 * 
	 * @param {Number} the value to scale
	 * @return {Number} the scaled value
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
    self.scaleValue = function(value) {
      return y(value);
    };
    /**
	 * Get the x-axis domain (minimum and maximum dates).
	 * 
	 * @return {number[]} an array with the minimum and maximum values used in the x-axis of the chart
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
    self.xDomain = function() {
      return x.domain();
    };
    /**
	 * Get the y-axis domain (minimum and maximum values).
	 * 
	 * @return {number[]} an array with the minimum and maximum values used in the y-axis of the chart
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
    self.yDomain = function() {
      return y.domain();
    };
    /**
	 * Get the scaling factor the y-axis is using. By default this will return {@code 1}.
	 * After calling the {@link #load()} method, however, the chart may decide to scale
	 * the y-axis for clarity. You can call this method to find out the scaling factor the
	 * chart ended up using.
	 *  
	 * @return the y-axis scale factor
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
    self.yScale = function() {
      return displayFactorCallback ? displayFactorCallback() : displayFactor;
    };
    /**
	 * Get the current {@code aggregate} value in use.
	 * 
	 * @param {number} [value] the number of consumption sources to use
	 * @returns when used as a getter, the count number, otherwise this object
	 * @returns the {@code aggregate} value
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
    self.aggregate = function(value) {
      if (!arguments.length) return aggregateType;
      var idx = aggregates.indexOf(value);
      aggregateType = idx < 0 ? "Hour" : value;
      return me;
    };
    /**
	 * Get the expected normalized duration, in milliseconds, based on the configured aggregate level.
	 * 
	 * @returns The expected normalized millisecond duration for the configured aggregate level.
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
    self.aggregateNormalizedDuration = function() {
      if (aggregateType === "FiveMinute") {
        return 1e3 * 60 * 5;
      }
      if (aggregateType === "TenMinute") {
        return 1e3 * 60 * 10;
      }
      if (aggregateType === "FifteenMinute") {
        return 1e3 * 60 * 15;
      }
      if (aggregateType === "Hour" || aggregateType === "HourOfDay" || aggregateType === "SeasonalHourOfDay") {
        return 1e3 * 60 * 60;
      }
      if (aggregateType === "Day" || aggregateType === "DayOfWeek" || aggregateType === "SeasonalDayOfWeek") {
        return 1e3 * 60 * 60 * 24;
      }
      if (aggregateType === "Month") {
        return 1e3 * 60 * 60 * 24 * 30;
      }
      return 1e3 * 60;
    };
    /**
	 * Test if two dates are the expected aggregate normalized duration apart.
	 *
	 * @returns True if the two dates are exactly one normalized aggregate duration apart.
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
    self.isNormalizedDuration = function(d1, d2) {
      var diff, expectedDiff = self.aggregateNormalizedDuration(), v1;
      if (!(d1 && d2)) {
        return false;
      }
      diff = Math.abs(d2.getTime() - d1.getTime());
      if (diff === expectedDiff) {
        return true;
      }
      if (d2.getTime() < d1.getTime()) {
        v1 = d1;
        d1 = d2;
        d2 = v1;
      }
      if (aggregateType === "Month") {
        return d3.time.month.utc.offset(d1, 1).getTime() === d2.getTime();
      }
      if (aggregateType === "SeasonalHourOfDay") {
        v1 = d1.getUTCHours() + 1;
        if (v1 > 23) {
          v1 = 0;
        }
        return d2.getUTCHours() === v1 && d1.getTime() !== d2.getTime();
      }
      if (aggregateType === "SeasonalDayOfWeek") {
        v1 = d1.getUTCDay() + 1;
        if (v1 > 6) {
          v1 = 0;
        }
        return d2.getUTCDay() === v1 && d1.getTime() !== d2.getTime();
      }
      return false;
    };
    /**
	 * Add an aggregate normalized time duration to a given date.
	 *
	 * @param date The date to add to.
	 * @returns A new Date object.
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
    self.addNormalizedDuration = function(date) {
      if (!date) {
        return undefined;
      }
      if (aggregateType === "Month") {
        return d3.time.month.utc.offset(date, 1);
      }
      return new Date(date.getTime() + self.aggregateNormalizedDuration());
    };
    /**
	 * Clear out all data associated with this chart. Does not redraw. If 
	 * {@link hoverLeaveCallback} is defined, it will be called with no arguments.
	 * 
	 * @return this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
    self.reset = function() {
      if (svgHoverRoot) {
        handleHoverLeave();
      }
      return me;
    };
    /**
	 * Regenerate the chart, using the current data.
	 * 
	 * @returns this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
    self.regenerate = function() {
      parseConfiguration();
      self.setup();
      self.draw();
      if (drawAnnotationsCallback) {
        drawAnnotationsCallback.call(me, svgAnnotRoot);
      }
      return me;
    };
    /**
	 * Get or set the animation transition time, in milliseconds.
	 * 
	 * @param {number} [value] the number of milliseconds to use
	 * @return when used as a getter, the millisecond value, otherwise this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
    self.transitionMs = function(value) {
      if (!arguments.length) return transitionMs;
      transitionMs = +value;
      return me;
    };
    /**
	 * Get or set the plot property names for all supported aggregate levels.
	 * 
	 * When used as a setter, an Object with properties of the following names are supported:
	 * 
	 * <ul>
	 *   <li>FiveMinute</li>
	 *   <li>TenMinute</li>
	 *   <li>FifteenMinute</li>
	 *   <li>Hour</li>
	 *   <li>HourOfDay</li>
	 *   <li>SeasonalHourOfDay</li>
	 *   <li>Day</li>
	 *   <li>DayOfWeek</li>
	 *   <li>SeasonalDayOfWeek</li>
	 *   <li>Month</li>
	 * </ul>
	 * 
	 * Each value should be the string name of the datum property to plot on the y-axis of the chart.
	 * If an aggregate level is not defined, it will default to {@code watts}.
	 * 
	 * @param {object} [value] the aggregate property names to use
	 * @return when used as a getter, the current plot property value mapping object, otherwise this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
    self.plotProperties = function(value) {
      if (!arguments.length) return plotProperties;
      var p = {};
      aggregates.forEach(function(e) {
        p[e] = value !== undefined && value[e] !== undefined ? value[e] : "watts";
      });
      plotProperties = p;
      return me;
    };
    /**
	 * Get or set the display factor callback function. The callback will be passed the absolute maximum 
	 * Y domain value as an argument. It should return a number representing the scale factor to use
	 * in Y-axis labels.
	 * 
	 * @param {function} [value] the display factor exclude callback
	 * @return when used as a getter, the current display factor callback function, otherwise this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
    self.displayFactorCallback = function(value) {
      if (!arguments.length) return displayFactorCallback;
      if (typeof value === "function") {
        displayFactorCallback = value;
      } else {
        displayFactorCallback = undefined;
      }
      return me;
    };
    /**
	 * Get or set the draw annotations callback function, which is called after the chart completes drawing.
	 * The function will be passed a SVG <code>&lt;g class="annot-root"&gt;</code> element that
	 * represents the drawing area for the chart data.
	 * 
	 * @param {function} [value] the draw callback
	 * @return when used as a getter, the current draw callback function, otherwise this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
    self.drawAnnotationsCallback = function(value) {
      if (!arguments.length) return drawAnnotationsCallback;
      if (typeof value === "function") {
        drawAnnotationsCallback = value;
      } else {
        drawAnnotationsCallback = undefined;
      }
      return me;
    };
    function getOrCreateHoverRoot() {
      if (!svgHoverRoot) {
        svgHoverRoot = svgRoot.append("g").attr("class", "hover-root").attr("transform", "translate(" + p[3] + "," + p[0] + ")");
        svgPointerCapture = svgRoot.append("rect").attr("width", w).attr("height", h).attr("fill", "none").attr("pointer-events", "all").attr("class", "pointer-capture").attr("transform", "translate(" + p[3] + "," + p[0] + ")");
      }
      return svgPointerCapture;
    }
    /**
	 * Get or set a mouseover callback function, which is called in response to mouse entering
	 * the data area of the chart.
	 * 
	 * @param {function} [value] the mouse enter callback
	 * @return when used as a getter, the current mouse enter callback function, otherwise this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
    self.hoverEnterCallback = function(value) {
      if (!arguments.length) return hoverEnterCallback;
      var root = getOrCreateHoverRoot();
      if (typeof value === "function") {
        hoverEnterCallback = value;
        root.on("mouseover", handleHoverEnter);
      } else {
        hoverEnterCallback = undefined;
        root.on("mouseover", null);
      }
      return me;
    };
    /**
	 * Get or set a mousemove callback function, which is called in response to mouse movement
	 * over the data area of the chart.
	 * 
	 * @param {function} [value] the hover callback
	 * @return when used as a getter, the current hover callback function, otherwise this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
    self.hoverMoveCallback = function(value) {
      if (!arguments.length) return hoverMoveCallback;
      var root = getOrCreateHoverRoot();
      if (typeof value === "function") {
        getOrCreateHoverRoot();
        hoverMoveCallback = value;
        root.on("mousemove", handleHoverMove);
      } else {
        hoverMoveCallback = undefined;
        root.on("mousemove", null);
      }
      return me;
    };
    /**
	 * Get or set a mouseout callback function, which is called in response to mouse leaving
	 * the data area of the chart.
	 * 
	 * @param {function} [value] the mouse enter callback
	 * @return when used as a getter, the current mouse leave callback function, otherwise this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
    self.hoverLeaveCallback = function(value) {
      if (!arguments.length) return hoverLeaveCallback;
      var root = getOrCreateHoverRoot();
      if (typeof value === "function") {
        hoverLeaveCallback = value;
        root.on("mouseout", handleHoverLeave);
      } else {
        hoverLeaveCallback = undefined;
        root.on("mouseout", null);
      }
      return me;
    };
    /**
	 * Get or set a dblclick callback function, which is called in response to mouse double click
	 * events on the data area of the chart.
	 * 
	 * @param {function} [value] the double click callback
	 * @return when used as a getter, the current double click callback function, otherwise this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
    self.doubleClickCallback = function(value) {
      if (!arguments.length) return doubleClickCallback;
      var root = getOrCreateHoverRoot();
      if (typeof value === "function") {
        doubleClickCallback = value;
        registerUserInteractionHandler("dblclick", root, handleClickInternal);
      } else {
        doubleClickCallback = undefined;
        unregisterUserInteractionHandler("dblclick", root, handleClickInternal);
      }
      return me;
    };
    /**
	 * Get or set a range selection callback function, which is called in response to mouse click or touch start
	 * events on the data area of the chart.
	 * 
	 * @param {function} [value] the range selection callback
	 * @return when used as a getter, the current range selection callback function, otherwise this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
    self.rangeSelectionCallback = function(value) {
      if (!arguments.length) return rangeSelectionCallback;
      var root = getOrCreateHoverRoot();
      if (typeof value === "function") {
        rangeSelectionCallback = value;
        registerUserInteractionHandler("click", root, handleClickInternal);
      } else {
        rangeSelectionCallback = undefined;
        unregisterUserInteractionHandler("click", root, handleClickInternal);
      }
      return me;
    };
    /**
	 * Get or set the x-axis tick callback function, which is called during x-axis rendering.
	 * The function will be passed a data object, the index, the d3 scale, and the number of 
	 * ticks requested. The <code>this</code> object will be set to the chart instance.
	 * 
	 * @param {function} [value] the draw callback
	 * @return when used as a getter, the current x-axis tick callback function, otherwise this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
    self.xAxisTickCallback = function(value) {
      if (!arguments.length) return xAxisTickCallback;
      if (typeof value === "function") {
        xAxisTickCallback = value;
      }
      return me;
    };
    /**
	 * Get or set the axis rule opacity value, which is used during axis rendering.
	 * Defaults to <b>0.1</b>.
	 * 
	 * @param {function} [value] the opacity value
	 * @return when used as a getter, the current axis rule opacity value, otherwise this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
    self.ruleOpacity = function(value) {
      if (!arguments.length) return ruleOpacity;
      ruleOpacity = value;
      return me;
    };
    /**
	 * Get or set the vertical axis rule opacity value, which is used during axis rendering.
	 * Defaults to <b>0.05</b>.
	 * 
	 * @param {function} [value] the opacity value
	 * @return when used as a getter, the current vertical axis rule opacity value, otherwise this object
	 * @memberOf sn.chart.baseTimeChart
	 * @preserve
	 */
    self.vertRuleOpacity = function(value) {
      if (!arguments.length) return vertRuleOpacity;
      vertRuleOpacity = value;
      return me;
    };
    Object.defineProperties(self, {
      me: {
        get: function() {
          return me;
        },
        set: function(obj) {
          me = obj;
        }
      },
      x: {
        get: function() {
          return x;
        },
        set: function(v) {
          x = v;
        }
      },
      y: {
        get: function() {
          return y;
        },
        set: function(v) {
          y = v;
        }
      },
      xAxisTickCount: {
        get: function() {
          return xAxisTickCount;
        },
        set: function(v) {
          xAxisTickCount = v;
        }
      },
      xAxisTicks: {
        get: function() {
          return xAxisTicks;
        },
        set: function(v) {
          xAxisTicks = v;
        }
      },
      xAxisTickFormatter: {
        get: function() {
          return xAxisTickFormatter;
        },
        set: function(v) {
          xAxisTickFormatter = v;
        }
      },
      yAxisTicks: {
        get: function() {
          return yAxisTicks;
        },
        set: function(v) {
          yAxisTicks = v;
        }
      },
      yAxisTickCount: {
        get: function() {
          return yAxisTickCount;
        },
        set: function(v) {
          yAxisTickCount = v;
        }
      },
      config: {
        value: config
      },
      internalPropName: {
        value: internalPropName
      },
      plotPropertyName: {
        get: plotPropertyName
      },
      plotReversePropertyName: {
        get: plotReversePropertyName
      },
      padding: {
        value: p
      },
      width: {
        value: w,
        enumerable: true
      },
      height: {
        value: h,
        enumerable: true
      },
      svgRoot: {
        value: svgRoot
      },
      svgDataRoot: {
        value: svgDataRoot
      },
      svgRuleRoot: {
        value: svgRuleRoot
      },
      svgTickGroupX: {
        value: svgTickGroupX
      },
      svgHoverRoot: {
        get: function() {
          return svgHoverRoot;
        }
      },
      handleHoverEnter: {
        get: function() {
          return handleHoverEnter;
        },
        set: function(v) {
          handleHoverEnter = v;
        }
      },
      handleHoverMove: {
        get: function() {
          return handleHoverMove;
        },
        set: function(v) {
          handleHoverMove = v;
        }
      },
      handleHoverLeave: {
        get: function() {
          return handleHoverLeave;
        },
        set: function(v) {
          handleHoverLeave = v;
        }
      },
      handleClick: {
        get: function() {
          return handleClick;
        },
        set: function(v) {
          handleClick = v;
        }
      },
      handleDoubleClick: {
        get: function() {
          return handleDoubleClick;
        },
        set: function(v) {
          handleDoubleClick = v;
        }
      },
      computeUnitsY: {
        value: computeUnitsY
      },
      drawAxisX: {
        get: function() {
          return drawAxisX;
        },
        set: function(v) {
          drawAxisX = v;
        }
      },
      drawAxisY: {
        get: function() {
          return drawAxisY;
        },
        set: function(v) {
          drawAxisY = v;
        }
      },
      parseConfiguration: {
        get: function() {
          return parseConfiguration;
        },
        set: function(v) {
          parseConfiguration = v;
        }
      },
      draw: {
        get: function() {
          return draw;
        },
        set: function(v) {
          draw = v;
        }
      },
      setup: {
        get: function() {
          return setup;
        },
        set: function(v) {
          setup = v;
        }
      }
    });
    parseConfiguration();
    return self;
  };
  sn.chart.baseGroupedTimeChart = function(containerSelector, chartConfig) {
    var parent = sn.chart.baseTimeChart(containerSelector, chartConfig), superReset = parent.reset;
    var self = sn_util_copyAll(parent);
    self.me = self;
    var originalData = {};
    var scaleFactors = {};
    var dataCallback = undefined;
    var colorCallback = undefined;
    var sourceExcludeCallback = undefined;
    var layerPostProcessCallback = undefined;
    var groupIds = [];
    var otherData = {};
    function fillColor(groupId, d, i) {
      if (colorCallback === undefined) {
        return "black";
      }
      return colorCallback(groupId, d.sourceId, i);
    }
    /**
	 * Insert aggregate time normalized elements into all layer data arrays.
	 * The <code>layerData</code> object must be an array of objects, each object
	 * having a <code>values</code> array of data objects. This method will
	 * clone data objects and insert them into the <code>values</code> array in-place,
	 * in order to create a time-normalized series of elements.
	 * 
	 * @param layerData The array of layer (data group) objects.
	 * @memberOf sn.chart.baseGroupedTimeChart
	 * @preserve
	 */
    function insertNormalizedDurationIntoLayerData(layerData) {
      var i, j, row, datum, plotPropName = self.plotPropertyName, plotReversePropName = self.plotReversePropertyName;
      for (j = 0; j < layerData.length; j += 1) {
        row = layerData[j].values;
        for (i = 0; i < row.length - 1; i += 1) {
          if (self.isNormalizedDuration(row[i].date, row[i + 1].date) !== true) {
            datum = sn.util.copy(row[i]);
            datum.date = self.addNormalizedDuration(datum.date);
            datum[plotPropName] = null;
            datum[plotReversePropName] = null;
            row.splice(i + 1, 0, datum);
          }
        }
      }
    }
    /**
	 * Clear out all data associated with this chart. Does not redraw. If 
	 * {@link hoverLeaveCallback} is defined, it will be called with no arguments.
	 * 
	 * @return this object
	 * @memberOf sn.chart.baseGroupedTimeChart
	 * @preserve
	 */
    self.reset = function() {
      superReset();
      originalData = {};
      groupIds = [];
      otherData = {};
      return self.me;
    };
    /**
	 * Add data for a single group in the chart. The data is appended if data has 
	 * already been loaded for the given groupId. This does not redraw the chart. 
	 * Once all groups have been loaded, call {@link #regenerate()} to redraw.
	 * 
	 * @param {Array} rawData - the raw chart data to load
	 * @param {String} groupId - the ID to associate with the data; each stack group must have its own ID
	 * @returns this object
	 * @memberOf sn.chart.baseGroupedTimeChart
	 * @preserve
	 */
    self.load = function(rawData, groupId) {
      if (originalData[groupId] === undefined) {
        groupIds.push(groupId);
        originalData[groupId] = rawData;
      } else {
        originalData[groupId] = originalData[groupId].concat(rawData);
      }
      return self.me;
    };
    /**
	 * Get the data for a specific group ID previously loaded via {@link #load()}.
	 *
	 * @param {String} groupId - the group ID of the data to get
	 * @returns the data, or <code>undefined</code>
	 * @memberOf sn.chart.baseGroupedTimeChart
	 * @preserve
	 */
    self.data = function(groupId) {
      return originalData[groupId];
    };
    /**
	 * Stash data for a single group in the chart. The data is appended if data has 
	 * already been stashed for the given groupId. This data is auxiliary data that clients
	 * may want to associate with the chart and draw later, for example via the 
	 * {@link #drawAnnotationsCallback()} function.
	 * 
	 * @param {Array} rawData - the raw chart data to stash
	 * @param {String} groupId - the group ID to associate with the data
	 * @param {Boolean} replace - If <em>true</em> then do not append to existing data, replace it instead.
	 * @returns this object
	 * @memberOf sn.chart.baseGroupedTimeChart
	 * @preserve
	 */
    self.stash = function(rawData, groupId, replace) {
      if (otherData[groupId] === undefined || replace === true) {
        otherData[groupId] = rawData;
      } else {
        otherData[groupId] = otherData[groupId].concat(rawData);
      }
      return self.me;
    };
    /**
	 * Get the data for a specific group ID previously stashed via {@link #stash()}.
	 *
	 * @param {String} groupId - the group ID of the data to get
	 * @returns the data, or <code>undefined</code>
	 * @memberOf sn.chart.baseGroupedTimeChart
	 * @preserve
	 */
    self.stashedData = function(groupId) {
      return otherData[groupId];
    };
    /**
	 * Get or set the scale factor for specific group IDs. If called without any arguments,
	 * all configured scale factors will be returned as an object, with group IDs as property
	 * names with corresponding scale factor values. If called with a single Object argument
	 * then set all scale factors using group IDs as object property names with corresponding 
	 * number values for the scale factor.
	 *
	 * @param {String} groupId - The group ID of the scale factor to set.
	 * @param {Number} value - The scale factor to set.
	 * @returns If called without any arguments, all configured scale factors as an object.
	 *          If called with a single String <code>groupId</code> argument, the scale factor for the given group ID,
	 *          or <code>1</code> if not defined.
	 *          If called with a single Object <code>groupId</code> argument, set
	 *          Otherwise, this object.
	 * @memberOf sn.chart.baseGroupedTimeChart
	 * @preserve
	 */
    self.scaleFactor = function(groupId, value) {
      var v;
      if (!arguments.length) return scaleFactors;
      if (arguments.length === 1) {
        if (typeof groupId === "string") {
          v = scaleFactors[groupId];
          return v === undefined ? 1 : v;
        }
        scaleFactors = groupId;
      } else if (arguments.length == 2) {
        scaleFactors[groupId] = value;
      }
      return self.me;
    };
    /**
	 * Get or set the data callback function. This function will be called as the
	 * chart iterates over the raw input data as it performs grouping and normalization
	 * operations. The callback will be passed the group ID and the data as arguments.
	 * 
	 * @param {function} [value] the data callback
	 * @return when used as a getter, the current data callback function, otherwise this object
	 * @memberOf sn.chart.baseGroupedTimeChart
	 * @preserve
	 */
    self.dataCallback = function(value) {
      if (!arguments.length) return dataCallback;
      if (typeof value === "function") {
        dataCallback = value;
      } else {
        dataCallback = undefined;
      }
      return self.me;
    };
    /**
	 * Get or set the color callback function. The callback will be passed the group ID 
	 * and a source ID as arguments.
	 * 
	 * @param {function} [value] the color callback
	 * @return when used as a getter, the current color callback function, otherwise this object
	 * @memberOf sn.chart.baseGroupedTimeChart
	 * @preserve
	 */
    self.colorCallback = function(value) {
      if (!arguments.length) return colorCallback;
      if (typeof value === "function") {
        colorCallback = value;
      } else {
        colorCallback = undefined;
      }
      return self.me;
    };
    /**
	 * Get or set the source exclude callback function. The callback will be passed the group ID 
	 * and a source ID as arguments. It should true <em>true</em> if the data set for the given
	 * group ID and source ID should be excluded from the chart.
	 * 
	 * @param {function} [value] the source exclude callback
	 * @return when used as a getter, the current source exclude callback function, otherwise this object
	 * @memberOf sn.chart.baseGroupedTimeChart
	 * @preserve
	 */
    self.sourceExcludeCallback = function(value) {
      if (!arguments.length) return sourceExcludeCallback;
      if (typeof value === "function") {
        sourceExcludeCallback = value;
      } else {
        sourceExcludeCallback = undefined;
      }
      return self.me;
    };
    /**
	 * Get or set the layer post-process callback function. The callback will be passed a 
	 * group ID and that group's result of the d3.nest() operator, after all layer data 
	 * arrays have been normalized to contain the same number of elements. 
	 * 
	 * @param {function} [value] the layer post-process callback
	 * @return when used as a getter, the current layer post-process callback function, otherwise this object
	 * @memberOf sn.chart.baseGroupedTimeChart
	 * @preserve
	 */
    self.layerPostProcessCallback = function(value) {
      if (!arguments.length) return layerPostProcessCallback;
      if (typeof value === "function") {
        layerPostProcessCallback = value;
      } else {
        layerPostProcessCallback = undefined;
      }
      return self.me;
    };
    Object.defineProperties(self, {
      fillColor: {
        value: fillColor
      },
      insertNormalizedDurationIntoLayerData: {
        value: insertNormalizedDurationIntoLayerData
      },
      groupIds: {
        get: function() {
          return groupIds;
        }
      }
    });
    return self;
  };
  sn.color = {};
  sn.color.colors = {
    steelblue: [ "#356287", "#4682b4", "#6B9BC3", "#89AFCF", "#A1BFD9", "#B5CDE1", "#DAE6F0" ],
    triplets: [ "#3182bd", "#6baed6", "#9ecae1", "#e6550d", "#fd8d3c", "#fdae6b", "#31a354", "#74c476", "#a1d99b", "#756bb1", "#9e9ac8", "#bcbddc", "#843c39", "#ad494a", "#d6616b", "#8c6d31", "#bd9e39", "#e7ba52", "#7b4173", "#a55194", "#ce6dbd" ],
    seasonColors: [ "#5c8726", "#e9a712", "#762123", "#80a3b7" ]
  };
  sn.format.seasonForDate = sn_format_seasonForDate;
  /**
 * Get a UTC season constant for a date. Seasons are groups of 3 months, e.g. 
 * Spring, Summer, Autumn, Winter. The returned value will be a number between
 * 0 and 3, where (Dec, Jan, Feb) = 0, (Mar, Apr, May) = 1, (Jun, Jul, Aug) = 2,
 * and (Sep, Oct, Nov) = 3.
 * 
 * @param {Date} date The date to get the season for.
 * @returns a season constant number, from 0 - 3
 * @preserve
 */
  function sn_format_seasonForDate(date) {
    if (date.getUTCMonth() < 2 || date.getUTCMonth() === 11) {
      return 3;
    } else if (date.getUTCMonth() < 5) {
      return 0;
    } else if (date.getUTCMonth() < 8) {
      return 1;
    } else {
      return 2;
    }
  }
  /**
 * An abstract base chart supporting seasonal aggregate groups.
 * 
 * @class
 * @extends sn.chart.baseGroupedChart
 * @param {string} containerSelector - the selector for the element to insert the chart into
 * @param {object} [chartConfig] - the chart parameters
 * @returns {sn.chart.baseGroupedSeasonalLineChart}
 * @preserve
 */
  sn.chart.baseGroupedSeasonalLineChart = function(containerSelector, chartConfig) {
    var parent = sn.chart.baseGroupedTimeChart(containerSelector, chartConfig), superDraw = sn.util.superMethod.call(parent, "draw");
    var self = sn.util.copyAll(parent, {
      version: "1.0.0"
    });
    self.me = self;
    var timeKeyLabels = [ "Midnight", "1am", "2am", "3am", "4am", "5am", "6am", "7am", "8am", "9am", "10am", "11am", "Noon", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm", "11pm" ];
    parent.x = d3.scale.ordinal().rangePoints([ 0, parent.width ], .2);
    parent.xAxisTicks = function() {
      return parent.x.domain();
    };
    parent.xAxisTickFormatter = function() {
      return function(d, i) {
        if (parent.xAxisTickCallback()) {
          return xAxisTickCallback().call(parent.me, d, i, parent.x);
        } else {
          return timeKeyLabels[parent.x.domain().indexOf(d)];
        }
      };
    };
    var northernHemisphere;
    var negativeGroupMap = {
      Consumption: true
    };
    var groupLayers;
    var linePathGenerator = d3.svg.line().interpolate("monotone").x(function(d) {
      return Math.round(parent.x(d.date) + .5) - .5;
    }).y(function(d) {
      return Math.round(parent.y(d.y) + .5) - .5;
    });
    function seasonColorFn(d, i) {
      !d;
      var seasonColors = parent.config.seasonColors || sn.color.colors.seasonColors;
      var season = (i + (northernHemisphere ? 0 : 2)) % 4;
      return seasonColors[season];
    }
    function dateForTimeKey(offset) {
      return new Date(Date.UTC(2001, 0, 1) + offset);
    }
    function timeKeyForDate(date) {
      date.getTime();
    }
    function timeKeyInterval() {
      return d3.time.day.utc;
    }
    function nestRollupAggregateSum(array) {
      var sum = null, plus = null, minus = null, d, v, i, len = array.length, groupId, negate = false, minX, maxX;
      for (i = 0; i < len; i += 1) {
        d = array[i];
        groupId = d[parent.internalPropName].groupId;
        if (parent.sourceExcludeCallback() && parent.sourceExcludeCallback().call(parent.me, groupId, d.sourceId)) {
          continue;
        }
        v = d[parent.plotPropertyName];
        if (v !== undefined) {
          negate = negativeGroupMap[groupId] === true;
          if (negate) {
            minus += v;
          } else {
            plus += v;
          }
        }
        if (d.date) {
          if (minX === undefined || d.date.getTime() < minX.getTime()) {
            minX = d.date;
          }
          if (maxX === undefined || d.date.getTime() > maxX.getTime()) {
            maxX = d.date;
          }
        }
      }
      if (plus !== null || minus !== null) {
        sum = plus - minus;
      }
      return {
        date: dateForTimeKey(array[0].timeKey),
        y: sum,
        plus: plus,
        minus: minus,
        season: array[0].season,
        timeKey: array[0].timeKey,
        groupId: array[0][parent.internalPropName].groupId
      };
    }
    function setup() {
      var groupIds = parent.groupIds, rangeX = [ null, null ], rangeY = [ 0, 0 ], interval = timeKeyInterval(), keyFormatter = d3.format("02g");
      groupLayers = {};
      groupIds.forEach(function(groupId) {
        var layerData, rawGroupData = parent.data(groupId), layerValues, range;
        if (!rawGroupData || !rawGroupData.length > 1) {
          return;
        }
        layerData = d3.nest().key(function(d) {
          if (!d.hasOwnProperty(parent.internalPropName)) {
            d[parent.internalPropName] = {
              groupId: groupId
            };
            if (parent.dataCallback()) {
              parent.dataCallback().call(parent.me, groupId, d);
            } else if (d.date === undefined) {
              d.date = sn.api.datum.datumDate(d);
            }
            d.season = sn.format.seasonForDate(d.date);
            d.timeKey = timeKeyForDate(d.date);
          }
          return d.season;
        }).key(function(d) {
          return keyFormatter(d.timeKey);
        }).sortKeys(d3.ascending).rollup(nestRollupAggregateSum).entries(rawGroupData);
        if (layerData.length < 1) {
          return;
        }
        if (parent.layerPostProcessCallback()) {
          layerData = parent.layerPostProcessCallback().call(parent.me, groupId, layerData);
        }
        groupLayers[groupId] = layerData;
        layerValues = layerData.reduce(function(prev, d) {
          return prev.concat(d.values.map(function(d) {
            return d.values;
          }));
        }, []);
        range = d3.extent(layerValues, function(d) {
          return d.y;
        });
        if (range[0] < rangeY[0]) {
          rangeY[0] = range[0];
        }
        if (range[1] > rangeY[1]) {
          rangeY[1] = range[1];
        }
        range = d3.extent(layerValues, function(d) {
          return d.date.getTime();
        });
        if (rangeX[0] === null || range[0] < rangeX[0].getTime()) {
          rangeX[0] = new Date(range[0]);
        }
        if (rangeX[1] === null || range[1] > rangeX[1].getTime()) {
          rangeX[1] = new Date(range[1]);
        }
      });
      parent.x.domain(interval.range(rangeX[0], interval.offset(rangeX[1], 1)));
      parent.y.domain(rangeY).nice();
      parent.computeUnitsY();
    }
    function axisXVertRule(d) {
      return Math.round(parent.x(d) + .5) - .5;
    }
    function drawAxisXRules() {
      var transitionMs = parent.transitionMs();
      var axisLines = parent.svgRuleRoot.selectAll("line.vert").data(parent.x.domain());
      axisLines.transition().duration(transitionMs).attr("x1", axisXVertRule).attr("x2", axisXVertRule);
      axisLines.enter().append("line").style("opacity", 1e-6).classed("vert", true).attr("x1", axisXVertRule).attr("x2", axisXVertRule).attr("y1", 0).attr("y2", parent.height).transition().duration(transitionMs).style("opacity", parent.vertRuleOpacity()).each("end", function() {
        d3.select(this).style("opacity", null);
      });
      axisLines.exit().transition().duration(transitionMs).style("opacity", 1e-6).remove();
    }
    function setupDrawData() {
      var groupedData = [ [], [], [], [] ], groupIds = parent.groupIds;
      groupIds.forEach(function(groupId) {
        var groupLayer = groupLayers[groupId];
        if (groupLayer) {
          groupLayer.forEach(function(seasonData) {
            var season = Number(seasonData.key);
            groupedData[season].push(seasonData.values.map(function(d) {
              return d.values;
            }));
          });
        }
      });
      return {
        groupedData: groupedData
      };
    }
    function draw() {
      var transitionMs = parent.transitionMs(), seasons, lines, drawData;
      drawData = setupDrawData();
      seasons = parent.svgDataRoot.selectAll("g.season").data(drawData.groupedData);
      seasons.enter().append("g").attr("class", "season").style("stroke", seasonColorFn);
      lines = seasons.selectAll("path.line").data(Object, function(d) {
        return d[0].groupId;
      });
      lines.transition().duration(transitionMs).attr("d", linePathGenerator);
      lines.enter().append("path").classed("line", true).attr("d", linePathGenerator);
      lines.exit().transition().duration(transitionMs).style("opacity", 1e-6).remove();
      superDraw();
      drawAxisXRules();
    }
    self.northernHemisphere = function(value) {
      if (!arguments.length) return northernHemisphere;
      if (value === northernHemisphere) {
        return;
      }
      northernHemisphere = value === true;
      parent.svgDataRoot.selectAll("g.season").transition().duration(parent.transitionMs()).style("stroke", seasonColorFn);
      return parent.me;
    };
    self.negativeGroupIds = function(value) {
      if (!arguments.length) {
        return function() {
          var prop, result = [];
          for (prop in negativeGroupMap) {
            if (negativeGroupMap.hasOwnProperty(prop)) {
              result.pus(prop);
            }
          }
          return result;
        }();
      }
      negativeGroupMap = {};
      value.forEach(function(e) {
        negativeGroupMap[e] = true;
      });
      return parent.me;
    };
    self.timeKeyLabels = function(value) {
      if (!arguments.length) return timeKeyLabels;
      if (Array.isArray(value)) {
        timeKeyLabels = value;
      }
      return parent.me;
    };
    Object.defineProperties(self, {
      dateForTimeKey: {
        get: function() {
          return dateForTimeKey;
        },
        set: function(v) {
          dateForTimeKey = v;
        }
      },
      timeKeyForDate: {
        get: function() {
          return timeKeyForDate;
        },
        set: function(v) {
          timeKeyForDate = v;
        }
      },
      timeKeyInterval: {
        get: function() {
          return timeKeyInterval;
        },
        set: function(v) {
          timeKeyInterval = v;
        }
      }
    });
    parent.setup = setup;
    parent.draw = draw;
    return self;
  };
  /**
 * An abstract class to support groups of stacked layer charts.
 * 
 * Extending classes should re-define the <code>me</code> property to themselves, so that
 * method chaining works correctly.
 * 
 * @class
 * @abstract
 * @param {string} containerSelector - the selector for the element to insert the chart into
 * @param {sn.chart.powerAreaOverlapChartParameters} [chartConfig] - the chart parameters
 * @returns {sn.chart.baseGroupedStackTimeChart}
 * @preserve
 */
  sn.chart.baseGroupedStackTimeChart = function(containerSelector, chartConfig) {
    var parent = sn.chart.baseGroupedTimeChart(containerSelector, chartConfig), superReset = parent.reset, superParseConfiguration = parent.parseConfiguration, superYAxisTicks = parent.yAxisTicks;
    var self = sn_util_copyAll(parent);
    self.me = self;
    var discardId = "__discard__";
    var stackOffset = undefined;
    var negativeOffsetFromReversePlotProperty = true;
    var groupLayers = {};
    var normalizeDataTimeGaps = false;
    function parseConfiguration() {
      superParseConfiguration();
      stackOffset = self.config.value("wiggle") === true ? "wiggle" : "zero";
      negativeOffsetFromReversePlotProperty = self.config.value("reverseValueSupport") === true ? true : false;
    }
    function groupOpacityFn(d, i) {
      !d;
      var grade = self.config.value("opacityReduction") || .1;
      return 1 - i * grade;
    }
    function internalStackOffsetFn(layerData) {
      var plotReversePropName = self.plotReversePropertyName, fn;
      if (stackOffset !== "zero") {
        fn = d3.layout.stack().offset(stackOffset).offset();
      } else {
        fn = function(data) {
          var i, iLen = data[0].length, j, jLen = data.length, sum, val, valR, y0 = [];
          for (i = 0; i < iLen; i += 1) {
            sum = 0;
            for (j = 0; j < jLen; j += 1) {
              val = data[j][i][1];
              valR = negativeOffsetFromReversePlotProperty ? layerData[j].values[i][plotReversePropName] : 0;
              if (val < 0) {
                sum += val;
                data[j][i][1] = -val;
              } else if (valR) {
                sum -= valR;
              }
            }
            y0[i] = sum;
          }
          return y0;
        };
      }
      return fn;
    }
    function setup() {
      var plotPropName = self.plotPropertyName, plotReversePropName = self.plotReversePropertyName;
      var minX, maxX;
      var minY, maxY;
      var stack = d3.layout.stack().values(function(d) {
        return d.values;
      }).x(function(d) {
        return d.date;
      }).y(function(d) {
        var y = d[plotPropName], yR = 0, scale = parent.scaleFactor(d[parent.internalPropName].groupId);
        if (y === undefined || y === null || stackOffset !== "zero" && y < 0) {
          y = 0;
        } else if (negativeOffsetFromReversePlotProperty && stackOffset === "zero" && d[plotReversePropName] !== undefined) {
          yR = d[plotReversePropName];
        }
        return (y + yR) * scale;
      });
      groupLayers = {};
      self.groupIds.forEach(function(groupId) {
        var dummy, layerData, rawGroupData = self.data(groupId);
        if (!rawGroupData || !rawGroupData.length > 1) {
          return;
        }
        layerData = d3.nest().key(function(d) {
          if (!d.hasOwnProperty(self.internalPropName)) {
            d[self.internalPropName] = {
              groupId: groupId
            };
            if (self.dataCallback()) {
              self.dataCallback().call(self.me, groupId, d);
            } else if (d.date === undefined) {
              d.date = sn.api.datum.datumDate(d);
            }
          }
          if (self.sourceExcludeCallback()) {
            if (self.sourceExcludeCallback().call(self.me, groupId, d.sourceId)) {
              return discardId;
            }
          }
          return d.sourceId;
        }).sortKeys(d3.ascending).entries(rawGroupData);
        layerData = layerData.filter(function(d) {
          return d.key !== discardId;
        });
        if (layerData.length < 1) {
          return;
        }
        dummy = {};
        dummy[plotPropName] = null;
        dummy[self.internalPropName] = {
          groupId: groupId
        };
        sn.api.datum.nestedStackDataNormalizeByDate(layerData, dummy);
        if (normalizeDataTimeGaps === true) {
          parent.insertNormalizedDurationIntoLayerData(layerData);
        }
        if (self.layerPostProcessCallback()) {
          layerData = self.layerPostProcessCallback().call(self.me, groupId, layerData);
        }
        var rangeX = [ rawGroupData[0].date, rawGroupData[rawGroupData.length - 1].date ];
        if (minX === undefined || rangeX[0].getTime() < minX.getTime()) {
          minX = rangeX[0];
        }
        if (maxX === undefined || rangeX[1].getTime() > maxX.getTime()) {
          maxX = rangeX[1];
        }
        stack.offset(internalStackOffsetFn(layerData));
        var layers = stack(layerData);
        groupLayers[groupId] = layers;
        var rangeY = [ d3.min(layers[0].values, function(d) {
          return d.y0;
        }), d3.max(layers[layers.length - 1].values, function(d) {
          return d.y0 + d.y;
        }) ];
        if (minY === undefined || rangeY[0] < minY) {
          minY = rangeY[0];
        }
        if (maxY === undefined || rangeY[1] > maxY) {
          maxY = rangeY[1];
        }
      });
      if (minX !== undefined && maxX !== undefined) {
        self.x.domain([ minX, maxX ]);
      }
      if (minY !== undefined && maxY !== undefined) {
        self.y.domain([ minY, maxY ]).nice();
      }
      self.computeUnitsY();
    }
    function yAxisTicks() {
      return self.wiggle() === true ? [] : superYAxisTicks();
    }
    /**
	 * Clear out all data associated with this chart. Does not redraw.
	 * 
	 * @return this object
	 * @memberOf sn.chart.baseGroupedStackTimeChart
	 * @preserve
	 */
    self.reset = function() {
      superReset();
      groupLayers = {};
      return self.me;
    };
    /**
	 * Get or set the d3 stack offset.
	 * 
	 * This can be any supported d3 stack offset, such as 'wiggle' or a custom function.
	 * 
	 * @param {string|function} [value] the stack offset to use
	 * @return when used as a getter, the stack offset value, otherwise this object
	 * @memberOf sn.chart.baseGroupedStackTimeChart
	 * @preserve
	 */
    self.stackOffset = function(value) {
      if (!arguments.length) return stackOffset;
      stackOffset = value;
      return self.me;
    };
    /**
	 * Get or set the "wiggle" stack offset method.
	 * 
	 * This is an alias for the {@link #stackOffset} function, specifically to set the {@code wiggle}
	 * style offset if passed <em>true</em> or the {@code zero} offset if <em>false</em>.
	 * 
	 * @param {boolean} [value] <em>true</em> to use the {@code wiggle} offset, <em>false</em> to use {@code zero}
	 * @return when used as a getter, <em>true</em> if {@code wiggle} is the current offset, <em>false</em> otherwise;
	 *         when used as a setter, this object
	 * @memberOf sn.chart.baseGroupedStackTimeChart
	 * @preserve
	 */
    self.wiggle = function(value) {
      if (!arguments.length) return stackOffset === "wiggle";
      return self.stackOffset(value === true ? "wiggle" : "zero");
    };
    /**
	 * Get or set the flag to normalize the data for time gaps.
	 * Defaults to <b>false</b>.
	 * 
	 * @param {function} [value] the flag value
	 * @return when used as a getter, the current flag value, otherwise this object
	 * @memberOf sn.chart.baseGroupedStackTimeChart
	 * @preserve
	 */
    self.normalizeDataTimeGaps = function(value) {
      if (!arguments.length) return normalizeDataTimeGaps;
      normalizeDataTimeGaps = value === true;
      return self.me;
    };
    /**
	 * Iterate over the time values in the chart's data, calling a function for each date.
	 * The callback function will be passed an object with source IDs for keys with corresponding
	 * data value objects as values. If a source does not have a value for a given date, that key
	 * will not be defined. The callback function will be passed a second Date argument representing
	 * the date of the associated data. The callback's <code>this</code> object will be set to this chart object.
	 * 
	 * @param {function} callback - The callback function to invoke.
	 * @return This object.
	 * @memberOf sn.chart.baseGroupedStackTimeChart
	 * @preserve
	 */
    self.enumerateDataOverTime = function(callback) {
      if (typeof callback !== "function") {
        return self.me;
      }
      var groupIds = self.groupIds, layerContext = {}, callbackData, date = self.xDomain()[0];
      if (!groupIds || groupIds.length < 1) {
        return self.me;
      }
      while (true) {
        callbackData = {
          date: date,
          data: {}
        };
        groupIds.forEach(function(groupId) {
          var groupArray = groupLayers[groupId];
          if (layerContext[groupId] === undefined) {
            layerContext[groupId] = {
              index: 0
            };
          }
          if (!groupArray || groupArray.length < 1 || groupArray[0].values.length <= layerContext[groupId].index) {
            return;
          }
          if (layerContext[groupId].date === undefined) {
            layerContext[groupId].date = groupArray[0].values[0].date;
          }
          if (groupArray[0].values[layerContext[groupId].index].date.getTime() === date.getTime()) {
            groupArray.forEach(function(sourceLayer) {
              callbackData.data[sourceLayer.key] = sourceLayer.values[layerContext[groupId].index];
            });
            layerContext[groupId].index += 1;
            layerContext[groupId].date = layerContext[groupId].index < groupArray[0].values.length ? groupArray[0].values[layerContext[groupId].index].date : null;
          }
        });
        callback.call(self.me, callbackData.data, date);
        date = layerContext[groupIds.reduce(function(l, r) {
          var lDate = layerContext[l].date, rDate = layerContext[r].date;
          if (!lDate) {
            return r;
          }
          if (!rDate) {
            return l;
          }
          return lDate < rDate ? l : r;
        })].date;
        if (!date) {
          break;
        }
      }
      return self.me;
    };
    Object.defineProperties(self, {
      negativeOffsetFromReversePlotProperty: {
        get: function() {
          return negativeOffsetFromReversePlotProperty;
        },
        set: function(v) {
          negativeOffsetFromReversePlotProperty = v;
        }
      },
      groupOpacityFn: {
        value: groupOpacityFn
      },
      discardId: {
        value: discardId
      },
      groupLayers: {
        get: function() {
          return groupLayers;
        }
      }
    });
    parseConfiguration();
    self.parseConfiguration = parseConfiguration;
    self.setup = setup;
    self.yAxisTicks = yAxisTicks;
    return self;
  };
  /**
 * @typedef sn.chart.baseGroupedStackTimeBarChartParameters
 * @type {sn.Configuration}
 * @property {number} [width=812] - desired width, in pixels, of the chart
 * @property {number} [height=300] - desired height, in pixels, of the chart
 * @property {number[]} [padding=[10, 0, 20, 30]] - padding to inset the chart by, in top, right, bottom, left order
 * @property {number} [transitionMs=600] - transition time
 * @property {number} [opacityReduction=0.1] - a percent opacity reduction to apply to groups on top of other groups
 * @property {number} [vertRuleOpacity] - the maximum opacity to render vertical rules at, during transitions
 * @property {object} [plotProperties] - the property to plot for specific aggregation levels; if unspecified 
 *                                       the {@code watts} property is used
 * @preserve
 */
  /**
 * An abstract base stacked bar chart.
 * 
 * @class
 * @extends sn.chart.baseGroupedStackChart
 * @param {string} containerSelector - the selector for the element to insert the chart into
 * @param {sn.chart.baseGroupedStackTimeBarChartParameters} [chartConfig] - the chart parameters
 * @returns {sn.chart.baseGroupedStackTimeBarChart}
 * @preserve
 */
  sn.chart.baseGroupedStackTimeBarChart = function(containerSelector, chartConfig) {
    var parent = sn.chart.baseGroupedStackTimeChart(containerSelector, chartConfig);
    var self = sn_util_copyAll(parent);
    self.me = self;
    var xBar = d3.scale.ordinal();
    var svgVertRuleGroup = parent.svgRoot.insert("g", ".annot-root").attr("class", "vertrule").attr("transform", "translate(" + parent.padding[3] + "," + parent.padding[0] + ")");
    function groupFillFn(d, i) {
      return parent.fillColor.call(this, d[0][parent.internalPropName].groupId, d[0], i);
    }
    function vertRuleOpacity() {
      return parent.config.vertRuleOpacity || .05;
    }
    function computeDomainX() {
      var x = parent.x, aggregateType = parent.aggregate(), xDomain = x.domain(), buckets, step = 1, end = xDomain[1];
      if (aggregateType === "Month") {
        end = d3.time.month.utc.offset(end, 1);
        buckets = d3.time.months.utc;
      } else if (aggregateType === "Day") {
        end = d3.time.day.utc.offset(end, 1);
        buckets = d3.time.days.utc;
      } else if (aggregateType === "FiveMinute") {
        step = 5;
        end = d3.time.minute.utc.offset(end, step);
        buckets = d3.time.minutes.utc;
      } else if (aggregateType === "TenMinute") {
        step = 10;
        end = d3.time.minute.utc.offset(end, step);
        buckets = d3.time.minutes.utc;
      } else if (aggregateType === "FifteenMinute") {
        step = 15;
        end = d3.time.minute.utc.offset(end, step);
        buckets = d3.time.minutes.utc;
      } else {
        end = d3.time.hour.utc.offset(end, 1);
        buckets = d3.time.hours.utc;
      }
      buckets = buckets(xDomain[0], end, step);
      xBar.domain(buckets).rangeRoundBands(x.range(), .2);
    }
    function keyX(d) {
      return d.date;
    }
    function valueX(d) {
      return xBar(d.date);
    }
    function valueXMidBar(d) {
      return axisXMidBarValue(d.date);
    }
    function valueXVertRule(d) {
      return Math.floor(valueX(d) - xBarPadding() / 2) + .5;
    }
    function valueY(d) {
      return parent.y(d.y0 + d.y);
    }
    function heightY(d) {
      return parent.y(d.y0) - parent.y(d.y0 + d.y);
    }
    function axisXMidBarValue(date) {
      return xBar(date) + xBar.rangeBand() / 2;
    }
    function axisXTickClassMajor(d) {
      var aggregateType = parent.aggregate();
      return aggregateType === "Day" && d.getUTCDate() === 1 || aggregateType === "Hour" && d.getUTCHours() === 0 || aggregateType === "Month" && d.getUTCMonth() === 0;
    }
    function axisXTickCount() {
      var count = parent.config.value("tickCountX");
      return count || (parent.width > 600 ? 12 : 5);
    }
    function axisXTicks() {
      var barTicks = xBar.domain();
      if (barTicks.length < 7) {
        return barTicks;
      }
      return parent.x.ticks(axisXTickCount());
    }
    function xBarPadding() {
      var domain = xBar.domain();
      var barSpacing = domain.length > 1 ? xBar(domain[1]) - xBar(domain[0]) : xBar.rangeBand();
      var barPadding = barSpacing - xBar.rangeBand();
      return barPadding;
    }
    function trimToXDomain(array) {
      var start = 0, len = array.length, xDomainStart = parent.x.domain()[0];
      while (start < len) {
        if (array[start].date.getTime() >= xDomainStart.getTime()) {
          break;
        }
        start += 1;
      }
      return start === 0 ? array : array.slice(start);
    }
    function xAxisTickFormatter() {
      var fxDefault = parent.x.tickFormat(axisXTickCount()), callback = parent.xAxisTickCallback();
      return function(d, i) {
        if (callback) {
          return callback.call(parent.me, d, i, parent.x, fxDefault);
        } else {
          return fxDefault(d, i);
        }
      };
    }
    function drawAxisX() {
      var ticks = axisXTicks(), transitionMs = parent.transitionMs(), fx = xAxisTickFormatter(), labels;
      ticks = ticks.filter(function(d) {
        return xBar(d) !== undefined;
      });
      labels = parent.svgTickGroupX.selectAll("text").data(ticks, Object).classed({
        major: axisXTickClassMajor
      });
      labels.transition().duration(transitionMs).attr("x", axisXMidBarValue).text(fx);
      labels.enter().append("text").attr("dy", "-0.5em").style("opacity", 1e-6).attr("x", axisXMidBarValue).classed({
        major: axisXTickClassMajor
      }).transition().duration(transitionMs).style("opacity", 1).text(fx).each("end", function() {
        d3.select(this).style("opacity", null);
      });
      labels.exit().transition().duration(transitionMs).style("opacity", 1e-6).remove();
    }
    function drawBarsForSources(sources) {
      var centerYLoc = parent.y(0), transitionMs = parent.transitionMs(), bars = sources.selectAll("rect").data(Object, keyX);
      bars.transition().duration(transitionMs).attr("x", valueX).attr("y", valueY).attr("height", heightY).attr("width", xBar.rangeBand());
      bars.enter().append("rect").attr("x", valueX).attr("y", centerYLoc).attr("height", 1e-6).attr("width", xBar.rangeBand()).transition().duration(transitionMs).attr("y", valueY).attr("height", heightY);
      bars.exit().transition().duration(transitionMs).style("opacity", 1e-6).remove();
    }
    function drawAxisXRules(vertRuleTicks) {
      var transitionMs = parent.transitionMs(), axisLines, labelTicks;
      labelTicks = trimToXDomain(vertRuleTicks);
      axisLines = svgVertRuleGroup.selectAll("line").data(labelTicks, keyX), axisLines.transition().duration(transitionMs).attr("x1", valueXVertRule).attr("x2", valueXVertRule);
      axisLines.enter().append("line").style("opacity", 1e-6).attr("x1", valueXVertRule).attr("x2", valueXVertRule).attr("y1", 0).attr("y2", parent.height + 10).transition().duration(transitionMs).style("opacity", vertRuleOpacity()).each("end", function() {
        d3.select(this).style("opacity", null);
      });
      axisLines.exit().transition().duration(transitionMs).style("opacity", 1e-6).remove();
    }
    function drawHoverHighlightBars(dataArray) {
      var hoverBar = parent.svgHoverRoot.selectAll("rect.highlightbar").data(dataArray);
      hoverBar.attr("x", valueX).attr("width", xBar.rangeBand());
      hoverBar.enter().append("rect").attr("x", valueX).attr("y", 0).attr("height", parent.height).attr("width", xBar.rangeBand()).classed("highlightbar clickable", true);
      hoverBar.exit().remove();
    }
    function drawSelection(dataArray) {
      var firstItem = dataArray && dataArray.length > 0 ? dataArray.slice(0, 1) : [], firstItemX = dataArray && dataArray.length > 0 ? valueX(dataArray[0]) : 0, lastItemX = dataArray && dataArray.length > 0 ? valueX(dataArray[dataArray.length - 1]) : 0, width = lastItemX - firstItemX + xBar.rangeBand();
      var selectBar = parent.svgHoverRoot.selectAll("rect.selectionbar").data(firstItem);
      selectBar.attr("x", firstItemX).attr("width", width);
      selectBar.enter().append("rect").attr("x", firstItemX).attr("y", 0).attr("height", parent.height).attr("width", width).classed("selectionbar clickable", true);
      selectBar.exit().remove();
    }
    self.scaleDate = function(date) {
      var barRange = xBar.range(), ex = xBar.rangeExtent(), x = parent.scaleDate(date);
      var result = barRange[Math.round(x / ex[1] * (barRange.length - 1))] + xBar.rangeBand() / 2;
      return result;
    };
    Object.defineProperties(self, {
      svgVertRuleGroup: {
        value: svgVertRuleGroup
      },
      xBar: {
        value: xBar
      },
      xBarPadding: {
        value: xBarPadding
      },
      trimToXDomain: {
        value: trimToXDomain
      },
      computeDomainX: {
        value: computeDomainX
      },
      groupFillFn: {
        value: groupFillFn
      },
      keyX: {
        value: keyX
      },
      valueX: {
        value: valueX
      },
      valueXMidBar: {
        value: valueXMidBar
      },
      valueXVertRule: {
        value: valueXVertRule
      },
      valueY: {
        value: valueY
      },
      heightY: {
        value: heightY
      },
      drawAxisXRules: {
        value: drawAxisXRules
      },
      drawBarsForSources: {
        value: drawBarsForSources
      },
      drawHoverHighlightBars: {
        value: drawHoverHighlightBars
      },
      drawSelection: {
        value: drawSelection
      }
    });
    parent.drawAxisX = drawAxisX;
    return self;
  };
  /**
 * @typedef sn.chart.basicLineChartParameters
 * @type {sn.Configuration}
 * @property {number} [width=812] - desired width, in pixels, of the chart
 * @property {number} [height=300] - desired height, in pixels, of the chart
 * @property {number[]} [padding=[30, 0, 30, 30]] - padding to inset the chart by, in top, right, bottom, left order
 * @property {number} [transitionMs=600] - transition time
 * @property {number} [ruleOpacity] - the maximum opacity to render rules at, during transitions
 * @property {number} [vertRuleOpacity] - the maximum opacity to render rules at, during transitions
 * @property {sn.Configuration} excludeSources - the sources to exclude from the chart
 * @preserve
 */
  /**
 * A basic line chart without groupings.
 * 
 * @class
 * @param {string} containerSelector - the selector for the element to insert the chart into
 * @param {sn.chart.basicLineChartParameters} [chartConfig] - the chart parameters
 * @returns {sn.chart.basicLineChart}
 * @preserve
 */
  sn.chart.basicLineChart = function(containerSelector, chartConfig) {
    var parent = sn.chart.baseTimeChart(containerSelector, chartConfig), superDraw = sn.util.superMethod.call(parent, "draw");
    var self = function() {
      var me = sn.util.copy(parent);
      Object.defineProperty(me, "version", {
        value: "1.0.0",
        enumerable: true,
        configurable: true
      });
      return me;
    }();
    parent.me = self;
    var sourceExcludeCallback;
    var originalData = {}, lineIds = [], linePlotProperties = {}, lineDrawData = [];
    var linePathGenerator = d3.svg.line().interpolate("monotone").x(function(d) {
      return Math.round(parent.x(d.date) + .5) - .5;
    }).y(function(d) {
      var lineId = this.getAttribute("class"), plotProp = linePlotProperties[lineId] ? linePlotProperties[lineId] : parent.plotPropertyName, val = d[plotProp];
      return Math.round(parent.y(val === undefined ? null : val) + .5) - .5;
    });
    var colors = d3.scale.ordinal().range(colorbrewer.Set3[12]);
    /**
	 * Add data for a single line in the chart. The data is appended if data has 
	 * already been loaded for the given line ID. This does not redraw the chart. 
	 * Once all line data has been loaded, call {@link #regenerate()} to draw.
	 * 
	 * @param {Array} rawData - The raw chart data to load.
	 * @param {String} lineId - The ID to associate with the data; each line must have its own ID
	 * @param {String} plotProperty - A property of the raw data to plot for the line. If not specified,
	 *                                the chart-wide plot property for the configured aggregate level will
	 *                                be used.
	 * @returns this object
	 * @memberOf sn.chart.basicLineChart
	 * @preserve
	 */
    self.load = function(rawData, lineId, plotProperty) {
      if (originalData[lineId] === undefined) {
        lineIds.push(lineId);
        originalData[lineId] = rawData;
      } else {
        originalData[lineId] = originalData[lineId].concat(rawData);
      }
      if (plotProperty) {
        linePlotProperties[lineId] = plotProperty;
      } else if (linePlotProperties[lineId]) {
        delete linePlotProperties[lineId];
      }
      return self;
    };
    /**
	 * Get or set the source exclude callback function. The callback will be passed the line ID 
	 * as an argument. It should true <em>true</em> if the data set for the given argument
	 * should be excluded from the chart.
	 * 
	 * @param {function} [value] the source exclude callback
	 * @return when used as a getter, the current source exclude callback function, otherwise this object
	 * @memberOf sn.chart.basicLineChart
	 * @preserve
	 */
    self.sourceExcludeCallback = function(value) {
      if (!arguments.length) return sourceExcludeCallback;
      if (typeof value === "function") {
        sourceExcludeCallback = value;
      } else {
        sourceExcludeCallback = undefined;
      }
      return self;
    };
    /**
	 * Get or set a range of colors to display. The order of the the data passed to the {@link load()}
	 * function will determine the color used from the configured {@code colorArray}.
	 * 
	 * @param {Array} colorArray An array of valid SVG color values to set.
	 * @return when used as a getter, the current color array, otherwise this object
	 * @memberOf sn.chart.basicLineChart
	 * @preserve
	 */
    self.colors = function(colorArray) {
      if (!arguments.length) return colors.range();
      colors.range(colorArray);
      return self;
    };
    /**
	 * Get the d3 ordinal color scale.
	 *
	 * @return {Object} A D3 ordinal scale of color values.
	 * @memberOf sn.chart.basicLineChart
	 * @preserve
	 */
    self.colorScale = function() {
      return colors;
    };
    self.data = function(lineId) {
      return originalData[lineId];
    };
    self.reset = function() {
      parent.reset();
      originalData = {};
      lineIds.length = 0;
      linePlotProperties = {};
      lineDrawData.length = 0;
      return self;
    };
    function setup() {
      var plotPropName = parent.plotPropertyName, rangeX = [ null, null ], rangeY = [ null, null ];
      lineDrawData = [];
      lineIds.forEach(function(lineId) {
        var rawLineData = self.data(lineId);
        if (rawLineData) {
          rawLineData.forEach(function(d) {
            var y;
            if (d.date === undefined) {
              d.date = sn.api.datum.datumDate(d);
            }
            if (!sourceExcludeCallback || !sourceExcludeCallback.call(this, lineId)) {
              if (rangeX[0] === null || d.date < rangeX[0]) {
                rangeX[0] = d.date;
              }
              if (rangeX[1] === null || d.date > rangeX[1]) {
                rangeX[1] = d.date;
              }
              y = d[linePlotProperties[lineId] ? linePlotProperties[lineId] : plotPropName];
              if (y !== undefined) {
                if (rangeY[0] === null || y < rangeY[0]) {
                  rangeY[0] = y;
                }
                if (rangeY[1] === null || y > rangeY[1]) {
                  rangeY[1] = y;
                }
              }
            }
          });
        }
        lineDrawData.push(rawLineData);
      });
      colors.domain(lineIds.length).range(colorbrewer.Set3[lineIds.length < 3 ? 3 : lineIds.length > 11 ? 12 : lineIds.length]);
      parent.x.domain(rangeX);
      parent.y.domain(rangeY).nice();
      parent.computeUnitsY();
    }
    function lineClass(d, i) {
      !d;
      return lineIds[i];
    }
    function lineStroke(d, i) {
      !d;
      return colors(i);
    }
    function lineOpacity(d, i) {
      !d;
      var hidden = sourceExcludeCallback ? sourceExcludeCallback.call(this, lineIds[i]) : false;
      return hidden ? 1e-6 : 1;
    }
    function lineCommonProperties(selection) {
      selection.style("opacity", lineOpacity).attr("stroke", lineStroke).attr("d", linePathGenerator);
    }
    function draw() {
      var transitionMs = parent.transitionMs(), lines;
      lines = parent.svgDataRoot.selectAll("path").data(lineDrawData, function(d, i) {
        !d;
        return lineIds[i];
      });
      lines.attr("class", lineClass).transition().duration(transitionMs).call(lineCommonProperties);
      lines.enter().append("path").attr("class", lineClass).call(lineCommonProperties);
      lines.exit().transition().duration(transitionMs).style("opacity", 1e-6).remove();
      superDraw();
    }
    parent.setup = setup;
    parent.draw = draw;
    return self;
  };
  /**
 * @typedef sn.chart.energyBarOverlapChartParameters
 * @type {sn.Configuration}
 * @property {number} [width=812] - desired width, in pixels, of the chart
 * @property {number} [height=300] - desired height, in pixels, of the chart
 * @property {number[]} [padding=[10, 0, 20, 30]] - padding to inset the chart by, in top, right, bottom, left order
 * @property {number} [transitionMs=600] - transition time
 * @property {number} [opacityReduction=0.1] - a percent opacity reduction to apply to groups on top of other groups
 * @property {object} [plotProperties] - the property to plot for specific aggregation levels; if unspecified 
 *                                       the {@code watts} property is used
 * @preserve
 */
  /**
 * A power stacked area chart that overlaps two or more data sets.
 * 
 * @class
 * @extends sn.chart.baseGroupedStackBarChart
 * @param {string} containerSelector - the selector for the element to insert the chart into
 * @param {sn.chart.energyBarOverlapChartParameters} [chartConfig] - the chart parameters
 * @returns {sn.chart.energyBarOverlapChart}
 * @preserve
 */
  sn.chart.energyBarOverlapChart = function(containerSelector, chartConfig) {
    "use strict";
    var parent = sn.chart.baseGroupedStackTimeBarChart(containerSelector, chartConfig);
    var that = function() {
      var me = sn.util.copy(parent);
      Object.defineProperty(me, "version", {
        value: "1.0.0",
        enumerable: true,
        configurable: true
      });
      return me;
    }();
    parent.me = that;
    var me = that;
    var svgData = parent.svgDataRoot.append("g").attr("class", "data");
    Object.defineProperty(that, "me", {
      enumerable: false,
      get: function() {
        return me;
      },
      set: function(obj) {
        me = obj;
        parent.me = obj;
      }
    });
    function dataTypeOpacityFn(d, i) {
      !d;
      return parent.groupOpacityFn(null, i);
    }
    function draw() {
      var groupedData = [], groupIds = parent.groupIds, transitionMs = parent.transitionMs(), groups, sources;
      parent.computeDomainX();
      groupIds.forEach(function(groupId) {
        var groupLayer = parent.groupLayers[groupId];
        if (groupLayer === undefined) {
          groupedData.push([]);
        } else {
          groupedData.push(groupLayer.map(function(e) {
            return e.values;
          }));
        }
      });
      groups = svgData.selectAll("g.dataType").data(groupedData, function(d, i) {
        !d;
        return groupIds[i];
      });
      groups.enter().append("g").attr("class", "dataType").style("opacity", dataTypeOpacityFn);
      sources = groups.selectAll("g.source").data(Object, function(d) {
        return d[0].sourceId;
      }).style("fill", parent.groupFillFn);
      sources.enter().append("g").attr("class", "source").style("fill", parent.groupFillFn);
      sources.exit().transition().duration(transitionMs).style("opacity", 1e-6).remove();
      parent.drawBarsForSources(sources);
      parent.drawAxisY();
      parent.drawAxisX();
    }
    parent.draw = draw;
    return that;
  };
  /**
 * @typedef sn.chart.energyIOBarChartParameters
 * @type {sn.Configuration}
 * @property {number} [width=812] - desired width, in pixels, of the chart
 * @property {number} [height=300] - desired height, in pixels, of the chart
 * @property {number[]} [padding=[30, 0, 30, 30]] - padding to inset the chart by, in top, right, bottom, left order
 * @property {number} [transitionMs=600] - transition time
 * @property {string} [aggregate] - the aggregation type; one of 'Month' or 'Hour' or 'Day'
 * @property {number} [ruleOpacity] - the maximum opacity to render rules at, during transitions
 * @property {number} [vertRuleOpacity] - the maximum opacity to render rules at, during transitions
 * @property {string[]} [seasonColors] - array of color values for spring, summer, autumn, and winter
 * @property {sn.Configuration} excludeSources - the sources to exclude from the chart
 * @preserve
 */
  /**
 * An energy input and output chart designed to show consumption and generation data simultaneously.
 * 
 * You can use the {@code excludeSources} parameter to dynamically alter which sources are visible
 * in the chart. After changing the configuration call {@link sn.chart.energyIOBarChart#regenerate()}
 * to re-draw the chart.
 * 
 * Note that the global {@link sn.colorFn} function is used to map sources to colors, so that
 * must be set up previously.
 * 
 * @class
 * @extends sn.chart.baseGroupedStackBarChart
 * @param {string} containerSelector - the selector for the element to insert the chart into
 * @param {sn.chart.energyIOBarChartParameters} [chartConfig] - the chart parameters
 * @returns {sn.chart.energyIOBarChart}
 * @preserve
 */
  sn.chart.energyIOBarChart = function(containerSelector, chartConfig) {
    "use strict";
    if (!(chartConfig && chartConfig.padding)) {
      chartConfig.value("padding", [ 20, 0, 30, 30 ]);
    }
    var parent = sn.chart.baseGroupedStackTimeBarChart(containerSelector, chartConfig);
    var self = function() {
      var me = sn.util.copy(parent);
      Object.defineProperty(me, "version", {
        value: "1.0.0",
        enumerable: true,
        configurable: true
      });
      return me;
    }();
    parent.me = self;
    var northernHemisphere = undefined;
    var negativeGroupMap = {
      Consumption: true
    };
    var svgAggBandGroup = parent.svgDataRoot.append("g").attr("class", "agg-band").attr("transform", "translate(0," + (parent.height + parent.padding[2] - 25) + ".5)");
    var svgAggBandLabelGroup = parent.svgDataRoot.append("g").attr("class", "agg-band-ticks").attr("transform", "translate(0," + (parent.height + parent.padding[2] - 21) + ")");
    var svgData = parent.svgDataRoot.append("g").attr("class", "data");
    var svgSumLineGroup = parent.svgDataRoot.append("g").attr("class", "agg-sum");
    var svgAggGroup = parent.svgDataRoot.append("g").attr("class", "agg-gen").attr("transform", "translate(0," + (10 - parent.padding[0]) + ")");
    var chartDrawData = undefined, selectedBarData = undefined, selectionBarData = [];
    var bisectDate = d3.bisector(function(d) {
      return d.date;
    }).left;
    function seasonColorFn(d) {
      var seasonColors = parent.config.seasonColors || [ "#5c8726", "#e9a712", "#762123", "#80a3b7" ];
      var month = d.date.getUTCMonth();
      if (month < 2 || month == 11) {
        return northernHemisphere ? seasonColors[3] : seasonColors[1];
      }
      if (month < 5) {
        return northernHemisphere ? seasonColors[0] : seasonColors[2];
      }
      if (month < 8) {
        return northernHemisphere ? seasonColors[1] : seasonColors[3];
      }
      return northernHemisphere ? seasonColors[2] : seasonColors[0];
    }
    function labelSeasonColors(d) {
      if (parent.aggregate() === "Month") {
        return seasonColorFn(d);
      }
      return null;
    }
    function timeAggregateLabelFormatter() {
      var fmt;
      if (parent.yScale() === 1) {
        fmt = ",d";
      } else {
        fmt = ",.1f";
      }
      return d3.format(fmt);
    }
    function nestRollupAggregateSum(array) {
      var sum = null, plus = null, minus = null, d, v, i, len = array.length, groupId, scale, negate = false;
      for (i = 0; i < len; i += 1) {
        d = array[i];
        v = d[parent.plotPropertyName];
        if (v !== undefined) {
          groupId = d[parent.internalPropName].groupId;
          scale = parent.scaleFactor(groupId);
          negate = negativeGroupMap[groupId] === true;
          if (negate) {
            minus += v * scale;
          } else {
            plus += v * scale;
          }
        }
      }
      if (plus !== null || minus !== null) {
        sum = plus - minus;
      }
      return {
        date: array[0].date,
        y: sum,
        plus: plus,
        minus: minus
      };
    }
    function setupDrawData() {
      var groupedData = [], groupIds = parent.groupIds, maxPositiveY = 0, maxNegativeY = 0, aggregateType = parent.aggregate(), sumLineData, timeAggregateData;
      groupIds.forEach(function(groupId) {
        var groupLayer = parent.groupLayers[groupId];
        if (groupLayer === undefined) {
          groupedData.push([]);
        } else {
          groupedData.push(groupLayer.map(function(e) {
            var max = d3.max(e.values, function(d) {
              return d.y + d.y0;
            });
            if (negativeGroupMap[groupId] === true) {
              if (max > maxNegativeY) {
                maxNegativeY = max;
              }
            } else if (max > maxPositiveY) {
              maxPositiveY = max;
            }
            return e.values;
          }));
        }
      });
      var allData = d3.merge(d3.merge(groupedData)).concat(parent.xBar.domain().map(function(e) {
        return {
          date: e
        };
      }));
      sumLineData = d3.nest().key(function(d) {
        return d.date.getTime();
      }).sortKeys(d3.ascending).rollup(nestRollupAggregateSum).entries(allData).map(function(e) {
        return e.values;
      });
      timeAggregateData = d3.nest().key(function(d) {
        var date;
        if (aggregateType === "Day") {
          date = d3.time.month.utc.floor(d.date);
        } else if (aggregateType === "Month") {
          date = d3.time.month.utc.offset(d.date, -((d.date.getUTCMonth() + 1) % 3));
        } else {
          date = d3.time.day.utc.floor(d.date);
        }
        return date.getTime();
      }).sortKeys(d3.ascending).rollup(nestRollupAggregateSum).entries(allData).map(function(e) {
        e.values.date = new Date(Number(e.key));
        return e.values;
      });
      return {
        allData: allData,
        groupedData: groupedData,
        sumLineData: sumLineData,
        timeAggregateData: timeAggregateData,
        maxPositiveY: maxPositiveY,
        maxNegativeY: maxNegativeY
      };
    }
    function draw() {
      var groupIds = parent.groupIds, transitionMs = parent.transitionMs(), groups, sources, centerYLoc, yDomain = parent.y.domain(), drawData;
      parent.computeDomainX();
      drawData = setupDrawData();
      chartDrawData = drawData;
      yDomain[0] = -drawData.maxNegativeY;
      yDomain[1] = drawData.maxPositiveY;
      parent.y.domain(yDomain).nice();
      centerYLoc = parent.y(0);
      function dataTypeGroupTransformFn(d, i) {
        !d;
        var yShift = 0;
        if (negativeGroupMap[groupIds[i]] === true) {
          yShift = -(centerYLoc * 2);
          return "scale(1, -1) translate(0," + yShift + ")";
        } else {
          return null;
        }
      }
      groups = svgData.selectAll("g.dataType").data(drawData.groupedData, function(d, i) {
        !d;
        return groupIds[i];
      });
      groups.transition().duration(transitionMs).attr("transform", dataTypeGroupTransformFn);
      groups.enter().append("g").attr("class", "dataType").attr("transform", dataTypeGroupTransformFn);
      sources = groups.selectAll("g.source").data(Object, function(d) {
        return d[0].sourceId;
      }).style("fill", parent.groupFillFn);
      sources.enter().append("g").attr("class", "source").style("fill", parent.groupFillFn);
      sources.exit().transition().duration(transitionMs).style("opacity", 1e-6).remove();
      parent.drawBarsForSources(sources);
      drawSumLine(drawData.sumLineData);
      drawTimeAggregateBands(drawData.timeAggregateData);
      drawTimeAggregates(drawData.timeAggregateData);
      parent.drawAxisY();
      parent.drawAxisX();
      parent.drawAxisXRules(drawData.timeAggregateData);
    }
    function drawSumLine(sumLineData) {
      var transitionMs = parent.transitionMs();
      function sumDefined(d) {
        return d.y !== null;
      }
      var svgLine = d3.svg.line().x(parent.valueXMidBar).y(function(d) {
        return parent.y(d.y) - .5;
      }).interpolate("monotone").defined(sumDefined);
      var sumLine = svgSumLineGroup.selectAll("path").data([ sumLineData ]);
      sumLine.transition().duration(transitionMs).attr("d", svgLine);
      sumLine.enter().append("path").attr("d", d3.svg.line().x(parent.valueXMidBar).y(function() {
        return parent.y(0) - .5;
      }).interpolate("monotone").defined(sumDefined)).transition().duration(transitionMs).attr("d", svgLine);
      sumLine.exit().transition().duration(transitionMs).style("opacity", 1e-6).remove();
    }
    function drawTimeAggregateBands(timeAggregateData) {
      var transitionMs = parent.transitionMs(), xDomain = parent.x.domain(), xBar = parent.xBar, len = timeAggregateData.length, bandTicks;
      if (parent.aggregate() === "Month" && len > 0) {
        bandTicks = timeAggregateData;
      } else {
        bandTicks = [];
      }
      var barWidth = xBar.rangeBand();
      var barPadding = parent.xBarPadding() / 2;
      var aggBands = svgAggBandGroup.selectAll("line").data(bandTicks, parent.keyX);
      var bandPosition = function(s) {
        s.attr("x1", function(d) {
          var date = d.date;
          if (date.getTime() < xDomain[0].getTime()) {
            date = xDomain[0];
          }
          return xBar(date) - barPadding;
        }).attr("x2", function(d, i) {
          if (i + 1 < bandTicks.length) {
            return xBar(bandTicks[i + 1].date) - barPadding;
          }
          if (bandTicks.length > 0) {
            return xBar(xDomain[1]) + barWidth + barPadding;
          }
          return xBar(d.date) + barPadding;
        }).style("stroke", seasonColorFn);
      };
      aggBands.transition().duration(transitionMs).call(bandPosition);
      aggBands.enter().append("line").style("opacity", 1e-6).call(bandPosition).transition().duration(transitionMs).style("opacity", 1).each("end", function() {
        d3.select(this).style("opacity", null);
      });
      aggBands.exit().transition().duration(transitionMs).style("opacity", 1e-6).remove();
      function labelTextX(d) {
        var x = parent.valueXMidBar(d);
        return x;
      }
      function textFn(d) {
        return labelFormatter((d.plus - d.minus) / parent.yScale());
      }
      var labelFormatter = timeAggregateLabelFormatter();
      var aggBandLabels = svgAggBandLabelGroup.selectAll("text").data(parent.trimToXDomain(bandTicks), parent.keyX);
      aggBandLabels.transition().duration(transitionMs).attr("x", labelTextX).text(textFn);
      aggBandLabels.enter().append("text").style("opacity", 1e-6).attr("x", labelTextX).transition().duration(transitionMs).style("opacity", 1).text(textFn).each("end", function() {
        d3.select(this).style("opacity", null);
      });
      aggBandLabels.exit().transition().duration(transitionMs).style("opacity", 1e-6).remove();
    }
    function drawTimeAggregates(timeAggregateData) {
      var transitionMs = parent.transitionMs(), aggLabels, labelTicks, labelFormatter = timeAggregateLabelFormatter();
      labelTicks = parent.trimToXDomain(timeAggregateData);
      function textFn(d) {
        return labelFormatter(d.plus / parent.yScale());
      }
      aggLabels = svgAggGroup.selectAll("text").data(labelTicks, parent.keyX);
      aggLabels.transition().duration(transitionMs).attr("x", parent.valueXMidBar).text(textFn).style("fill", labelSeasonColors);
      aggLabels.enter().append("text").attr("x", parent.valueXMidBar).style("opacity", 1e-6).style("fill", labelSeasonColors).transition().duration(transitionMs).text(textFn).style("opacity", 1).each("end", function() {
        d3.select(this).style("opacity", null);
      });
      aggLabels.exit().transition().duration(transitionMs).style("opacity", 1e-6).remove();
    }
    function calculateHoverData(point) {
      if (!chartDrawData) {
        return;
      }
      var barRange = parent.xBar.range(), barBisection = d3.bisectLeft(barRange, point[0]), barIndex = barBisection < 1 ? 0 : barBisection - 1, barDate = parent.xBar.domain()[barIndex], allData = [], hoverData = [], callbackData = {
        data: hoverData,
        yRange: [ parent.y(0), parent.y(0) ],
        allData: allData,
        groups: {}
      };
      chartDrawData.groupedData.forEach(function(groupArray, idx) {
        var groupHoverData = {
          groupId: parent.groupIds[idx],
          data: [],
          negate: negativeGroupMap[parent.groupIds[idx]] === true
        }, scale = parent.scaleFactor(groupHoverData.groupId), dataValue, totalValue = 0, i;
        if (groupArray.length > 0 && groupArray[0].length > 0) {
          i = bisectDate(groupArray[0], barDate);
          if (i >= groupArray[0].length) {
            i -= 1;
          }
          groupHoverData.index = i;
          groupArray.forEach(function(dataArray) {
            if (dataArray[i].date.getTime() === barDate.getTime()) {
              dataValue = dataArray[i][parent.plotPropertyName] * scale;
              if (callbackData.dateUTC === undefined && dataArray[i].created) {
                callbackData.dateUTC = dataArray[i].created;
                callbackData.utcDate = sn.format.timestampFormat.parse(callbackData.dateUTC);
              }
            } else {
              dataValue = null;
            }
            totalValue += dataValue;
            groupHoverData.data.push(dataValue);
            allData.push(dataValue);
          });
          groupHoverData.total = totalValue;
          groupHoverData.y = parent.y(totalValue);
          if (groupHoverData.y < callbackData.yRange[0]) {
            callbackData.yRange[0] = groupHoverData.y;
          }
          if (groupHoverData.y > callbackData.yRange[1]) {
            callbackData.yRange[1] = groupHoverData.y;
          }
        }
        hoverData.push(groupHoverData);
        callbackData.groups[groupHoverData.groupId] = groupHoverData;
      });
      callbackData.date = barDate;
      callbackData.x = parent.valueXMidBar({
        date: barDate
      });
      callbackData.index = barIndex;
      if (callbackData.utcDate === undefined) {
        chartDrawData.groupedData.some(function(groupArray) {
          return groupArray.some(function(dataArray) {
            var d = dataArray.length > 0 ? dataArray[0] : undefined, i = -1, dateUTC, time = d3.time.month, step = 1, agg = parent.aggregate();
            if (d && d.date && d.created) {
              parent.xBar.domain().some(function(date, dateIndex) {
                if (date.getTime() === d.date.getTime()) {
                  i = dateIndex;
                  return true;
                }
                return false;
              });
              if (i >= 0) {
                dateUTC = sn.format.timestampFormat.parse(d.created);
                if (agg === "Day") {
                  time = d3.time.day;
                } else if (agg === "Hour") {
                  time = d3.time.hour;
                } else if (agg === "FiveMinute") {
                  time = d3.time.minute;
                  step = 5;
                } else if (agg === "TenMinute") {
                  time = d3.time.minute;
                  step = 10;
                } else if (agg === "FifteenMinute") {
                  time = d3.time.minute;
                  step = 15;
                }
                callbackData.utcDate = time.offset(dateUTC, step * (barIndex - i));
                return true;
              }
            }
            return false;
          });
        });
      }
      return callbackData;
    }
    function handleHoverEnter() {
      var callback = parent.hoverEnterCallback();
      if (!callback) {
        return;
      }
      var point = sn.tapCoordinates(this), callbackData = calculateHoverData(point);
      if (!callbackData) {
        selectedBarData = undefined;
        return;
      }
      parent.drawHoverHighlightBars(callbackData && callbackData.dateUTC ? [ callbackData ] : []);
      selectedBarData = callbackData;
      callback.call(parent.me, this, point, callbackData);
    }
    function handleHoverMove() {
      var callback = parent.hoverMoveCallback();
      if (!callback) {
        return;
      }
      var point = sn.tapCoordinates(this), callbackData = calculateHoverData(point);
      if (!callbackData) {
        selectedBarData = undefined;
        return;
      }
      parent.drawHoverHighlightBars(callbackData && callbackData.dateUTC ? [ callbackData ] : []);
      selectedBarData = callbackData;
      if (selectionBarData.length > 0) {
        if (callbackData.date > selectionBarData[0].date) {
          parent.drawSelection(selectionBarData.concat(callbackData));
        } else {
          parent.drawSelection([ callbackData, selectionBarData[0] ]);
        }
      }
      callback.call(parent.me, this, point, callbackData);
    }
    function handleHoverLeave() {
      var callback = parent.hoverLeaveCallback();
      if (!callback) {
        return;
      }
      var args = [];
      if (this) {
        args.push(this);
        args.push(sn.tapCoordinates(this));
      }
      parent.drawHoverHighlightBars([]);
      selectedBarData = undefined;
      callback.apply(parent.me, args);
    }
    function handleDoubleClick() {
      var callback = parent.doubleClickCallback();
      if (!callback) {
        return;
      }
      var point = sn.tapCoordinates(this);
      var callbackData = selectedBarData;
      if (!callbackData) {
        callbackData = calculateHoverData(point);
      }
      if (selectionBarData.length > 0) {
        selectionBarData.length = 0;
        parent.drawSelection(selectionBarData);
      }
      d3.event.preventDefault();
      callback.call(parent.me, this, point, callbackData);
    }
    function handleClick() {
      var rangeCallback = parent.rangeSelectionCallback();
      if (!rangeCallback) {
        return;
      }
      var point = sn.tapCoordinates(this);
      var callbackData = selectedBarData, selectionCallbackData;
      if (!callbackData) {
        callbackData = calculateHoverData(point);
      }
      if (!callbackData) {
        return;
      }
      if ((sn.hasTouchSupport || d3.event.shiftKey) && selectionBarData.length > 0) {
        if (callbackData.date > selectionBarData[0].date) {
          selectionBarData.push(callbackData);
        } else {
          selectionBarData.splice(0, 0, callbackData);
        }
      } else if (selectionBarData.length > 0) {
        selectionBarData.length = 0;
      } else {
        selectionBarData.push(callbackData);
      }
      selectionCallbackData = selectionBarData;
      if (selectionBarData.length > 1) {
        selectionCallbackData = selectionBarData.slice(0, selectionBarData.length);
        selectionBarData.length = 0;
      }
      parent.drawSelection(selectionBarData);
      d3.event.preventDefault();
      rangeCallback.call(parent.me, this, point, selectionCallbackData);
    }
    self.showSumLine = function(value) {
      if (!arguments.length) return !svgSumLineGroup.classed("off");
      var transitionMs = parent.transitionMs();
      svgSumLineGroup.style("opacity", value ? 1e-6 : 1).classed("off", false).transition().duration(transitionMs).style("opacity", value ? 1 : 1e-6).each("end", function() {
        d3.select(this).style("opacity", null).classed("off", !value);
      });
      return parent.me;
    };
    /**
	 * Toggle between nothern/southern hemisphere seasons, or get the current setting.
	 * 
	 * @param {boolean} [value] <em>true</em> for northern hemisphere seasons, <em>false</em> for sothern hemisphere
	 * @returns when used as a getter, the current setting
	 * @memberOf sn.chart.energyIOBarChart
	 * @preserve
	 */
    self.northernHemisphere = function(value) {
      if (!arguments.length) return northernHemisphere;
      if (value === northernHemisphere) {
        return;
      }
      var transitionMs = parent.transitionMs();
      northernHemisphere = value === true;
      svgAggBandGroup.selectAll("line").transition().duration(transitionMs).style("stroke", seasonColorFn);
      svgAggGroup.selectAll("text").transition().duration(transitionMs).style("fill", labelSeasonColors);
      return parent.me;
    };
    /**
	 * Get or set an array of group IDs to treat as negative group IDs, that appear below
	 * the X axis.
	 *
	 * @param {Array} [value] the array of group IDs to use
	 * @return {Array} when used as a getter, the list of group IDs currently used, otherwise this object
	 * @memberOf sn.chart.energyIOBarChart
	 * @preserve
	 */
    self.negativeGroupIds = function(value) {
      if (!arguments.length) {
        return function() {
          var prop, result = [];
          for (prop in negativeGroupMap) {
            if (negativeGroupMap.hasOwnProperty(prop)) {
              result.pus(prop);
            }
          }
          return result;
        }();
      }
      negativeGroupMap = {};
      value.forEach(function(e) {
        negativeGroupMap[e] = true;
      });
      return parent.me;
    };
    parent.draw = draw;
    parent.handleHoverEnter = handleHoverEnter;
    parent.handleHoverMove = handleHoverMove;
    parent.handleHoverLeave = handleHoverLeave;
    parent.handleClick = handleClick;
    parent.handleDoubleClick = handleDoubleClick;
    return self;
  };
  /**
 * @typedef sn.chart.energyIOPieChartParameters
 * @type {sn.Configuration}
 * @property {number} [width=812] - desired width, in pixels, of the chart
 * @property {number} [height=300] - desired height, in pixels, of the chart
 * @property {number[]} [padding=[10, 0, 20, 30]] - padding to inset the chart by, in top, right, bottom, left order
 * @property {number} [transitionMs=600] - transition time
 * @property {sn.Configuration} excludeSources - the sources to exclude from the chart
 * @property {boolean} [hidePercentages=false] - if false, show percentages represented by each slice
 * @property {boolean} [hideValues=false] - if false, show the actual values represented by each slice
 * @property {number} [innerRadius=0] - an inner radius for the chart, in pixels
 * @property {number} [percentageLabelMinimumPercent=5] - the minimum percentage necessary for a percentage label to appear
 * @property {number} [valueLabelMinimumPercent=5] - the minimum percentage necessary for a value label to appear
 * @preserve
 */
  /**
 * A power input and output chart designed to show consumption and generation data as an overall
 * percentage.
 * 
 * You can use the {@code excludeSources} parameter to dynamically alter which sources are visible
 * in the chart. After changing the configuration call {@link sn.chart.energyIOPieChart#regenerate()}
 * to re-draw the chart.
 * 
 * @class
 * @param {string} containerSelector - the selector for the element to insert the chart into
 * @param {sn.chart.energyIOPieChartParameters} [chartConfig] - the chart parameters
 * @returns {sn.chart.energyIOPieChart}
 * @preserve
 */
  sn.chart.energyIOPieChart = function(containerSelector, chartConfig) {
    var self = {
      version: "1.0.0"
    };
    var me = self;
    var sources = [];
    var config = chartConfig || new sn.Configuration();
    var containerWidth = sn.ui.pixelWidth(containerSelector);
    var p = config.padding || [ 24, 24, 24, 24 ], w = (config.width || containerWidth || 300) - p[1] - p[3], h = (config.height || 300) - p[0] - p[2], r = d3.min([ w, h ]) / 2;
    var transitionMs = undefined;
    var plotProperty = "wattHours";
    var chartData = undefined, chartLabels = undefined;
    var svgRoot, svgHoverRoot;
    var scaleFactors = {};
    var colorCallback = undefined;
    var sourceExcludeCallback = undefined;
    var displayFactorCallback = undefined;
    var layerKeyCallback = undefined;
    var layerKeySort = sortSliceKeys;
    var hoverEnterCallback = undefined, hoverMoveCallback = undefined, hoverLeaveCallback = undefined, clickCallback = undefined;
    var percentFormatter = d3.format(".0%");
    var originalData = {};
    var groupIds = [];
    var pieSlices = undefined;
    var totalValue = 0;
    var innerRadius = 0;
    var arc = d3.svg.arc();
    var handleHoverEnter = function() {
      if (!hoverEnterCallback) {
        return;
      }
      var slice = d3.select(this), point = d3.mouse(this), callbackData = calculateHoverData(slice, point);
      slice.transition().duration(transitionMs).attr("transform", hoverHighlightFn);
      hoverEnterCallback.call(me, this, point, callbackData);
    };
    var handleHoverMove = function() {
      if (!hoverMoveCallback) {
        return;
      }
      var slice = d3.select(this), point = d3.mouse(this), callbackData = calculateHoverData(slice, point);
      hoverMoveCallback.call(me, this, point, callbackData);
    };
    var handleHoverLeave = function() {
      if (!hoverLeaveCallback) {
        return;
      }
      var slice = d3.select(this), point = d3.mouse(this), callbackData = calculateHoverData(slice, point);
      slice.transition().duration(transitionMs).attr("transform", "identity").each("end", function() {
        d3.select(this).style("transform", null);
      });
      hoverLeaveCallback.call(me, this, point, callbackData);
    };
    var handleClick = function() {
      if (!clickCallback) {
        return;
      }
      var slice = d3.select(this), point = d3.mouse(this), callbackData = calculateHoverData(slice, point);
      clickCallback.call(me, this, point, callbackData);
    };
    function hoverHighlightFn(d) {
      return "scale(1.05) " + halfWayAngleTransform(d, 4);
    }
    function getOrCreateHoverRoot() {
      if (!svgHoverRoot) {
        svgHoverRoot = svgRoot.append("g").attr("class", "hover-root").attr("transform", "translate(" + p[3] + "," + p[0] + ")");
      }
      return svgHoverRoot;
    }
    function calculateHoverData(slice) {
      var d = slice.data()[0], a = halfAngle(d), al = halfAngleForLabel(d);
      return {
        groupId: d.data.groupId,
        sourceId: d.data.sourceId,
        allData: pieSlices.map(function(el) {
          return el.data;
        }),
        value: d.value,
        valueDisplay: outerText(d),
        percent: d.value / totalValue,
        percentDisplay: innerText(d),
        totalValue: totalValue,
        totalValueDisplay: displayFormatter(totalValue / displayFactor),
        angle: a,
        angleStart: d.startAngle,
        angleEnd: d.endAngle,
        degrees: sn.math.rad2deg(a),
        radius: r,
        innerRadius: innerRadius,
        center: [ (w + p[1] + p[3]) / 2, (h + p[0] + p[2]) / 2 ],
        centerContainer: svgRoot.node(),
        labelTranslate: [ Math.cos(al) * (r + 15), Math.sin(al) * (r + 15) ]
      };
    }
    function sortSliceKeys(d1, d2) {
      return d1.key.localeCompare(d2.key);
    }
    function parseConfiguration() {
      transitionMs = config.value("transitionMs") || 600;
      innerRadius = config.value("innerRadius") || 0;
      arc.innerRadius(innerRadius).outerRadius(r);
    }
    parseConfiguration();
    svgRoot = d3.select(containerSelector).select("svg");
    if (svgRoot.empty()) {
      svgRoot = d3.select(containerSelector).append("svg:svg").attr("class", "chart").attr("width", w + p[1] + p[3]).attr("height", h + p[0] + p[2]);
    } else {
      svgRoot.selectAll("*").remove();
    }
    chartData = svgRoot.append("g").attr("class", "data").attr("transform", "translate(" + (w + p[1] + p[3]) / 2 + "," + (h + p[0] + p[2]) / 2 + ")");
    chartLabels = svgRoot.append("g").attr("class", "label").attr("transform", "translate(" + (w + p[1] + p[3]) / 2 + "," + (h + p[0] + p[2]) / 2 + ")");
    var displayFactor = 1;
    var displayFormatter = d3.format(",d");
    function sliceValue(d) {
      return d.value;
    }
    function computeUnits() {
      var fmt;
      var maxValue = d3.max(pieSlices, sliceValue);
      displayFactor = 1;
      if (displayFactorCallback) {
        displayFactor = displayFactorCallback.call(self, maxValue);
      } else if (maxValue >= 1e9) {
        displayFactor = 1e9;
      } else if (maxValue >= 1e6) {
        displayFactor = 1e6;
      } else if (maxValue >= 1e3) {
        displayFactor = 1e3;
      }
      if (displayFactor >= 1e6) {
        fmt = ",.2f";
      } else if (displayFactor === 1e3) {
        fmt = ",.1f";
      } else if (displayFactor === 1) {
        fmt = ",d";
      } else {
        fmt = ",g";
      }
      displayFormatter = d3.format(fmt);
      totalValue = d3.sum(pieSlices, sliceValue);
    }
    function setup() {
      var combinedRollup = [];
      groupIds.forEach(function(groupId) {
        var keyFn = function(d, i) {
          return layerKeyCallback ? layerKeyCallback.call(self, groupId, d, i) : (groupId + "-" + d.sourceId).replace(/\W/, "-");
        };
        var rollup = d3.nest().key(keyFn).rollup(function(group) {
          var result = {
            sum: 0,
            groupId: groupId
          };
          if (group.length) {
            result.sourceId = group[0].sourceId;
            result.sum = d3.sum(group, function(d) {
              var val = d[plotProperty];
              if (val && val < 0 || sourceExcludeCallback && sourceExcludeCallback.call(self, groupId, d.sourceId)) {
                val = 0;
              }
              return val;
            }) * self.scaleFactor(groupId);
          }
          return result;
        }).entries(originalData[groupId]);
        if (sourceExcludeCallback) {
          rollup = rollup.filter(function(e) {
            return !sourceExcludeCallback.call(self, groupId, e.key);
          });
        }
        combinedRollup = combinedRollup.concat(rollup.map(function(e) {
          e.values.key = e.key;
          return e.values;
        }));
      });
      var pie = d3.layout.pie().sort(layerKeySort).value(function(d) {
        return d.sum;
      });
      pieSlices = pie(combinedRollup);
      computeUnits();
    }
    function pieSliceColorFn(d, i) {
      if (colorCallback) {
        return colorCallback.call(self, d.data.groupId, d.data.sourceId, i);
      }
      var colors = d3.scale.category10().range();
      return colors[i % colors.length];
    }
    function clearOpacity() {
      d3.select(this).style("opacity", null);
    }
    function arcTween(d) {
      var iStart = d3.interpolate(this._data_start.startAngle, d.startAngle);
      var iEnd = d3.interpolate(this._data_start.endAngle, d.endAngle);
      this._data_start = d;
      return function(t) {
        var td = {
          startAngle: iStart(t),
          endAngle: iEnd(t)
        };
        return arc(td);
      };
    }
    function pieSliceKey(d) {
      return d.data.key;
    }
    function draw() {
      var pie = chartData.selectAll("path").data(pieSlices, pieSliceKey);
      pie.transition().duration(transitionMs).attr("d", arc).style("fill", pieSliceColorFn).attrTween("d", arcTween);
      pie.enter().append("path").attr("class", function(d) {
        return "area " + d.data.key;
      }).style("fill", pieSliceColorFn).style("opacity", 1e-6).attr("d", arc).attr("pointer-events", "all").on("mouseover", handleHoverEnter).on("mousemove", handleHoverMove).on("mouseout", handleHoverLeave).on(sn.tapEventNames.click, handleClick).each(function(d) {
        this._data_start = d;
      }).transition().duration(transitionMs).style("opacity", 1).each("end", clearOpacity);
      pie.exit().transition().duration(transitionMs).style("opacity", 1e-6).remove();
      redrawLabels();
    }
    function halfAngle(d) {
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }
    function halfAngleForLabel(d) {
      return halfAngle(d) - Math.PI / 2;
    }
    function halfWayAngleTransformTween(d, r) {
      var i = d3.interpolate(halfAngle(this._data_start), halfAngle(d));
      this._data_start = d;
      return function(t) {
        var a = i(t) - Math.PI / 2;
        return "translate(" + Math.cos(a) * r + "," + Math.sin(a) * r + ")";
      };
    }
    function halfWayAngleTransform(d, r) {
      var a = halfAngleForLabel(d);
      return "translate(" + Math.cos(a) * r + "," + Math.sin(a) * r + ")";
    }
    function outerText(d) {
      return displayFormatter(d.value / displayFactor);
    }
    function innerText(d) {
      return percentFormatter(d.value / totalValue);
    }
    function outerTextAnchor(d) {
      var a = halfAngle(d);
      if (a < Math.PI * 2 * (1 / 8) || a > Math.PI * 2 * (7 / 8)) {
        return "middle";
      } else if (a < Math.PI * 2 * (3 / 8)) {
        return "start";
      } else if (a < Math.PI * 2 * (5 / 8)) {
        return "middle";
      }
      return "end";
    }
    function outerTextDY(d) {
      var a = halfAngle(d);
      if (a >= Math.PI * 2 * (3 / 8) && a < Math.PI * 2 * (5 / 8)) {
        return "0.5em";
      }
      return 0;
    }
    function innerLabelMinValue() {
      var m = Number(config.value("percentageLabelMinimumPercent"));
      return (isNaN(m) ? 5 : m) / 100 * totalValue;
    }
    function outerLabelMinValue() {
      var m = Number(config.value("valueLabelMinimumPercent"));
      return (isNaN(m) ? 5 : m) / 100 * totalValue;
    }
    function redrawLabels() {
      var outerMinValue = outerLabelMinValue();
      var outerLabelData = config.enabled("hideValues") ? [] : pieSlices.filter(function(e) {
        return e.value > outerMinValue;
      });
      var outerLabels = chartLabels.selectAll("text.outer").data(outerLabelData, pieSliceKey);
      outerLabels.transition().duration(transitionMs).text(outerText).attr("text-anchor", outerTextAnchor).attr("dy", outerTextDY).attr("transform", function(d) {
        return halfWayAngleTransform(d, r + 15);
      }).attrTween("transform", function(d) {
        return halfWayAngleTransformTween.call(this, d, r + 15);
      });
      outerLabels.enter().append("text").classed("outer", true).attr("transform", function(d) {
        return halfWayAngleTransform(d, r + 15);
      }).attr("text-anchor", outerTextAnchor).attr("dy", outerTextDY).style("opacity", 1e-6).text(outerText).each(function(d) {
        this._data_start = d;
      }).transition().duration(transitionMs).style("opacity", 1).each("end", clearOpacity);
      outerLabels.exit().transition().duration(transitionMs).style("opacity", 1e-6).remove();
      var innerMinValue = innerLabelMinValue();
      var innerLabelData = config.enabled("hidePercentages") ? [] : pieSlices.filter(function(e) {
        return e.value > innerMinValue;
      });
      var innerLabels = chartLabels.selectAll("text.inner").data(innerLabelData, pieSliceKey);
      var labelRadius = (r - innerRadius) / 2 + innerRadius;
      innerLabels.transition().duration(transitionMs).text(innerText).attr("transform", function(d) {
        return halfWayAngleTransform(d, labelRadius);
      }).attrTween("transform", function(d) {
        return halfWayAngleTransformTween.call(this, d, labelRadius);
      });
      innerLabels.enter().append("text").classed("inner", true).attr("transform", function(d) {
        return halfWayAngleTransform(d, labelRadius);
      }).attr("text-anchor", "middle").style("opacity", 1e-6).text(innerText).each(function(d) {
        this._data_start = d;
      }).transition().duration(transitionMs).style("opacity", 1).each("end", clearOpacity);
      innerLabels.exit().transition().duration(transitionMs).style("opacity", 1e-6).remove();
    }
    self.sources = sources;
    self.scale = function() {
      return displayFactorCallback ? displayFactorCallback() : displayFactor;
    };
    self.totalValue = function() {
      return totalValue;
    };
    self.reset = function() {
      originalData = {};
      groupIds = [];
      pieSlices = undefined;
      return me;
    };
    self.load = function(rawData, groupId) {
      if (originalData[groupId] === undefined) {
        groupIds.push(groupId);
        originalData[groupId] = rawData;
      } else {
        originalData[groupId].concat(rawData);
      }
      return me;
    };
    self.regenerate = function() {
      if (originalData === undefined) {
        return self;
      }
      parseConfiguration();
      setup();
      draw();
      return me;
    };
    self.transitionMs = function(value) {
      if (!arguments.length) return transitionMs;
      transitionMs = +value;
      return me;
    };
    self.plotProperty = function(value) {
      if (!arguments.length) return plotProperty;
      plotProperty = value;
      return me;
    };
    self.scaleFactor = function(groupId, value) {
      var v;
      if (!arguments.length) return scaleFactors;
      if (arguments.length === 1) {
        if (typeof groupId === "string") {
          v = scaleFactors[groupId];
          return v === undefined ? 1 : v;
        }
        scaleFactors = groupId;
      } else if (arguments.length == 2) {
        scaleFactors[groupId] = value;
      }
      return me;
    };
    self.colorCallback = function(value) {
      if (!arguments.length) return colorCallback;
      if (typeof value === "function") {
        colorCallback = value;
      } else {
        colorCallback = undefined;
      }
      return me;
    };
    self.displayFactorCallback = function(value) {
      if (!arguments.length) return displayFactorCallback;
      if (typeof value === "function") {
        displayFactorCallback = value;
      } else {
        displayFactorCallback = undefined;
      }
      return me;
    };
    self.sourceExcludeCallback = function(value) {
      if (!arguments.length) return sourceExcludeCallback;
      if (typeof value === "function") {
        sourceExcludeCallback = value;
      } else {
        sourceExcludeCallback = undefined;
      }
      return me;
    };
    self.layerKeyCallback = function(value) {
      if (!arguments.length) return layerKeyCallback;
      if (typeof value === "function") {
        layerKeyCallback = value;
      }
      return me;
    };
    self.layerKeySort = function(value) {
      if (!arguments.length) return layerKeySort;
      if (typeof value === "function") {
        layerKeySort = value;
      }
      return me;
    };
    self.hoverEnterCallback = function(value) {
      if (!arguments.length) return hoverEnterCallback;
      getOrCreateHoverRoot();
      if (typeof value === "function") {
        hoverEnterCallback = value;
      } else {
        hoverEnterCallback = undefined;
      }
      return me;
    };
    self.hoverMoveCallback = function(value) {
      if (!arguments.length) return hoverMoveCallback;
      getOrCreateHoverRoot();
      if (typeof value === "function") {
        getOrCreateHoverRoot();
        hoverMoveCallback = value;
      } else {
        hoverMoveCallback = undefined;
      }
      return me;
    };
    self.hoverLeaveCallback = function(value) {
      if (!arguments.length) return hoverLeaveCallback;
      getOrCreateHoverRoot();
      if (typeof value === "function") {
        hoverLeaveCallback = value;
      } else {
        hoverLeaveCallback = undefined;
      }
      return me;
    };
    self.clickCallback = function(value) {
      if (!arguments.length) return clickCallback;
      if (typeof value === "function") {
        clickCallback = value;
      } else {
        clickCallback = undefined;
      }
      return me;
    };
    return self;
  };
  sn.math = {
    deg2rad: sn_math_deg2rad,
    rad2deg: sn_math_rad2deg
  };
  /**
 * Convert degrees to radians.
 * 
 * @param {number} deg - the degrees value to convert to radians
 * @returns {number} the radians
 * @preserve
 */
  function sn_math_deg2rad(deg) {
    return deg * Math.PI / 180;
  }
  /**
 * Convert radians to degrees.
 * 
 * @param {number} rad - the radians value to convert to degrees
 * @returns {number} the degrees
 * @preserve
 */
  function sn_math_rad2deg(rad) {
    return rad * 180 / Math.PI;
  }
  /**
 * An analog, circular gauge styled like a speedometer.
 *
 * @preserve
 */
  sn.chart.gauge = function(container, configuration) {
    var that = {
      version: "1.0.0"
    };
    var config = {
      size: 200,
      clipWidth: 200,
      clipHeight: 110,
      ringInset: 20,
      ringWidth: 20,
      pointerWidth: 10,
      pointerTailLength: 5,
      pointerHeadLengthPercent: .9,
      minValue: 0,
      maxValue: 10,
      minAngle: -90,
      maxAngle: 90,
      transitionMs: 750,
      majorTicks: 5,
      labelFormat: d3.format(",g"),
      labelInset: 10,
      arcColorFn: d3.interpolateHsl(d3.rgb("#e8e2ca"), d3.rgb("#3e6c0a"))
    };
    var range = undefined;
    var r = undefined;
    var pointerHeadLength = undefined;
    var svg = undefined;
    var arc = undefined;
    var scale = undefined;
    var ticks = undefined;
    var tickData = undefined;
    var pointer = undefined;
    function angle(d) {
      var ratio = scale(d);
      var newAngle = config.minAngle + ratio * range;
      return newAngle;
    }
    function configure(configuration) {
      var prop = undefined;
      for (prop in configuration) {
        config[prop] = configuration[prop];
      }
      range = config.maxAngle - config.minAngle;
      r = config.size / 2;
      pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);
      scale = d3.scale.linear().range([ 0, 1 ]).domain([ config.minValue, config.maxValue ]);
      ticks = scale.ticks(config.majorTicks);
      tickData = d3.range(config.majorTicks).map(function() {
        return 1 / config.majorTicks;
      });
      arc = d3.svg.arc().innerRadius(r - config.ringWidth - config.ringInset).outerRadius(r - config.ringInset).startAngle(function(d, i) {
        var ratio = d * i;
        return sn.math.deg2rad(config.minAngle + ratio * range);
      }).endAngle(function(d, i) {
        var ratio = d * (i + 1);
        return sn.math.deg2rad(config.minAngle + ratio * range);
      });
    }
    that.configure = configure;
    function centerTranslation() {
      return "translate(" + r + "," + r + ")";
    }
    function isRendered() {
      return svg !== undefined;
    }
    that.isRendered = isRendered;
    function render(newValue) {
      svg = d3.select(container).append("svg:svg").attr("class", "gauge").attr("width", config.clipWidth).attr("height", config.clipHeight);
      var centerTx = centerTranslation();
      var arcs = svg.append("g").attr("class", "arc").attr("transform", centerTx);
      arcs.selectAll("path").data(tickData).enter().append("path").attr("fill", function(d, i) {
        return config.arcColorFn(d * i);
      }).attr("d", arc);
      var lg = svg.append("g").attr("class", "label").attr("transform", centerTx);
      lg.selectAll("text").data(ticks).enter().append("text").attr("transform", function(d) {
        var a = angle(d);
        return "rotate(" + a + ") translate(0," + (config.labelInset - r) + ")";
      }).text(config.labelFormat);
      var lineData = [ [ config.pointerWidth / 2, 0 ], [ 0, -pointerHeadLength ], [ -(config.pointerWidth / 2), 0 ], [ 0, config.pointerTailLength ], [ config.pointerWidth / 2, 0 ] ];
      var pointerLine = d3.svg.line().interpolate("monotone");
      var pg = svg.append("g").data([ lineData ]).attr("class", "pointer").attr("transform", centerTx);
      pointer = pg.append("path").attr("d", pointerLine).attr("transform", "rotate(" + config.minAngle + ")");
      update(newValue === undefined ? 0 : newValue);
    }
    that.render = render;
    function update(newValue, newConfiguration) {
      if (newConfiguration !== undefined) {
        configure(newConfiguration);
      }
      var a = angle(newValue);
      pointer.transition().duration(config.transitionMs).ease("elastic").attr("transform", "rotate(" + a + ")");
    }
    that.update = update;
    configure(configuration);
    return that;
  };
  /**
 * @typedef sn.chart.powerAreaChartParameters
 * @type {sn.Configuration}
 * @property {number} [width=812] - desired width, in pixels, of the chart
 * @property {number} [height=300] - desired height, in pixels, of the chart
 * @property {number[]} [padding=[10, 0, 20, 30]] - padding to inset the chart by, in top, right, bottom, left order
 * @property {number} [transitionMs=600] - transition time
 * @property {object} [plotProperties] - the property to plot for specific aggregation levels; if unspecified 
 *                                       the {@code watts} property is used
 * @property {sn.Configuration} excludeSources - the sources to exclude from the chart
 * @preserve
 */
  /**
 * An power stacked area chart.
 * 
 * @class
 * @param {string} containerSelector - the selector for the element to insert the chart into
 * @param {sn.chart.powerAreaChartParameters} [chartConfig] - the chart parameters
 * @returns {sn.chart.powerAreaChart}
 * @preserve
 */
  sn.chart.powerAreaChart = function(containerSelector, chartConfig) {
    var parent = sn.chart.baseGroupedStackTimeChart(containerSelector, chartConfig), superDraw = sn.util.superMethod.call(parent, "draw");
    var self = function() {
      var me = sn.util.copy(parent);
      return me;
    }();
    parent.me = self;
    var areaPathGenerator = d3.svg.area().interpolate("monotone").x(function(d) {
      return parent.x(d.date);
    }).y0(function(d) {
      return parent.y(d.y0);
    }).y1(function(d) {
      return parent.y(d.y0 + d.y);
    });
    function areaFillFn(d, i) {
      return parent.fillColor.call(this, d[0][parent.internalPropName].groupId, d[0], i);
    }
    function setup() {
      var allData = [], layerData, dummy, rangeX, rangeY, layers, plotPropName = parent.plotPropertyName;
      var stack = d3.layout.stack().offset(self.stackOffset()).values(function(d) {
        return d.values;
      }).x(function(d) {
        return d.date;
      }).y(function(d) {
        var y = d[plotPropName], scaleFactor = parent.scaleFactor(d[parent.internalPropName].groupId);
        if (y === undefined || y < 0 || y === null) {
          y = 0;
        }
        return y * scaleFactor;
      });
      parent.groupIds.forEach(function(groupId) {
        var rawGroupData = self.data(groupId), i, len, d;
        if (!rawGroupData || !rawGroupData.length > 1) {
          return;
        }
        for (i = 0, len = rawGroupData.length; i < len; i += 1) {
          d = rawGroupData[i];
          if (!d.hasOwnProperty(parent.internalPropName)) {
            d[parent.internalPropName] = {};
            d[parent.internalPropName].groupId = groupId;
            if (self.dataCallback()) {
              self.dataCallback().call(parent.me, groupId, d);
            } else if (d.date === undefined) {
              d.date = sn.api.datum.datumDate(d);
            }
          }
          if (self.sourceExcludeCallback() && self.sourceExcludeCallback().call(parent.me, groupId, d.sourceId)) {
            continue;
          }
          allData.push(d);
        }
      });
      layerData = d3.nest().key(function(d) {
        return d[parent.internalPropName].groupId + "|" + d.sourceId;
      }).sortKeys(d3.ascending).entries(allData);
      if (layerData.length < 1) {
        return;
      }
      dummy = {};
      dummy[plotPropName] = null;
      sn.api.datum.nestedStackDataNormalizeByDate(layerData, dummy, function(dummy, key) {
        var idx = key.indexOf("|");
        dummy[parent.internalPropName] = {
          groupId: key.slice(0, idx)
        };
        dummy.sourceId = key.slice(idx + 1);
      });
      parent.insertNormalizedDurationIntoLayerData(layerData);
      if (parent.me.layerPostProcessCallback()) {
        layerData = function() {
          var newLayerData = [];
          parent.groupIds.forEach(function(groupId) {
            var layerDataForGroup = layerData.filter(function(e) {
              return e.key.indexOf(groupId + "|") === 0;
            });
            if (layerDataForGroup.length > 0) {
              newLayerData = newLayerData.concat(parent.me.layerPostProcessCallback().call(parent.me, groupId, layerDataForGroup));
            }
          });
          return newLayerData;
        }();
      }
      rangeX = allData.length > 0 ? [ allData[0].date, allData[allData.length - 1].date ] : undefined;
      layers = stack(layerData);
      parent.groupLayers["All"] = layers;
      rangeY = [ 0, d3.max(layers[layers.length - 1].values, function(d) {
        return d.y0 + d.y;
      }) ];
      if (rangeX !== undefined) {
        parent.x.domain(rangeX);
      }
      if (rangeY !== undefined) {
        parent.y.domain(rangeY).nice();
      }
      parent.computeUnitsY();
    }
    function draw() {
      var transitionMs = parent.transitionMs();
      var layerData = parent.groupLayers["All"];
      var data = layerData ? layerData.map(function(e) {
        return e.values;
      }) : [];
      var area = parent.svgDataRoot.selectAll("path.area").data(data, function(d) {
        return d.length ? d[0][parent.internalPropName].groupId + "-" + d[0].sourceId : null;
      });
      area.transition().duration(transitionMs).attr("d", areaPathGenerator).style("fill", areaFillFn);
      area.enter().append("path").attr("class", "area").style("fill", areaFillFn).attr("d", areaPathGenerator).style("opacity", 1e-6).transition().duration(transitionMs).style("opacity", 1);
      area.exit().transition().duration(transitionMs).style("opacity", 1e-6).remove();
      superDraw();
    }
    parent.setup = setup;
    parent.draw = draw;
    return self;
  };
  sn.chart.powerAreaOverlapChart = function(containerSelector, chartConfig) {
    var parent = sn.chart.baseGroupedStackTimeChart(containerSelector, chartConfig), superDraw = sn.util.superMethod.call(parent, "draw");
    var that = function() {
      var me = sn.util.copy(parent);
      return me;
    }();
    parent.me = that;
    var areaPathGenerator = d3.svg.area().interpolate("monotone").x(function(d) {
      return parent.x(d.date);
    }).y0(function(d) {
      return parent.y(d.y0);
    }).y1(function(d) {
      return parent.y(d.y0 + d.y);
    });
    function areaFillFn(d, i) {
      return parent.fillColor.call(this, d[0][parent.internalPropName].groupId, d[0], i);
    }
    function areaOpacityFn(d, i, j) {
      !d;
      !i;
      return parent.groupOpacityFn(null, j);
    }
    function draw() {
      var groupedData = [];
      var groupedDataIds = [];
      var groupIds = parent.groupIds;
      var transitionMs = parent.transitionMs();
      groupIds.forEach(function(groupId) {
        var groupLayer = parent.groupLayers[groupId];
        if (groupLayer === undefined) {
          return;
        }
        groupedDataIds.push(groupId);
        var groupData = groupLayer.map(function(e) {
          return e.values;
        });
        groupedData.push(groupData);
      });
      var groups = parent.svgDataRoot.selectAll("g.data").data(groupedData, function(d, i) {
        !d;
        return groupedDataIds[i];
      });
      groups.enter().append("g").attr("class", "data");
      groups.exit().transition().duration(transitionMs).style("opacity", 1e-6).remove();
      var area = groups.selectAll("path.area").data(Object, function(d) {
        return d.length ? d[0][parent.internalPropName].groupId + "." + d[0].sourceId : null;
      });
      area.transition().duration(transitionMs).delay(200).attr("d", areaPathGenerator).style("fill", areaFillFn);
      area.enter().append("path").attr("class", "area").style("fill", areaFillFn).attr("d", areaPathGenerator).style("opacity", 1e-6).transition().duration(transitionMs).style("opacity", areaOpacityFn);
      area.exit().transition().duration(transitionMs).style("opacity", 1e-6).remove();
      superDraw();
    }
    parent.draw = draw;
    parent.normalizeDataTimeGaps(true);
    return that;
  };
  /**
 * @typedef sn.chart.powerIOAreaChartParameters
 * @type {sn.Configuration}
 * @property {number} [width=812] - desired width, in pixels, of the chart
 * @property {number} [height=300] - desired height, in pixels, of the chart
 * @property {number[]} [padding=[10, 0, 20, 30]] - padding to inset the chart by, in top, right, bottom, left order
 * @property {number} [transitionMs=600] - transition time
 * @property {number} [opacityReduction=0.1] - a percent opacity reduction to apply to groups on top of other groups
 * @property {object} [plotProperties] - the property to plot for specific aggregation levels; if unspecified 
 *                                       the {@code watts} property is used
 * @preserve
 */
  /**
 * A power stacked area chart self overlaps two or more data sets.
 * 
 * @class
 * @extends sn.chart.baseGroupedStackChart
 * @param {string} containerSelector - the selector for the element to insert the chart into
 * @param {sn.chart.powerIOAreaChartParameters} [chartConfig] - the chart parameters
 * @returns {sn.chart.powerIOAreaChart}
 * @preserve
 */
  sn.chart.powerIOAreaChart = function(containerSelector, chartConfig) {
    var parent = sn.chart.baseGroupedStackTimeChart(containerSelector, chartConfig), superDraw = sn.util.superMethod.call(parent, "draw");
    var self = function() {
      var me = sn.util.copy(parent);
      Object.defineProperty(me, "version", {
        value: "1.0.0",
        enumerable: true,
        configurable: true
      });
      return me;
    }();
    parent.me = self;
    var svgSumLineGroup = parent.svgRoot.append("g").attr("class", "agg-sum").attr("transform", parent.svgDataRoot.attr("transform"));
    var areaPathGenerator = d3.svg.area().interpolate("monotone").x(function(d) {
      return parent.x(d.date);
    }).y0(function(d) {
      return parent.y(d.y0);
    }).y1(function(d) {
      return parent.y(d.y0 + d.y);
    });
    var negativeGroupMap = {
      Consumption: true
    };
    function areaFillFn(d, i) {
      return parent.fillColor.call(this, d[0][parent.internalPropName].groupId, d[0], i);
    }
    function nestRollupAggregateSum(array) {
      var sum = null, plus = null, minus = null, d, v, i, len = array.length, groupId, scale, negate = false;
      for (i = 0; i < len; i += 1) {
        d = array[i];
        v = d[parent.plotPropertyName];
        if (v !== undefined) {
          groupId = d[parent.internalPropName].groupId;
          scale = parent.scaleFactor(groupId);
          negate = negativeGroupMap[groupId] === true;
          if (negate) {
            minus += v * scale;
          } else {
            plus += v * scale;
          }
        }
      }
      if (plus !== null || minus !== null) {
        sum = plus - minus;
      }
      return {
        date: array[0].date,
        y: sum,
        plus: plus,
        minus: minus
      };
    }
    function ordinalXScale() {
      var result = d3.scale.ordinal(), x = parent.x, aggregateType = parent.aggregate(), xDomain = x.domain(), interval, step = 1, buckets;
      if (aggregateType === "Month") {
        interval = d3.time.month.utc;
      } else if (aggregateType === "Day") {
        interval = d3.time.day.utc;
      } else if (aggregateType === "Hour") {
        interval = d3.time.hour.utc;
      } else if (aggregateType.search(/^Ten/) === 0) {
        interval = d3.time.minute.utc;
        step = 10;
      } else if (aggregateType.search(/^Five/) === 0) {
        interval = d3.time.minute.utc;
        step = 5;
      } else {
        interval = d3.time.minute.utc;
        step = 15;
      }
      buckets = interval.range(xDomain[0], interval.offset(xDomain[1], step), step);
      result.domain(buckets);
      return result;
    }
    function setupDrawData() {
      var groupedData = [], groupIds = parent.groupIds, maxPositiveY = 0, maxNegativeY = 0, xDates = ordinalXScale(), sumLineData;
      groupIds.forEach(function(groupId) {
        var groupLayer = parent.groupLayers[groupId];
        if (groupLayer === undefined) {
          groupedData.push([]);
        } else {
          groupedData.push(groupLayer.map(function(e) {
            var max = d3.max(e.values, function(d) {
              return d.y + d.y0;
            });
            if (negativeGroupMap[groupId] === true) {
              if (max > maxNegativeY) {
                maxNegativeY = max;
              }
            } else if (max > maxPositiveY) {
              maxPositiveY = max;
            }
            return e.values;
          }));
        }
      });
      var allData = d3.merge(d3.merge(groupedData)).concat(xDates.domain().map(function(e) {
        return {
          date: e
        };
      }));
      sumLineData = d3.nest().key(function(d) {
        return d.date.getTime();
      }).sortKeys(d3.ascending).rollup(nestRollupAggregateSum).entries(allData).map(function(e) {
        return e.values;
      });
      return {
        groupedData: groupedData,
        sumLineData: sumLineData,
        maxPositiveY: maxPositiveY,
        maxNegativeY: maxNegativeY
      };
    }
    function draw() {
      var groupIds = parent.groupIds, transitionMs = parent.transitionMs(), groups, sources, centerYLoc, yDomain = parent.y.domain(), drawData;
      drawData = setupDrawData();
      yDomain[0] = -drawData.maxNegativeY;
      yDomain[1] = drawData.maxPositiveY;
      parent.y.domain(yDomain).nice();
      centerYLoc = parent.y(0);
      function dataTypeGroupTransformFn(d, i) {
        !d;
        var yShift = 0;
        if (negativeGroupMap[groupIds[i]] === true) {
          yShift = -(centerYLoc * 2);
          return "scale(1, -1) translate(0," + yShift + ")";
        } else {
          return null;
        }
      }
      groups = parent.svgDataRoot.selectAll("g.dataType").data(drawData.groupedData, function(d, i) {
        !d;
        return groupIds[i];
      });
      groups.transition().duration(transitionMs).attr("transform", dataTypeGroupTransformFn);
      groups.enter().append("g").attr("class", "dataType").attr("transform", dataTypeGroupTransformFn);
      sources = groups.selectAll("path.source").data(Object, function(d) {
        return d.length ? d[0].sourceId : null;
      });
      sources.transition().duration(transitionMs).attr("d", areaPathGenerator).style("fill", areaFillFn);
      sources.enter().append("path").attr("class", "source").style("fill", areaFillFn).attr("d", areaPathGenerator).style("opacity", 1e-6).transition().duration(transitionMs).style("opacity", 1);
      sources.exit().transition().duration(transitionMs).style("opacity", 1e-6).remove();
      drawSumLine(drawData.sumLineData);
      superDraw();
    }
    function drawSumLine(sumLineData) {
      var transitionMs = parent.transitionMs();
      function sumDefined(d) {
        return d.y !== null;
      }
      function valueX(d) {
        return parent.x(d.date);
      }
      var svgLine = d3.svg.line().x(valueX).y(function(d) {
        return parent.y(d.y) - .5;
      }).interpolate("monotone").defined(sumDefined);
      var sumLine = svgSumLineGroup.selectAll("path").data([ sumLineData ]);
      sumLine.transition().duration(transitionMs).attr("d", svgLine);
      sumLine.enter().append("path").attr("d", d3.svg.line().x(valueX).y(function() {
        return parent.y(0) - .5;
      }).interpolate("monotone").defined(sumDefined)).transition().duration(transitionMs).attr("d", svgLine);
      sumLine.exit().transition().duration(transitionMs).style("opacity", 1e-6).remove();
    }
    /**
	 * Toggle showing the sum line, or get the current setting.
	 * 
	 * @param {boolean} [value] <em>true</em> to show the sum line, <em>false</em> to hide it
	 * @returns when used as a getter, the current setting
	 * @memberOf sn.chart.energyIOBarChart
	 * @preserve
	 */
    self.showSumLine = function(value) {
      if (!arguments.length) return !svgSumLineGroup.classed("off");
      var transitionMs = parent.transitionMs();
      svgSumLineGroup.style("opacity", value ? 1e-6 : 1).classed("off", false).transition().duration(transitionMs).style("opacity", value ? 1 : 1e-6).each("end", function() {
        d3.select(this).style("opacity", null).classed("off", !value);
      });
      return parent.me;
    };
    /**
	 * Get or set an array of group IDs to treat as negative group IDs, that appear below
	 * the X axis.
	 *
	 * @param {Array} [value] the array of group IDs to use
	 * @return {Array} when used as a getter, the list of group IDs currently used, otherwise this object
	 * @memberOf sn.chart.powerIOAreaChart
	 * @preserve
	 */
    self.negativeGroupIds = function(value) {
      if (!arguments.length) {
        return function() {
          var prop, result = [];
          for (prop in negativeGroupMap) {
            if (negativeGroupMap.hasOwnProperty(prop)) {
              result.pus(prop);
            }
          }
          return result;
        }();
      }
      negativeGroupMap = {};
      value.forEach(function(e) {
        negativeGroupMap[e] = true;
      });
      return parent.me;
    };
    parent.draw = draw;
    parent.normalizeDataTimeGaps(true);
    return self;
  };
  /**
 * @typedef sn.chart.seasonalDayOfWeekLineChartParameters
 * @type {sn.Configuration}
 * @property {number} [width=812] - desired width, in pixels, of the chart
 * @property {number} [height=300] - desired height, in pixels, of the chart
 * @property {number[]} [padding=[30, 0, 30, 30]] - padding to inset the chart by, in top, right, bottom, left order
 * @property {number} [transitionMs=600] - transition time
 * @property {number} [ruleOpacity] - the maximum opacity to render rules at, during transitions
 * @property {number} [vertRuleOpacity] - the maximum opacity to render rules at, during transitions
 * @property {string[]} [seasonColors] - array of color values for spring, summer, autumn, and winter
 * @property {sn.Configuration} excludeSources - the sources to exclude from the chart
 * @preserve
 */
  /**
 * An energy input and output chart designed to show consumption and generation data simultaneously
 * grouped by hours per day, per season.
 * 
 * @class
 * @param {string} containerSelector - the selector for the element to insert the chart into
 * @param {sn.chart.seasonalDayOfWeekLineChartParameters} [chartConfig] - the chart parameters
 * @returns {sn.chart.seasonalDayOfWeekLineChart}
 * @preserve
 */
  sn.chart.seasonalDayOfWeekLineChart = function(containerSelector, chartConfig) {
    var parent = sn.chart.baseGroupedSeasonalLineChart(containerSelector, chartConfig);
    var self = function() {
      var me = sn.util.copy(parent);
      Object.defineProperty(me, "version", {
        value: "1.0.0",
        enumerable: true,
        configurable: true
      });
      return me;
    }();
    parent.me = self;
    parent.timeKeyLabels([ "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" ]);
    parent.xAxisTicks = function() {
      return parent.x.domain();
    };
    parent.dateForTimeKey = function(offset) {
      return new Date(Date.UTC(2001, 0, 1 + offset));
    };
    parent.timeKeyForDate = function(date) {
      return (date.getUTCDay() + 6) % 7;
    };
    parent.timeKeyInterval = function() {
      return d3.time.day.utc;
    };
    return self;
  };
  /**
 * @typedef sn.chart.seasonalHourOfDayLineChart
 * @type {sn.Configuration}
 * @property {number} [width=812] - desired width, in pixels, of the chart
 * @property {number} [height=300] - desired height, in pixels, of the chart
 * @property {number[]} [padding=[30, 0, 30, 30]] - padding to inset the chart by, in top, right, bottom, left order
 * @property {number} [transitionMs=600] - transition time
 * @property {number} [ruleOpacity] - the maximum opacity to render rules at, during transitions
 * @property {number} [vertRuleOpacity] - the maximum opacity to render rules at, during transitions
 * @property {string[]} [seasonColors] - array of color values for spring, summer, autumn, and winter
 * @property {sn.Configuration} excludeSources - the sources to exclude from the chart
 * @preserve
 */
  /**
 * An energy input and output chart designed to show consumption and generation data simultaneously
 * grouped by hours per day, per season.
 * 
 * @class
 * @param {string} containerSelector - the selector for the element to insert the chart into
 * @param {sn.chart.seasonalHourOfDayLineChartParameters} [chartConfig] - the chart parameters
 * @returns {sn.chart.seasonalHourOfDayLineChart}
 * @preserve
 */
  sn.chart.seasonalHourOfDayLineChart = function(containerSelector, chartConfig) {
    var parent = sn.chart.baseGroupedSeasonalLineChart(containerSelector, chartConfig);
    var self = function() {
      var me = sn.util.copy(parent);
      Object.defineProperty(me, "version", {
        value: "1.0.0",
        enumerable: true,
        configurable: true
      });
      return me;
    }();
    parent.me = self;
    parent.timeKeyLabels([ "Midnight", "1am", "2am", "3am", "4am", "5am", "6am", "7am", "8am", "9am", "10am", "11am", "Noon", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm", "11pm" ]);
    parent.xAxisTicks = function() {
      return parent.x.domain().filter(function(d, i) {
        !d;
        return i % 2 === 0;
      });
    };
    parent.dateForTimeKey = function(offset) {
      return new Date(Date.UTC(2001, 0, 1, offset));
    };
    parent.timeKeyForDate = function(date) {
      return date.getUTCHours();
    };
    parent.timeKeyInterval = function() {
      return d3.time.hour.utc;
    };
    return self;
  };
  sn.runtime = {};
  sn.color.map = sn_color_map;
  sn.color.color = sn_color_color;
  /**
 * Return an array of colors for a set of unique keys, where the returned
 * array also contains associative properties for all key values to thier
 * corresponding color value.
 * 
 * <p>This is designed so the set of keys always map to the same color, 
 * even across charts where not all sources may be present.</p>
 * 
 * @preserve
 */
  function sn_color_map(fillColors, keys) {
    var colorRange = d3.scale.ordinal().range(fillColors);
    var colorData = keys.map(function(el, i) {
      return {
        source: el,
        color: colorRange(i)
      };
    });
    var i, len, sourceName;
    for (i = 0, len = colorData.length; i < len; i += 1) {
      sourceName = colorData[i].source;
      if (sourceName === "") {
        sourceName = "Main";
      }
      if (isNaN(Number(sourceName))) {
        colorData[sourceName] = colorData[i].color;
      }
    }
    return colorData;
  }
  /**
 * Use the configured runtime color map to turn a source into a color.
 * 
 * The {@code sn.runtime.colorData} property must be set to a color map object
 * as returned by {@link sn.colorMap}.
 * 
 * @param {object} d the data element, expected to contain a {@code source} property
 * @returns {string} color value
 * @preserve
 */
  function sn_color_color(d) {
    var s = Number(d.source);
    if (isNaN(s)) {
      return sn.runtime.colorData[d.source];
    }
    return sn.runtime.colorData.reduce(function(c, obj) {
      return obj.source === d.source ? obj.color : c;
    }, sn.runtime.colorData[0].color);
  }
  sn.color.sourceColorMapping = sn_color_sourceColorMapping;
  /**
 * @typedef sn.color.sourceColorMappingParameters
 * @type {object}
 * @property {function} [displayDataType] a function that accepts a data type and returns the display
 *                                        version of that data type
 * @property {function} [displayColor] a function that accepts a data type and a Colorbrewer color group
 * @property {boolean} [reverseColors] the Colorbrewer colors are reversed, unless this is set to {@code false}
 * @preserve
 */
  /**
 * @typedef sn.color.sourceColorMap
 * @type {object}
 * @property {array} sourceList An array of full source names for display purposes.
 * TODO
 * @preserve
 */
  /**
 * Create mapping of raw sources, grouped by data type, to potentially alternate names,
 * and assign Colorbrewer color values to each source.
 * 
 * The input {@code sourceMap} should contain a mapping of data types to associatd arrays
 * of sources. This is the format returned by {@link sn.availableDataRange}, on the 
 * {@code availableSourcesMap} property. For example:
 * 
 * <pre>
 * {
 *     'Consumption' : [ 'Main', 'Shed' ],
 *     'Power' : [ 'Main' ]
 * }
 * </pre>
 * 
 * The returned {@link sn.color.sourceColorMap} object contains 
 * 
 * <pre>
 * {
 *     sourceList : [ 'Consumption / Main', 'Consumption / Shed', 'Power / Main' ]
 *     displaySourceMap : {
 *         Consumption : {
 *             Main : 'Consumption / Main',
 *             Shed : 'Consumption / Shed'
 *         },
 *         Power : {
 *             Main : 'Power / Main'
 *         }
 *     },
 *     displaySourceObjects : {
 *         'Consumption / Main' : { dataType : 'Consumption', source : 'Main' },
 *         'Consumption / Shed' : { dataType : 'Consumption', source : 'Shed' },
 *         'Power / Main' : { dataType : 'Power', source : 'Main' }
 *     },
 *     reverseDisplaySourceMap : {
 *         Consumption : {
 *             'Consumption / Main' : 'Main',
 *             'Consumption / Shed' : 'Shed'
 *         },
 *         Power : {
 *             'Power / Main' : 'Main',
 *         }
 *     },
 *     colorList : [ 'red', 'light-red', 'green' ]
 *     colorMap : {
 *         'Consumption / Main' : 'red',
 *         'Consumption / Shed' : 'light-red',
 *         'Power / Main' : 'green'
 *     }
 * }
 * </pre>
 * 
 * @params {sn.color.sourceColorMappingParameters} [params] the parameters
 * @returns {sn.color.sourceColorMap}
 * @preserve
 */
  function sn_color_sourceColorMapping(sourceMap, params) {
    var p = params || {};
    var chartSourceMap = {};
    var dataType;
    var sourceList = [];
    var colorGroup;
    var sourceColors = [];
    var typeSourceList = [];
    var colorGroupIndex;
    var colorSlice;
    var result = {};
    var displayDataTypeFn;
    var displaySourceFn;
    var displayColorFn;
    var displayToSourceObjects = {};
    if (typeof p.displayDataType === "function") {
      displayDataTypeFn = p.displayDataType;
    } else {
      displayDataTypeFn = function(dataType) {
        return dataType === "Power" ? "Generation" : dataType;
      };
    }
    if (typeof p.displaySource === "function") {
      displaySourceFn = p.displaySource;
    } else {
      displaySourceFn = function(dataType, sourceId) {
        !dataType;
        return sourceId;
      };
    }
    if (typeof p.displayColor === "function") {
      displayColorFn = p.displayColor;
    } else {
      displayColorFn = function(dataType) {
        return dataType === "Consumption" ? colorbrewer.Blues : colorbrewer.Greens;
      };
    }
    function mapSources(dtype) {
      sourceMap[dtype].forEach(function(el) {
        var mappedSource;
        if (el === "" || el === "Main") {
          mappedSource = displayDataTypeFn(dtype);
        } else {
          mappedSource = displayDataTypeFn(dtype) + " / " + displaySourceFn(dtype, el);
        }
        chartSourceMap[dtype][el] = mappedSource;
        if (el === "Main") {
          chartSourceMap[dtype][""] = mappedSource;
        }
        typeSourceList.push(mappedSource);
        sourceList.push(mappedSource);
        displayToSourceObjects[mappedSource] = {
          dataType: dtype,
          source: el,
          display: mappedSource
        };
      });
    }
    for (dataType in sourceMap) {
      if (sourceMap.hasOwnProperty(dataType)) {
        chartSourceMap[dataType] = {};
        typeSourceList.length = 0;
        mapSources(dataType);
        colorGroup = displayColorFn(dataType);
        if (colorGroup[typeSourceList.length] === undefined) {
          colorGroupIndex = function() {
            var i;
            for (i = typeSourceList.length; i < 30; i += 1) {
              if (colorGroup[i] !== undefined) {
                return i;
              }
            }
            return 0;
          }();
        } else {
          colorGroupIndex = typeSourceList.length;
        }
        colorSlice = colorGroup[colorGroupIndex].slice(-typeSourceList.length);
        if (p.reverseColors !== false) {
          colorSlice.reverse();
        }
        sourceColors = sourceColors.concat(colorSlice);
      }
    }
    var reverseDisplaySourceMap = {};
    var sourceId, displayMap;
    for (dataType in chartSourceMap) {
      if (chartSourceMap.hasOwnProperty(dataType)) {
        reverseDisplaySourceMap[dataType] = {};
        displayMap = chartSourceMap[dataType];
        for (sourceId in displayMap) {
          if (displayMap.hasOwnProperty(sourceId)) {
            reverseDisplaySourceMap[displayMap[sourceId]] = sourceId;
          }
        }
      }
    }
    result.sourceList = sourceList;
    result.displaySourceMap = chartSourceMap;
    result.reverseDisplaySourceMap = reverseDisplaySourceMap;
    result.colorMap = sn.color.map(sourceColors, sourceList);
    result.displaySourceObjects = displayToSourceObjects;
    return result;
  }
  sn.counter = sn_counter;
  function sn_counter() {
    var c = 0;
    var obj = function() {
      return c;
    };
    obj.incrementAndGet = function() {
      c += 1;
      return c;
    };
    return obj;
  }
  /**
 * Flag indicating if the client supports touch events.
 * 
 * @returns {Boolean} <em>true</em> if have touch support
 * @preserve
 */
  sn.hasTouchSupport = function() {
    if (!(global && global.document)) {
      return false;
    }
    if ("createTouch" in global.document) {
      return true;
    }
    try {
      var event = global.document.createEvent("TouchEvent");
      return !!event.initTouchEvent;
    } catch (error) {
      return false;
    }
  }();
  /**
 * Names to use for user-interaction events.
 * 
 * <p>On non-touch devices these equate to <em>mousedown</em>, 
 * <em>mouseup</em>, etc. On touch-enabled devices these equate to
 * <em>touchstart</em>, <em>touchend</em>, etc.</p>
 *
 * @retunrs {Object} Mapping of start, move, end, cancel keys to associated event names.
 * @preserve
 */
  sn.tapEventNames = function() {
    return sn.hasTouchSupport ? {
      start: "touchstart",
      move: "touchmove",
      end: "touchend",
      cancel: "touchcancel",
      click: "touchstart",
      dblclick: "touchstart"
    } : {
      start: "mousedown",
      move: "mousemove",
      end: "mouseup",
      cancel: "touchcancel",
      click: "click",
      dblclick: "dblclick"
    };
  }();
  /**
 * Get the first user-interaction x,y coordinates relative to a given container element.
 *
 * @param {Node} container - A DOM container node to get the relative coordinates for.
 * @returns {Array} An array like <code>[x, y]</code> or <code>undefined</code> if not known.
 * @preserve
 */
  sn.tapCoordinates = function(container) {
    var coordinates;
    if (sn.hasTouchSupport) {
      coordinates = d3.touches(container);
      return coordinates && coordinates.length > 0 ? coordinates[0] : undefined;
    }
    return d3.mouse(container);
  };
  sn.format.displayScaleForValue = sn_format_displayScaleForValue;
  sn.format.displayUnitsForScale = sn_format_displayUnitsForScale;
  /**
 * Get an appropriate display scale for a given value. This will return values suitable
 * for passing to {@link sn.format.displayUnitsForScale}.
 * 
 * @param {Number} value - The value, for example the maximum value in a range of values, 
 *                         to get a display scale factor for.
 * @return {Number} A display scale factor.
 * @since 0.0.7
 * @preserve
 */
  function sn_format_displayScaleForValue(value) {
    var result = 1, num = Number(value);
    if (isNaN(num) === false) {
      if (value >= 1e9) {
        result = 1e9;
      } else if (value >= 1e6) {
        result = 1e6;
      } else if (value >= 1e3) {
        result = 1e3;
      }
    }
    return result;
  }
  /**
 * Get an appropriate display unit for a given base unit and scale factor.
 *
 * @param {String} baseUnit - The base unit, for example <b>W</b> or <b>Wh</b>.
 * @param {Number} scale - The unit scale, which must be a recognized SI scale, such 
 *                         as <b>1000</b> for <b>k</b>.
 * @return {String} A display unit value.
 * @since 0.0.7
 * @preserve
 */
  function sn_format_displayUnitsForScale(baseUnit, scale) {
    return (scale === 1e9 ? "G" : scale === 1e6 ? "M" : scale === 1e3 ? "k" : "") + baseUnit;
  }
  sn.format.fmt = sn_format_fmt;
  /**
 * Helper to be able to use placeholders even on iOS, where console.log doesn't support them.
 * 
 * @param {String} Message template.
 * @param {Object[]} Optional parameters to replace in the message.
 * @preserve
 */
  function sn_format_fmt() {
    if (!arguments.length) {
      return;
    }
    var i = 0, formatted = arguments[i], regexp, replaceValue;
    for (i = 1; i < arguments.length; i += 1) {
      regexp = new RegExp("\\{" + (i - 1) + "\\}", "gi");
      replaceValue = arguments[i];
      if (replaceValue instanceof Date) {
        replaceValue = replaceValue.getUTCHours() === 0 && replaceValue.getMinutes() === 0 ? sn.format.dateFormat(replaceValue) : sn.format.dateTimeFormatURL(replaceValue);
      }
      formatted = formatted.replace(regexp, replaceValue);
    }
    return formatted;
  }
  sn.net.encodeURLQueryTerms = sn_net_encodeURLQueryTerms;
  /**
 * Encode the properties of an object as a URL query string.
 * 
 * <p>If an object property has an array value, multiple URL parameters will be encoded for that property.</p>
 * 
 * @param {Object} an object to encode as URL parameters
 * @return {String} the encoded query parameters
 * @preserve
 */
  function sn_net_encodeURLQueryTerms(parameters) {
    var result = "", prop, val, i, len;
    function handleValue(k, v) {
      if (result.length) {
        result += "&";
      }
      result += encodeURIComponent(k) + "=" + encodeURIComponent(v);
    }
    if (parameters) {
      for (prop in parameters) {
        if (parameters.hasOwnProperty(prop)) {
          val = parameters[prop];
          if (Array.isArray(val)) {
            for (i = 0, len = val.length; i < len; i++) {
              handleValue(prop, val[i]);
            }
          } else {
            handleValue(prop, val);
          }
        }
      }
    }
    return result;
  }
  sn.net.securityHelper = function() {
    "use strict";
    var that = {
      version: "1.1.0"
    };
    var cred = {
      token: undefined,
      secret: undefined
    };
    Object.defineProperties(that, {
      hasTokenCredentials: {
        value: hasTokenCredentials
      },
      token: {
        value: token
      },
      secret: {
        value: secret
      },
      hasSecret: {
        value: hasSecret
      },
      clearSecret: {
        value: clearSecret
      },
      generateAuthorizationHeaderValue: {
        value: generateAuthorizationHeaderValue
      },
      parseURLQueryTerms: {
        value: parseURLQueryTerms
      },
      authURLPath: {
        value: authURLPath
      },
      json: {
        value: json
      }
    });
    /**
	 * Return <em>true</em> if both a token and a secret have been set, <em>false</em> otherwise.
	 *
	 * @return {Boolean} <em>true</em> if a token and secret have been set.
	 * @preserve
	 */
    function hasTokenCredentials() {
      return cred.token && cred.token.length > 0 && cred.secret && cred.secret.length > 0;
    }
    /**
	 * Get or set the in-memory security token to use.
	 *
	 * @param {String} [value] The value to set, or <code>null</code> to clear.
	 * @returs When used as a getter, the current token value, otherwise this object.
	 * @preserve
	 */
    function token(value) {
      if (!arguments.length) return cred.token;
      cred.token = value && value.length > 0 ? value : undefined;
      return that;
    }
    /**
	 * Set the in-memory security token secret to use.
	 *
	 * @param {String} [value] The value to set.
	 * @returns This object.
	 * @preserve
	 */
    function secret(value) {
      if (arguments.length) {
        cred.secret = value;
      }
      return that;
    }
    /**
	 * Return <em>true</em> if a secret has been set, <em>false</em> otherwise.
	 *
	 * @return {Boolean} <em>true</em> if a secret has been set.
	 * @preserve
	 */
    function hasSecret() {
      return cred.secret && cred.secret.length > 0;
    }
    /**
	 * Clear the in-memory secret.
	 * 
	 * @returns This object.
	 * @preserve
	 */
    function clearSecret() {
      cred.secret = undefined;
      return that;
    }
    function shouldIncludeContentMD5(contentType) {
      return contentType !== null && contentType.indexOf("application/x-www-form-urlencoded") < 0;
    }
    /**
	 * Generate the authorization header value for a set of request parameters.
	 * 
	 * <p>This returns just the authorization header value, without the scheme. For 
	 * example this might return a value like 
	 * <code>a09sjds09wu9wjsd9uya:6U2NcYHz8jaYhPd5Xr07KmfZbnw=</code>. To use
	 * as a valid <code>Authorization</code> header, you must still prefix the
	 * returned value with <code>SolarNetworkWS</code> (with a space between
	 * that prefix and the associated value).</p>
	 * 
	 * @param {Object} params the request parameters
	 * @param {String} params.method the HTTP request method
	 * @param {String} params.data the HTTP request body
	 * @param {String} params.date the formatted HTTP request date
	 * @param {String} params.path the SolarNetworkWS canonicalized path value
	 * @param {String} params.token the authentication token
	 * @param {String} params.secret the authentication token secret
	 * @return {String} the authorization header value
	 * @preserve
	 */
    function generateAuthorizationHeaderValue(params) {
      var msg = (params.method === undefined ? "GET" : params.method.toUpperCase()) + "\n" + (params.data !== undefined && shouldIncludeContentMD5(params.contentType) ? CryptoJS.MD5(params.data) : "") + "\n" + (params.contentType === undefined ? "" : params.contentType) + "\n" + params.date + "\n" + params.path;
      var hash = CryptoJS.HmacSHA1(msg, params.secret || "");
      var authHeader = params.token + ":" + CryptoJS.enc.Base64.stringify(hash);
      return authHeader;
    }
    /**
	 * Parse the query portion of a URL string, and return a parameter object for the
	 * parsed key/value pairs.
	 * 
	 * <p>Multiple parameters of the same name are <b>not</b> supported.</p>
	 * 
	 * @param {String} search the query portion of the URL, which may optionally include 
	 *                        the leading '?' character
	 * @return {Object} the parsed query parameters, as a parameter object
	 * @preserve
	 */
    function parseURLQueryTerms(search) {
      var params = {};
      var pairs;
      var pair;
      var i, len;
      if (search !== undefined && search.length > 0) {
        if (search.match(/^\?/)) {
          search = search.substring(1);
        }
        pairs = search.split("&");
        for (i = 0, len = pairs.length; i < len; i++) {
          pair = pairs[i].split("=", 2);
          if (pair.length === 2) {
            params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
          }
        }
      }
      return params;
    }
    /**
	 * Generate the SolarNetworkWS path required by the authorization header value.
	 * 
	 * <p>This method will parse the given URL and then apply the path canonicalization
	 * rules defined by the SolarNetworkWS scheme.</p>
	 * 
	 * @param {String} url the request URL
	 * @return {String} path the canonicalized path value to use in the SolarNetworkWS 
	 *                       authorization header value
	 * @preserve
	 */
    function authURLPath(url, data) {
      var a = document.createElement("a");
      a.href = url;
      var path = a.pathname;
      var params = parseURLQueryTerms(data === undefined ? a.search : data);
      var sortedKeys = [], key = undefined;
      var i, len;
      var first = true;
      if (path.length > 0 && path.charAt(0) !== "/") {
        path = "/" + path;
      }
      for (key in params) {
        sortedKeys.push(key);
      }
      sortedKeys.sort();
      if (sortedKeys.length > 0) {
        path += "?";
        for (i = 0, len = sortedKeys.length; i < len; i++) {
          if (first) {
            first = false;
          } else {
            path += "&";
          }
          path += sortedKeys[i];
          path += "=";
          path += params[sortedKeys[i]];
        }
      }
      return path;
    }
    /**
	 * Invoke the web service URL, adding the required SolarNetworkWS authorization
	 * headers to the request.
	 * 
	 * <p>This method will construct the <code>X-SN-Date</code> and <code>Authorization</code>
	 * header values needed to invoke the web service. It returns a d3 XHR object,
	 * so you can call <code>.on()</code> on that to handle the response, unless a callback
	 * parameter is specified, then the request is issued immediately, passing the 
	 * <code>method</code>, <code>data</code>, and <code>callback</code> parameters
	 * to <code>xhr.send()</code>.</p>
	 * 
	 * @param {String} url the web service URL to invoke
	 * @param {String} method the HTTP method to use; e.g. GET or POST
	 * @param {String} [data] the data to upload
	 * @param {String} [contentType] the content type of the data
	 * @param {Function} [callback] if defined, a d3 callback function to handle the response JSON with
	 * @return {Object} d3 XHR object
	 * @preserve
	 */
    function json(url, method, data, contentType, callback) {
      var requestUrl = url;
      if (arguments.length > 0) {
        if (arguments.length < 5 && typeof arguments[arguments.length - 1] === "function") {
          callback = arguments[arguments.length - 1];
        }
        if (typeof method !== "string") {
          method = undefined;
        }
        if (typeof data !== "string") {
          data = undefined;
        }
        if (typeof contentType !== "string") {
          contentType = undefined;
        }
      }
      method = method === undefined ? "GET" : method.toUpperCase();
      if (method === "POST" || method === "PUT") {
        if (!data) {
          (function() {
            var queryIndex = url.indexOf("?");
            if (queryIndex !== -1) {
              if (queryIndex + 1 < url.length - 1) {
                data = url.substring(queryIndex + 1);
              }
              requestUrl = url.substring(0, queryIndex);
              contentType = "application/x-www-form-urlencoded; charset=UTF-8";
            }
          })();
        }
      }
      var xhr = d3.json(requestUrl);
      if (contentType !== undefined) {
        xhr.header("Content-Type", contentType);
      }
      xhr.on("beforesend", function(request) {
        var date = new Date().toUTCString();
        var path = authURLPath(url, contentType !== undefined && contentType.indexOf("application/x-www-form-urlencoded") === 0 ? data : undefined);
        var auth = generateAuthorizationHeaderValue({
          method: method,
          date: date,
          path: path,
          token: cred.token,
          secret: cred.secret,
          data: data,
          contentType: contentType
        });
        if (data !== undefined && shouldIncludeContentMD5(contentType)) {
          request.setRequestHeader("Content-MD5", CryptoJS.MD5(data));
        }
        request.setRequestHeader("X-SN-Date", date);
        request.setRequestHeader("Authorization", "SolarNetworkWS " + auth);
      });
      xhr.on("load.internal", function() {});
      if (callback !== undefined) {
        xhr.send(method, data, callback);
      }
      return xhr;
    }
    return that;
  };
  sn.net.sec = sn.net.securityHelper();
  /**
 * Set the display units within a d3 selection based on a scale. This method takes a 
 * base unit and adds an SI prefix based on the provided scale. It replaces the text
 * content of any DOM node with a <code>unit</code> class that is a child of the given
 * selection.
 * 
 * @param {object} selection - A d3 selection that serves as the root search context.
 * @param {string} baseUnit - The base unit, for example <b>W</b> or <b>Wh</b>.
 * @param {number} scale - The unit scale, which must be a recognized SI scale, such 
 *                         as <b>1000</b> for <b>k</b>.
 * @param {string} unitKind - Optional text to replace all occurrences of <code>.unit-kind</code>
 *                            elements with.
 * @since 0.0.4
 * @preserve
 */
  sn.ui.adjustDisplayUnits = function(selection, baseUnit, scale, unitKind) {
    var unit = sn.format.displayUnitsForScale(baseUnit, scale);
    selection.selectAll(".unit").text(unit);
    if (unitKind !== undefined) {
      selection.selectAll(".unit-kind").text(unitKind);
    }
  };
  sn.ui.colorDataLegendTable = sn_ui_colorDataLegendTable;
  function sn_ui_colorDataLegendTable(containerSelector, colorData, clickHandler, labelRenderer) {
    var table = d3.select(containerSelector).selectAll("table").data([ 0 ]);
    table.enter().append("table").append("tbody");
    var labelTableRows = table.select("tbody").selectAll("tr").data(colorData);
    var newLabelTableRows = labelTableRows.enter().append("tr");
    labelTableRows.exit().remove();
    if (clickHandler) {
      newLabelTableRows.on("click", clickHandler).classed("clickable", true);
    }
    if (labelRenderer === undefined) {
      labelRenderer = function(s) {
        s.text(Object);
      };
    }
    var swatches = labelTableRows.selectAll("td.swatch").data(function(d) {
      return [ d.color ];
    }).style("background-color", Object);
    swatches.enter().append("td").attr("class", "swatch").style("background-color", Object);
    swatches.exit().remove();
    var descriptions = labelTableRows.selectAll("td.desc").data(function(d) {
      return [ d.source === "" ? "Main" : d.source ];
    }).call(labelRenderer);
    descriptions.enter().append("td").attr("class", "desc").call(labelRenderer);
    descriptions.exit().remove();
  }
  /**
 * Render a number in the style of an odometer.
 *
 * @preserve
 */
  sn.ui.flipCounter = function(container, configuration) {
    var that = {
      version: "1.0.0"
    };
    var config = {
      flipperWidth: 34,
      transitionMs: 200,
      format: d3.format("07,g"),
      animate: true
    };
    var root = undefined;
    var characters = [ "0" ];
    function configure(configuration) {
      var prop = undefined;
      for (prop in configuration) {
        config[prop] = configuration[prop];
      }
    }
    that.configure = configure;
    function render(startingValue) {
      root = d3.select(container).classed("flipCounter", true);
      update(startingValue === undefined ? 0 : startingValue);
    }
    that.render = render;
    function flipperOffset(d, i) {
      !d;
      return config.flipperWidth * (characters.length - 1) - config.flipperWidth * i + "px";
    }
    function update(newValue) {
      var str = config.format(newValue);
      characters = function() {
        var result = [];
        var i, len;
        for (i = 0, len = str.length; i < len; i++) {
          result.push(str.charAt(i));
        }
        return result.reverse();
      }();
      var flippers = root.selectAll("span.flipper").data(characters);
      flippers.style("left", flipperOffset).each(function(d) {
        var me = d3.select(this);
        var flipped = config.animate === true ? me.classed("flipped") : false;
        var nextFace = me.select(flipped || config.animate !== true ? "span.a" : "span.b");
        var currValue = me.select(flipped ? "span.b" : "span.a").text();
        if (currValue !== d) {
          nextFace.select("span.value").text(d);
          if (config.animate) {
            me.classed("flipped", !flipped);
          }
        }
      });
      flippers.enter().append("span").attr("class", "flipper").style("left", flipperOffset).html(function(d) {
        return (config.animate ? '<span class="face b"><span class="value">b</span></span>' : "") + '<span class="face a"><span class="value">' + d + "</span></span>";
      });
      flippers.exit().remove();
    }
    that.update = update;
    configure(configuration);
    return that;
  };
  /**
 * Simple implementation of a 2D CSS transform matrix.
 * 
 * @class
 * @returns {sn.ui.Matrix}
 * @preserve
 */
  sn.ui.Matrix = function() {
    var supportFloat32Array = "Float32Array" in window;
    this.matrix = function() {
      var result;
      if (supportFloat32Array) {
        result = new Float32Array(6);
        result[0] = 1;
        result[3] = 1;
      } else {
        result = [ 1, 0, 0, 1, 0, 0 ];
      }
      return result;
    }();
    this.support = {
      use3d: this.supportDefaults.use3d,
      tProp: this.supportDefaults.tProp,
      trProp: this.supportDefaults.trProp,
      trTransform: this.supportDefaults.trTransform,
      trEndEvent: this.supportDefaults.trEndEvent
    };
  };
  sn.ui.Matrix.prototype = {
    constructor: sn.ui.Matrix,
    supportDefaults: function() {
      var divStyle = document.createElement("div").style;
      var suffix = "Transform";
      var testProperties = [ "Webkit" + suffix, "O" + suffix, "ms" + suffix, "Moz" + suffix ];
      var eventProperties = [ "webkitTransitionEnd", "oTransitionEnd", "transitionend", "transitionend" ];
      var transitionProperties = [ "WebkitTransition", "OTransition", "transition", "MozTransition" ];
      var transitionTransform = [ "-webkit-transform", "-o-transform", "transform", "-moz-transform" ];
      var tProp = "Transform", trProp = "Transition", trTransform = "transform", trEndEvent = "transitionEnd";
      var i = testProperties.length;
      while (i--) {
        if (testProperties[i] in divStyle) {
          tProp = testProperties[i];
          trProp = transitionProperties[i];
          trTransform = transitionTransform[i];
          trEndEvent = eventProperties[i];
          break;
        }
      }
      return {
        use3d: window.devicePixelRatio === undefined ? false : window.devicePixelRatio > 1,
        tProp: tProp,
        trProp: trProp,
        trTransform: trTransform,
        trEndEvent: trEndEvent
      };
    }(),
    /**
	 * Generate a CSS matrix3d() function string from the current matrix.
	 * 
	 * @returns {String} the CSS matrix3d() function
	 * @preserve
	 */
    toMatrix3D: function() {
      return "matrix3d(" + this.matrix[0] + "," + this.matrix[1] + ",0,0," + this.matrix[2] + "," + this.matrix[3] + ",0,0," + "0,0,1,0," + this.matrix[4] + "," + this.matrix[5] + ",0,1)";
    },
    /**
	 * Generate a CSS matrix() function string from the current matrix.
	 * 
	 * @returns {String} the CSS matrix() function
	 * @preserve
	 */
    toMatrix2D: function() {
      return "matrix(" + this.matrix[0] + "," + this.matrix[1] + "," + this.matrix[2] + "," + this.matrix[3] + "," + this.matrix[4] + "," + this.matrix[5] + ")";
    },
    /**
	 * Set the z-axis rotation of the matrix.
	 * 
	 * @param {Number} angle the rotation angle, in radians
	 * @preserve
	 */
    setRotation: function(angle) {
      var a = Math.cos(angle);
      var b = Math.sin(angle);
      this.matrix[0] = this.matrix[3] = a;
      this.matrix[1] = 0 - b;
      this.matrix[2] = b;
    },
    /**
	 * Set a uniform x,y scaling factor of the matrix.
	 * @param {Number} s the scale factor
	 * @preserve
	 */
    setScale: function(s) {
      this.matrix[0] = s;
      this.matrix[3] = s;
    },
    /**
	 * Set the current 2D translate of the matrix.
	 * 
	 * @param {Number} x the x offset
	 * @param {Number} y the y offset
	 * @preserve
	 */
    setTranslation: function(x, y) {
      this.matrix[4] = x;
      this.matrix[5] = y;
    },
    /**
	 * Append a 2D translate to the current matrix.
	 * 
	 * @param {Number} x the x offset
	 * @param {Number} y the y offset
	 * @preserve
	 */
    translate: function(x, y) {
      this.matrix[4] += x;
      this.matrix[5] += y;
    },
    /**
	 * Get the current 2D translation value.
	 * 
	 * @returns {Object} object with x,y Number properties
	 * @preserve
	 */
    getTranslation: function() {
      return {
        x: this.matrix[4],
        y: this.matrix[5]
      };
    },
    /**
	 * Get the 2D distance between a location and this matrix's translation.
	 * 
	 * @param location a location object, with x,y Number properties
	 * @returns {Number} the calculated distance
	 * @preserve
	 */
    getDistanceFrom: function(location) {
      return Math.sqrt(Math.pow(location.x - this.matrix[4], 2), Math.pow(location.y - this.matrix[5], 2));
    },
    /**
	 * Apply the matrix transform to an element.
	 * 
	 * <p>If {@code support.use3d} is <em>true</em>, the {@link #toMatrix3D()} transform 
	 * is used, otherwise {@link #toMatrix2D()} is used. Found that legibility of 
	 * text was too blurry on older displays when 3D transform was applied,
	 * but 3D transform provide better performance on hi-res displays.</p>
	 * 
	 * @param {Element} elm the element to apply the transform to
	 * @preserve
	 */
    apply: function(elm) {
      var m = this.support.use3d === true ? this.toMatrix3D() : this.toMatrix2D();
      elm.style[this.support.tProp] = m;
    },
    /**
	 * Apply a one-time animation callback listener.
	 * 
	 * @param elm the element to add the one-time listener to
	 * @param finished
	 * @preserve
	 */
    animateListen: function(elm, finished) {
      var listener = undefined;
      var self = this;
      listener = function(event) {
        if (event.target === elm) {
          elm.removeEventListener(self.support.trEndEvent, listener, false);
          finished.apply(elm);
        }
      };
      elm.addEventListener(self.support.trEndEvent, listener, false);
    },
    /**
	 * Apply the matrix transform to an element, with an "ease out" transition.
	 * 
	 * <p>Calls {@link #apply(elm)} internally.</p>
	 * 
	 * @param {Element} elm the element to apply the transform to
	 * @param {String} timing the CSS timing function to use
	 * @param {String} duration the CSS duration to use
	 * @param {Function} finished an optional callback function to execute when 
	 * the animation completes
	 * @preserve
	 */
    animate: function(elm, timing, duration, finished) {
      var self = this;
      this.animateListen(elm, function() {
        elm.style[self.support.trProp] = "";
        if (finished !== undefined) {
          finished.apply(elm);
        }
      });
      var cssValue = this.support.trTransform + " " + (duration !== undefined ? duration : "0.3s") + " " + (timing !== undefined ? timing : "ease-out");
      elm.style[this.support.trProp] = cssValue;
      this.apply(elm);
    },
    /**
	 * Apply the matrix transform to an element, with an "ease out" transition.
	 * 
	 * <p>Calls {@link #animate(elm)} internally.</p>
	 * 
	 * @param {Element} elm the element to apply the transform to
	 * @param {Function} finished an optional callback function to execute when 
	 * the animation completes
	 * @preserve
	 */
    easeOut: function(elm, finished) {
      this.animate(elm, "ease-out", undefined, finished);
    },
    /**
	 * Apply the matrix transform to an element, with an "ease in" transition.
	 * 
	 * <p>Calls {@link #animate(elm)} internally.</p>
	 * 
	 * @param {Element} elm the element to apply the transform to
	 * @param {Function} finished an optional callback function to execute when 
	 * the animation completes
	 * @preserve
	 */
    easeIn: function(elm, finished) {
      this.animate(elm, "ease-in", undefined, finished);
    },
    /**
	 * Test if 3D matrix transforms are being used.
	 * 
	 * @returns {Boolean} <em>true</em> if 3D transformations matrix are being used, 
	 *                    <em>false</em> if 2D transformations are being used
	 * @preserve
	 */
    isUse3d: function() {
      return this.support.use3d === true;
    },
    /**
	 * Set which transformation matrix style should be used: 3D or 2D.
	 * 
	 * @param {Boolean} value <em>true</em> if 3D transformations matrix should be used, 
	 *                    <em>false</em> if 2D transformations should be used
	 * @preserve
	 */
    setUse3d: function(value) {
      this.support.use3d = value === true;
    }
  };
  if (typeof define === "function" && define.amd) {
    define(this.sn = sn);
  } else if (typeof module === "object" && module.exports) {
    module.exports = sn;
  } else {
    global.sn = sn;
  }
}();
