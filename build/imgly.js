;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],2:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/vendor/perf.coffee",__dirname="/vendor";var Perf;

Perf = (function() {
  function Perf(name, options) {
    var _base, _base1, _base2;
    this.name = name;
    this.options = options != null ? options : {};
    if ((_base = this.options).good == null) {
      _base.good = 100;
    }
    if ((_base1 = this.options).bad == null) {
      _base1.bad = 500;
    }
    if ((_base2 = this.options).debug == null) {
      _base2.debug = true;
    }
    this.started = false;
  }

  Perf.prototype.start = function() {
    if (this.started || !this.options.debug) {
      return;
    }
    this.start = +new Date();
    return this.started = true;
  };

  Perf.prototype.stop = function(printLine) {
    var background, color, duration, end, message;
    if (!this.started || !this.options.debug) {
      return;
    }
    end = +new Date();
    duration = end - this.start;
    if (this.name != null) {
      message = this.name + ' took';
    } else {
      message = 'Code execution time:';
    }
    if (typeof window !== "undefined" && window !== null) {
      if (duration < this.options.good) {
        background = 'darkgreen';
        color = 'white';
      } else if (duration > this.options.good && duration < this.options.bad) {
        background = 'orange';
        color = 'black';
      } else {
        background = 'darkred';
        color = 'white';
      }
      console.log('%c perf %c ' + message + ' %c ' + duration.toFixed(2) + 'ms ', 'background: #222; color: #bada55', '', 'background: ' + background + '; color: ' + color);
    } else {
      console.log('[perf] ' + message + ' ' + duration.toFixed(2) + 'ms');
    }
    this.started = false;
    if (printLine && (typeof window !== "undefined" && window !== null)) {
      return console.log('%c perf %c -- END --                                                                          ', 'background: #222; color: #bada55', 'background: #222; color: #ffffff');
    }
  };

  return Perf;

})();

module.exports = Perf;


},{"__browserify_Buffer":3,"__browserify_process":1}],3:[function(require,module,exports){
require=(function(e,t,n,r){function i(r){if(!n[r]){if(!t[r]){if(e)return e(r);throw new Error("Cannot find module '"+r+"'")}var s=n[r]={exports:{}};t[r][0](function(e){var n=t[r][1][e];return i(n?n:e)},s,s.exports)}return n[r].exports}for(var s=0;s<r.length;s++)i(r[s]);return i})(typeof require!=="undefined"&&require,{1:[function(require,module,exports){
// UTILITY
var util = require('util');
var Buffer = require("buffer").Buffer;
var pSlice = Array.prototype.slice;

function objectKeys(object) {
  if (Object.keys) return Object.keys(object);
  var result = [];
  for (var name in object) {
    if (Object.prototype.hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.message = options.message;
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
};
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (value === undefined) {
    return '' + value;
  }
  if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (typeof value === 'function' || value instanceof RegExp) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (typeof s == 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

assert.AssertionError.prototype.toString = function() {
  if (this.message) {
    return [this.name + ':', this.message].join(' ');
  } else {
    return [
      this.name + ':',
      truncate(JSON.stringify(this.actual, replacer), 128),
      this.operator,
      truncate(JSON.stringify(this.expected, replacer), 128)
    ].join(' ');
  }
};

// assert.AssertionError instanceof Error

assert.AssertionError.__proto__ = Error.prototype;

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!!!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (typeof actual != 'object' && typeof expected != 'object') {
    return actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (expected instanceof RegExp) {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail('Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail('Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

},{"util":2,"buffer":3}],2:[function(require,module,exports){
var events = require('events');

exports.isArray = isArray;
exports.isDate = function(obj){return Object.prototype.toString.call(obj) === '[object Date]'};
exports.isRegExp = function(obj){return Object.prototype.toString.call(obj) === '[object RegExp]'};


exports.print = function () {};
exports.puts = function () {};
exports.debug = function() {};

exports.inspect = function(obj, showHidden, depth, colors) {
  var seen = [];

  var stylize = function(str, styleType) {
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    var styles =
        { 'bold' : [1, 22],
          'italic' : [3, 23],
          'underline' : [4, 24],
          'inverse' : [7, 27],
          'white' : [37, 39],
          'grey' : [90, 39],
          'black' : [30, 39],
          'blue' : [34, 39],
          'cyan' : [36, 39],
          'green' : [32, 39],
          'magenta' : [35, 39],
          'red' : [31, 39],
          'yellow' : [33, 39] };

    var style =
        { 'special': 'cyan',
          'number': 'blue',
          'boolean': 'yellow',
          'undefined': 'grey',
          'null': 'bold',
          'string': 'green',
          'date': 'magenta',
          // "name": intentionally not styling
          'regexp': 'red' }[styleType];

    if (style) {
      return '\033[' + styles[style][0] + 'm' + str +
             '\033[' + styles[style][1] + 'm';
    } else {
      return str;
    }
  };
  if (! colors) {
    stylize = function(str, styleType) { return str; };
  }

  function format(value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (value && typeof value.inspect === 'function' &&
        // Filter out the util module, it's inspect function is special
        value !== exports &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      return value.inspect(recurseTimes);
    }

    // Primitive types cannot have properties
    switch (typeof value) {
      case 'undefined':
        return stylize('undefined', 'undefined');

      case 'string':
        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                 .replace(/'/g, "\\'")
                                                 .replace(/\\"/g, '"') + '\'';
        return stylize(simple, 'string');

      case 'number':
        return stylize('' + value, 'number');

      case 'boolean':
        return stylize('' + value, 'boolean');
    }
    // For some reason typeof null is "object", so special case here.
    if (value === null) {
      return stylize('null', 'null');
    }

    // Look up the keys of the object.
    var visible_keys = Object_keys(value);
    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;

    // Functions without properties can be shortcutted.
    if (typeof value === 'function' && keys.length === 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        var name = value.name ? ': ' + value.name : '';
        return stylize('[Function' + name + ']', 'special');
      }
    }

    // Dates without properties can be shortcutted
    if (isDate(value) && keys.length === 0) {
      return stylize(value.toUTCString(), 'date');
    }

    var base, type, braces;
    // Determine the object type
    if (isArray(value)) {
      type = 'Array';
      braces = ['[', ']'];
    } else {
      type = 'Object';
      braces = ['{', '}'];
    }

    // Make functions say that they are functions
    if (typeof value === 'function') {
      var n = value.name ? ': ' + value.name : '';
      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
    } else {
      base = '';
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + value.toUTCString();
    }

    if (keys.length === 0) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        return stylize('[Object]', 'special');
      }
    }

    seen.push(value);

    var output = keys.map(function(key) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Getter/Setter]', 'special');
          } else {
            str = stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Setter]', 'special');
          }
        }
      }
      if (visible_keys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = format(value[key]);
          } else {
            str = format(value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (isArray(value)) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (type === 'Array' && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    });

    seen.pop();

    var numLinesEst = 0;
    var length = output.reduce(function(prev, cur) {
      numLinesEst++;
      if (cur.indexOf('\n') >= 0) numLinesEst++;
      return prev + cur.length + 1;
    }, 0);

    if (length > 50) {
      output = braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];

    } else {
      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    return output;
  }
  return format(obj, (typeof depth === 'undefined' ? 2 : depth));
};


function isArray(ar) {
  return ar instanceof Array ||
         Array.isArray(ar) ||
         (ar && ar !== Object.prototype && isArray(ar.__proto__));
}


function isRegExp(re) {
  return re instanceof RegExp ||
    (typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]');
}


function isDate(d) {
  if (d instanceof Date) return true;
  if (typeof d !== 'object') return false;
  var properties = Date.prototype && Object_getOwnPropertyNames(Date.prototype);
  var proto = d.__proto__ && Object_getOwnPropertyNames(d.__proto__);
  return JSON.stringify(proto) === JSON.stringify(properties);
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

exports.log = function (msg) {};

exports.pump = null;

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {
    var res = [];
    for (var key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) res.push(key);
    }
    return res;
};

var Object_create = Object.create || function (prototype, properties) {
    // from es5-shim
    var object;
    if (prototype === null) {
        object = { '__proto__' : null };
    }
    else {
        if (typeof prototype !== 'object') {
            throw new TypeError(
                'typeof prototype[' + (typeof prototype) + '] != \'object\''
            );
        }
        var Type = function () {};
        Type.prototype = prototype;
        object = new Type();
        object.__proto__ = prototype;
    }
    if (typeof properties !== 'undefined' && Object.defineProperties) {
        Object.defineProperties(object, properties);
    }
    return object;
};

exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object_create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(exports.inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for(var x = args[i]; i < len; x = args[++i]){
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + exports.inspect(x);
    }
  }
  return str;
};

},{"events":4}],5:[function(require,module,exports){
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isBE ? 0 : (nBytes - 1),
      d = isBE ? 1 : -1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isBE ? (nBytes - 1) : 0,
      d = isBE ? -1 : 1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],6:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],4:[function(require,module,exports){
(function(process){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

})(require("__browserify_process"))
},{"__browserify_process":6}],"buffer-browserify":[function(require,module,exports){
module.exports=require('q9TxCC');
},{}],"q9TxCC":[function(require,module,exports){
function SlowBuffer (size) {
    this.length = size;
};

var assert = require('assert');

exports.INSPECT_MAX_BYTES = 50;


function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }

  return byteArray;
}

function asciiToBytes(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++ )
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push( str.charCodeAt(i) & 0xFF );

  return byteArray;
}

function base64ToBytes(str) {
  return require("base64-js").toByteArray(str);
}

SlowBuffer.byteLength = function (str, encoding) {
  switch (encoding || "utf8") {
    case 'hex':
      return str.length / 2;

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length;

    case 'ascii':
    case 'binary':
      return str.length;

    case 'base64':
      return base64ToBytes(str).length;

    default:
      throw new Error('Unknown encoding');
  }
};

function blitBuffer(src, dst, offset, length) {
  var pos, i = 0;
  while (i < length) {
    if ((i+offset >= dst.length) || (i >= src.length))
      break;

    dst[i + offset] = src[i];
    i++;
  }
  return i;
}

SlowBuffer.prototype.utf8Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.asciiWrite = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
};

SlowBuffer.prototype.binaryWrite = SlowBuffer.prototype.asciiWrite;

SlowBuffer.prototype.base64Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.base64Slice = function (start, end) {
  var bytes = Array.prototype.slice.apply(this, arguments)
  return require("base64-js").fromByteArray(bytes);
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
  }
}

SlowBuffer.prototype.utf8Slice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var res = "";
  var tmp = "";
  var i = 0;
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
      tmp = "";
    } else
      tmp += "%" + bytes[i].toString(16);

    i++;
  }

  return res + decodeUtf8Char(tmp);
}

SlowBuffer.prototype.asciiSlice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var ret = "";
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i]);
  return ret;
}

SlowBuffer.prototype.binarySlice = SlowBuffer.prototype.asciiSlice;

SlowBuffer.prototype.inspect = function() {
  var out = [],
      len = this.length;
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }
  return '<SlowBuffer ' + out.join(' ') + '>';
};


SlowBuffer.prototype.hexSlice = function(start, end) {
  var len = this.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(this[i]);
  }
  return out;
};


SlowBuffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();
  start = +start || 0;
  if (typeof end == 'undefined') end = this.length;

  // Fastpath empty strings
  if (+end == start) {
    return '';
  }

  switch (encoding) {
    case 'hex':
      return this.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.utf8Slice(start, end);

    case 'ascii':
      return this.asciiSlice(start, end);

    case 'binary':
      return this.binarySlice(start, end);

    case 'base64':
      return this.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


SlowBuffer.prototype.hexWrite = function(string, offset, length) {
  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2) {
    throw new Error('Invalid hex string');
  }
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error('Invalid hex string');
    this[offset + i] = byte;
  }
  SlowBuffer._charsWritten = i * 2;
  return i;
};


SlowBuffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  switch (encoding) {
    case 'hex':
      return this.hexWrite(string, offset, length);

    case 'utf8':
    case 'utf-8':
      return this.utf8Write(string, offset, length);

    case 'ascii':
      return this.asciiWrite(string, offset, length);

    case 'binary':
      return this.binaryWrite(string, offset, length);

    case 'base64':
      return this.base64Write(string, offset, length);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Write(string, offset, length);

    default:
      throw new Error('Unknown encoding');
  }
};


// slice(start, end)
SlowBuffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;

  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  return new Buffer(this, end - start, +start);
};

SlowBuffer.prototype.copy = function(target, targetstart, sourcestart, sourceend) {
  var temp = [];
  for (var i=sourcestart; i<sourceend; i++) {
    assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
    temp.push(this[i]);
  }

  for (var i=targetstart; i<targetstart+temp.length; i++) {
    target[i] = temp[i-targetstart];
  }
};

SlowBuffer.prototype.fill = function(value, start, end) {
  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  for (var i = start; i < end; i++) {
    this[i] = value;
  }
}

function coerce(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length);
  return length < 0 ? 0 : length;
}


// Buffer

function Buffer(subject, encoding, offset) {
  if (!(this instanceof Buffer)) {
    return new Buffer(subject, encoding, offset);
  }

  var type;

  // Are we slicing?
  if (typeof offset === 'number') {
    this.length = coerce(encoding);
    this.parent = subject;
    this.offset = offset;
  } else {
    // Find the length
    switch (type = typeof subject) {
      case 'number':
        this.length = coerce(subject);
        break;

      case 'string':
        this.length = Buffer.byteLength(subject, encoding);
        break;

      case 'object': // Assume object is an array
        this.length = coerce(subject.length);
        break;

      default:
        throw new Error('First argument needs to be a number, ' +
                        'array or string.');
    }

    if (this.length > Buffer.poolSize) {
      // Big buffer, just alloc one.
      this.parent = new SlowBuffer(this.length);
      this.offset = 0;

    } else {
      // Small buffer.
      if (!pool || pool.length - pool.used < this.length) allocPool();
      this.parent = pool;
      this.offset = pool.used;
      pool.used += this.length;
    }

    // Treat array-ish objects as a byte array.
    if (isArrayIsh(subject)) {
      for (var i = 0; i < this.length; i++) {
        if (subject instanceof Buffer) {
          this.parent[i + this.offset] = subject.readUInt8(i);
        }
        else {
          this.parent[i + this.offset] = subject[i];
        }
      }
    } else if (type == 'string') {
      // We are a string
      this.length = this.write(subject, 0, encoding);
    }
  }

}

function isArrayIsh(subject) {
  return Array.isArray(subject) || Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
}

exports.SlowBuffer = SlowBuffer;
exports.Buffer = Buffer;

Buffer.poolSize = 8 * 1024;
var pool;

function allocPool() {
  pool = new SlowBuffer(Buffer.poolSize);
  pool.used = 0;
}


// Static methods
Buffer.isBuffer = function isBuffer(b) {
  return b instanceof Buffer || b instanceof SlowBuffer;
};

Buffer.concat = function (list, totalLength) {
  if (!Array.isArray(list)) {
    throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");
  }

  if (list.length === 0) {
    return new Buffer(0);
  } else if (list.length === 1) {
    return list[0];
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (var i = 0; i < list.length; i++) {
      var buf = list[i];
      totalLength += buf.length;
    }
  }

  var buffer = new Buffer(totalLength);
  var pos = 0;
  for (var i = 0; i < list.length; i++) {
    var buf = list[i];
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

// Inspect
Buffer.prototype.inspect = function inspect() {
  var out = [],
      len = this.length;

  for (var i = 0; i < len; i++) {
    out[i] = toHex(this.parent[i + this.offset]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }

  return '<Buffer ' + out.join(' ') + '>';
};


Buffer.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i];
};


Buffer.prototype.set = function set(i, v) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i] = v;
};


// write(string, offset = 0, length = buffer.length-offset, encoding = 'utf8')
Buffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  var ret;
  switch (encoding) {
    case 'hex':
      ret = this.parent.hexWrite(string, this.offset + offset, length);
      break;

    case 'utf8':
    case 'utf-8':
      ret = this.parent.utf8Write(string, this.offset + offset, length);
      break;

    case 'ascii':
      ret = this.parent.asciiWrite(string, this.offset + offset, length);
      break;

    case 'binary':
      ret = this.parent.binaryWrite(string, this.offset + offset, length);
      break;

    case 'base64':
      // Warning: maxLength not taken into account in base64Write
      ret = this.parent.base64Write(string, this.offset + offset, length);
      break;

    case 'ucs2':
    case 'ucs-2':
      ret = this.parent.ucs2Write(string, this.offset + offset, length);
      break;

    default:
      throw new Error('Unknown encoding');
  }

  Buffer._charsWritten = SlowBuffer._charsWritten;

  return ret;
};


// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();

  if (typeof start == 'undefined' || start < 0) {
    start = 0;
  } else if (start > this.length) {
    start = this.length;
  }

  if (typeof end == 'undefined' || end > this.length) {
    end = this.length;
  } else if (end < 0) {
    end = 0;
  }

  start = start + this.offset;
  end = end + this.offset;

  switch (encoding) {
    case 'hex':
      return this.parent.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.parent.utf8Slice(start, end);

    case 'ascii':
      return this.parent.asciiSlice(start, end);

    case 'binary':
      return this.parent.binarySlice(start, end);

    case 'base64':
      return this.parent.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.parent.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


// byteLength
Buffer.byteLength = SlowBuffer.byteLength;


// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  value || (value = 0);
  start || (start = 0);
  end || (end = this.length);

  if (typeof value === 'string') {
    value = value.charCodeAt(0);
  }
  if (!(typeof value === 'number') || isNaN(value)) {
    throw new Error('value is not a number');
  }

  if (end < start) throw new Error('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return 0;
  if (this.length == 0) return 0;

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds');
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds');
  }

  return this.parent.fill(value,
                          start + this.offset,
                          end + this.offset);
};


// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function(target, target_start, start, end) {
  var source = this;
  start || (start = 0);
  end || (end = this.length);
  target_start || (target_start = 0);

  if (end < start) throw new Error('sourceEnd < sourceStart');

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length == 0 || source.length == 0) return 0;

  if (target_start < 0 || target_start >= target.length) {
    throw new Error('targetStart out of bounds');
  }

  if (start < 0 || start >= source.length) {
    throw new Error('sourceStart out of bounds');
  }

  if (end < 0 || end > source.length) {
    throw new Error('sourceEnd out of bounds');
  }

  // Are we oob?
  if (end > this.length) {
    end = this.length;
  }

  if (target.length - target_start < end - start) {
    end = target.length - target_start + start;
  }

  return this.parent.copy(target.parent,
                          target_start + target.offset,
                          start + this.offset,
                          end + this.offset);
};


// slice(start, end)
Buffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;
  if (end > this.length) throw new Error('oob');
  if (start > end) throw new Error('oob');

  return new Buffer(this.parent, end - start, +start + this.offset);
};


// Legacy methods for backwards compatibility.

Buffer.prototype.utf8Slice = function(start, end) {
  return this.toString('utf8', start, end);
};

Buffer.prototype.binarySlice = function(start, end) {
  return this.toString('binary', start, end);
};

Buffer.prototype.asciiSlice = function(start, end) {
  return this.toString('ascii', start, end);
};

Buffer.prototype.utf8Write = function(string, offset) {
  return this.write(string, offset, 'utf8');
};

Buffer.prototype.binaryWrite = function(string, offset) {
  return this.write(string, offset, 'binary');
};

Buffer.prototype.asciiWrite = function(string, offset) {
  return this.write(string, offset, 'ascii');
};

Buffer.prototype.readUInt8 = function(offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  return buffer.parent[buffer.offset + offset];
};

function readUInt16(buffer, offset, isBigEndian, noAssert) {
  var val = 0;


  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    val = buffer.parent[buffer.offset + offset] << 8;
    if (offset + 1 < buffer.length) {
      val |= buffer.parent[buffer.offset + offset + 1];
    }
  } else {
    val = buffer.parent[buffer.offset + offset];
    if (offset + 1 < buffer.length) {
      val |= buffer.parent[buffer.offset + offset + 1] << 8;
    }
  }

  return val;
}

Buffer.prototype.readUInt16LE = function(offset, noAssert) {
  return readUInt16(this, offset, false, noAssert);
};

Buffer.prototype.readUInt16BE = function(offset, noAssert) {
  return readUInt16(this, offset, true, noAssert);
};

function readUInt32(buffer, offset, isBigEndian, noAssert) {
  var val = 0;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    if (offset + 1 < buffer.length)
      val = buffer.parent[buffer.offset + offset + 1] << 16;
    if (offset + 2 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 2] << 8;
    if (offset + 3 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 3];
    val = val + (buffer.parent[buffer.offset + offset] << 24 >>> 0);
  } else {
    if (offset + 2 < buffer.length)
      val = buffer.parent[buffer.offset + offset + 2] << 16;
    if (offset + 1 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 1] << 8;
    val |= buffer.parent[buffer.offset + offset];
    if (offset + 3 < buffer.length)
      val = val + (buffer.parent[buffer.offset + offset + 3] << 24 >>> 0);
  }

  return val;
}

Buffer.prototype.readUInt32LE = function(offset, noAssert) {
  return readUInt32(this, offset, false, noAssert);
};

Buffer.prototype.readUInt32BE = function(offset, noAssert) {
  return readUInt32(this, offset, true, noAssert);
};


/*
 * Signed integer types, yay team! A reminder on how two's complement actually
 * works. The first bit is the signed bit, i.e. tells us whether or not the
 * number should be positive or negative. If the two's complement value is
 * positive, then we're done, as it's equivalent to the unsigned representation.
 *
 * Now if the number is positive, you're pretty much done, you can just leverage
 * the unsigned translations and return those. Unfortunately, negative numbers
 * aren't quite that straightforward.
 *
 * At first glance, one might be inclined to use the traditional formula to
 * translate binary numbers between the positive and negative values in two's
 * complement. (Though it doesn't quite work for the most negative value)
 * Mainly:
 *  - invert all the bits
 *  - add one to the result
 *
 * Of course, this doesn't quite work in Javascript. Take for example the value
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
 * course, Javascript will do the following:
 *
 * > ~0xff80
 * -65409
 *
 * Whoh there, Javascript, that's not quite right. But wait, according to
 * Javascript that's perfectly correct. When Javascript ends up seeing the
 * constant 0xff80, it has no notion that it is actually a signed number. It
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
 * binary negation, it casts it into a signed value, (positive 0xff80). Then
 * when you perform binary negation on that, it turns it into a negative number.
 *
 * Instead, we're going to have to use the following general formula, that works
 * in a rather Javascript friendly way. I'm glad we don't support this kind of
 * weird numbering scheme in the kernel.
 *
 * (BIT-MAX - (unsigned)val + 1) * -1
 *
 * The astute observer, may think that this doesn't make sense for 8-bit numbers
 * (really it isn't necessary for them). However, when you get 16-bit numbers,
 * you do. Let's go back to our prior example and see how this will look:
 *
 * (0xffff - 0xff80 + 1) * -1
 * (0x007f + 1) * -1
 * (0x0080) * -1
 */
Buffer.prototype.readInt8 = function(offset, noAssert) {
  var buffer = this;
  var neg;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  neg = buffer.parent[buffer.offset + offset] & 0x80;
  if (!neg) {
    return (buffer.parent[buffer.offset + offset]);
  }

  return ((0xff - buffer.parent[buffer.offset + offset] + 1) * -1);
};

function readInt16(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt16(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x8000;
  if (!neg) {
    return val;
  }

  return (0xffff - val + 1) * -1;
}

Buffer.prototype.readInt16LE = function(offset, noAssert) {
  return readInt16(this, offset, false, noAssert);
};

Buffer.prototype.readInt16BE = function(offset, noAssert) {
  return readInt16(this, offset, true, noAssert);
};

function readInt32(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt32(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x80000000;
  if (!neg) {
    return (val);
  }

  return (0xffffffff - val + 1) * -1;
}

Buffer.prototype.readInt32LE = function(offset, noAssert) {
  return readInt32(this, offset, false, noAssert);
};

Buffer.prototype.readInt32BE = function(offset, noAssert) {
  return readInt32(this, offset, true, noAssert);
};

function readFloat(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.readFloatLE = function(offset, noAssert) {
  return readFloat(this, offset, false, noAssert);
};

Buffer.prototype.readFloatBE = function(offset, noAssert) {
  return readFloat(this, offset, true, noAssert);
};

function readDouble(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 7 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.readDoubleLE = function(offset, noAssert) {
  return readDouble(this, offset, false, noAssert);
};

Buffer.prototype.readDoubleBE = function(offset, noAssert) {
  return readDouble(this, offset, true, noAssert);
};


/*
 * We have to make sure that the value is a valid integer. This means that it is
 * non-negative. It has no fractional component and that it does not exceed the
 * maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint(value, max) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value >= 0,
      'specified a negative value for writing an unsigned value');

  assert.ok(value <= max, 'value is larger than maximum value for type');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xff);
  }

  if (offset < buffer.length) {
    buffer.parent[buffer.offset + offset] = value;
  }
};

function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 2); i++) {
    buffer.parent[buffer.offset + offset + i] =
        (value & (0xff << (8 * (isBigEndian ? 1 - i : i)))) >>>
            (isBigEndian ? 1 - i : i) * 8;
  }

}

Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, true, noAssert);
};

function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffffffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 4); i++) {
    buffer.parent[buffer.offset + offset + i] =
        (value >>> (isBigEndian ? 3 - i : i) * 8) & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, true, noAssert);
};


/*
 * We now move onto our friends in the signed number category. Unlike unsigned
 * numbers, we're going to have to worry a bit more about how we put values into
 * arrays. Since we are only worrying about signed 32-bit values, we're in
 * slightly better shape. Unfortunately, we really can't do our favorite binary
 * & in this system. It really seems to do the wrong thing. For example:
 *
 * > -32 & 0xff
 * 224
 *
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
 * this aren't treated as a signed number. Ultimately a bad thing.
 *
 * What we're going to want to do is basically create the unsigned equivalent of
 * our representation and pass that off to the wuint* functions. To do that
 * we're going to do the following:
 *
 *  - if the value is positive
 *      we can pass it directly off to the equivalent wuint
 *  - if the value is negative
 *      we do the following computation:
 *         mb + val + 1, where
 *         mb   is the maximum unsigned value in that byte size
 *         val  is the Javascript negative integer
 *
 *
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
 * you do out the computations:
 *
 * 0xffff - 128 + 1
 * 0xffff - 127
 * 0xff80
 *
 * You can then encode this value as the signed version. This is really rather
 * hacky, but it should work and get the job done which is our goal here.
 */

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

function verifIEEE754(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');
}

Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7f, -0x80);
  }

  if (value >= 0) {
    buffer.writeUInt8(value, offset, noAssert);
  } else {
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
  }
};

function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fff, -0x8000);
  }

  if (value >= 0) {
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, true, noAssert);
};

function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fffffff, -0x80000000);
  }

  if (value >= 0) {
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, true, noAssert);
};

function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, false, noAssert);
};

Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, true, noAssert);
};

function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 7 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, true, noAssert);
};

SlowBuffer.prototype.readUInt8 = Buffer.prototype.readUInt8;
SlowBuffer.prototype.readUInt16LE = Buffer.prototype.readUInt16LE;
SlowBuffer.prototype.readUInt16BE = Buffer.prototype.readUInt16BE;
SlowBuffer.prototype.readUInt32LE = Buffer.prototype.readUInt32LE;
SlowBuffer.prototype.readUInt32BE = Buffer.prototype.readUInt32BE;
SlowBuffer.prototype.readInt8 = Buffer.prototype.readInt8;
SlowBuffer.prototype.readInt16LE = Buffer.prototype.readInt16LE;
SlowBuffer.prototype.readInt16BE = Buffer.prototype.readInt16BE;
SlowBuffer.prototype.readInt32LE = Buffer.prototype.readInt32LE;
SlowBuffer.prototype.readInt32BE = Buffer.prototype.readInt32BE;
SlowBuffer.prototype.readFloatLE = Buffer.prototype.readFloatLE;
SlowBuffer.prototype.readFloatBE = Buffer.prototype.readFloatBE;
SlowBuffer.prototype.readDoubleLE = Buffer.prototype.readDoubleLE;
SlowBuffer.prototype.readDoubleBE = Buffer.prototype.readDoubleBE;
SlowBuffer.prototype.writeUInt8 = Buffer.prototype.writeUInt8;
SlowBuffer.prototype.writeUInt16LE = Buffer.prototype.writeUInt16LE;
SlowBuffer.prototype.writeUInt16BE = Buffer.prototype.writeUInt16BE;
SlowBuffer.prototype.writeUInt32LE = Buffer.prototype.writeUInt32LE;
SlowBuffer.prototype.writeUInt32BE = Buffer.prototype.writeUInt32BE;
SlowBuffer.prototype.writeInt8 = Buffer.prototype.writeInt8;
SlowBuffer.prototype.writeInt16LE = Buffer.prototype.writeInt16LE;
SlowBuffer.prototype.writeInt16BE = Buffer.prototype.writeInt16BE;
SlowBuffer.prototype.writeInt32LE = Buffer.prototype.writeInt32LE;
SlowBuffer.prototype.writeInt32BE = Buffer.prototype.writeInt32BE;
SlowBuffer.prototype.writeFloatLE = Buffer.prototype.writeFloatLE;
SlowBuffer.prototype.writeFloatBE = Buffer.prototype.writeFloatBE;
SlowBuffer.prototype.writeDoubleLE = Buffer.prototype.writeDoubleLE;
SlowBuffer.prototype.writeDoubleBE = Buffer.prototype.writeDoubleBE;

},{"assert":1,"./buffer_ieee754":5,"base64-js":7}],7:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}],8:[function(require,module,exports){
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isBE ? 0 : (nBytes - 1),
      d = isBE ? 1 : -1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isBE ? (nBytes - 1) : 0,
      d = isBE ? -1 : 1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],3:[function(require,module,exports){
function SlowBuffer (size) {
    this.length = size;
};

var assert = require('assert');

exports.INSPECT_MAX_BYTES = 50;


function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }

  return byteArray;
}

function asciiToBytes(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++ )
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push( str.charCodeAt(i) & 0xFF );

  return byteArray;
}

function base64ToBytes(str) {
  return require("base64-js").toByteArray(str);
}

SlowBuffer.byteLength = function (str, encoding) {
  switch (encoding || "utf8") {
    case 'hex':
      return str.length / 2;

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length;

    case 'ascii':
      return str.length;

    case 'base64':
      return base64ToBytes(str).length;

    default:
      throw new Error('Unknown encoding');
  }
};

function blitBuffer(src, dst, offset, length) {
  var pos, i = 0;
  while (i < length) {
    if ((i+offset >= dst.length) || (i >= src.length))
      break;

    dst[i + offset] = src[i];
    i++;
  }
  return i;
}

SlowBuffer.prototype.utf8Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.asciiWrite = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
};

SlowBuffer.prototype.base64Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.base64Slice = function (start, end) {
  var bytes = Array.prototype.slice.apply(this, arguments)
  return require("base64-js").fromByteArray(bytes);
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
  }
}

SlowBuffer.prototype.utf8Slice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var res = "";
  var tmp = "";
  var i = 0;
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
      tmp = "";
    } else
      tmp += "%" + bytes[i].toString(16);

    i++;
  }

  return res + decodeUtf8Char(tmp);
}

SlowBuffer.prototype.asciiSlice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var ret = "";
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i]);
  return ret;
}

SlowBuffer.prototype.inspect = function() {
  var out = [],
      len = this.length;
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }
  return '<SlowBuffer ' + out.join(' ') + '>';
};


SlowBuffer.prototype.hexSlice = function(start, end) {
  var len = this.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(this[i]);
  }
  return out;
};


SlowBuffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();
  start = +start || 0;
  if (typeof end == 'undefined') end = this.length;

  // Fastpath empty strings
  if (+end == start) {
    return '';
  }

  switch (encoding) {
    case 'hex':
      return this.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.utf8Slice(start, end);

    case 'ascii':
      return this.asciiSlice(start, end);

    case 'binary':
      return this.binarySlice(start, end);

    case 'base64':
      return this.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


SlowBuffer.prototype.hexWrite = function(string, offset, length) {
  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2) {
    throw new Error('Invalid hex string');
  }
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error('Invalid hex string');
    this[offset + i] = byte;
  }
  SlowBuffer._charsWritten = i * 2;
  return i;
};


SlowBuffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  switch (encoding) {
    case 'hex':
      return this.hexWrite(string, offset, length);

    case 'utf8':
    case 'utf-8':
      return this.utf8Write(string, offset, length);

    case 'ascii':
      return this.asciiWrite(string, offset, length);

    case 'binary':
      return this.binaryWrite(string, offset, length);

    case 'base64':
      return this.base64Write(string, offset, length);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Write(string, offset, length);

    default:
      throw new Error('Unknown encoding');
  }
};


// slice(start, end)
SlowBuffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;

  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  return new Buffer(this, end - start, +start);
};

SlowBuffer.prototype.copy = function(target, targetstart, sourcestart, sourceend) {
  var temp = [];
  for (var i=sourcestart; i<sourceend; i++) {
    assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
    temp.push(this[i]);
  }

  for (var i=targetstart; i<targetstart+temp.length; i++) {
    target[i] = temp[i-targetstart];
  }
};

function coerce(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length);
  return length < 0 ? 0 : length;
}


// Buffer

function Buffer(subject, encoding, offset) {
  if (!(this instanceof Buffer)) {
    return new Buffer(subject, encoding, offset);
  }

  var type;

  // Are we slicing?
  if (typeof offset === 'number') {
    this.length = coerce(encoding);
    this.parent = subject;
    this.offset = offset;
  } else {
    // Find the length
    switch (type = typeof subject) {
      case 'number':
        this.length = coerce(subject);
        break;

      case 'string':
        this.length = Buffer.byteLength(subject, encoding);
        break;

      case 'object': // Assume object is an array
        this.length = coerce(subject.length);
        break;

      default:
        throw new Error('First argument needs to be a number, ' +
                        'array or string.');
    }

    if (this.length > Buffer.poolSize) {
      // Big buffer, just alloc one.
      this.parent = new SlowBuffer(this.length);
      this.offset = 0;

    } else {
      // Small buffer.
      if (!pool || pool.length - pool.used < this.length) allocPool();
      this.parent = pool;
      this.offset = pool.used;
      pool.used += this.length;
    }

    // Treat array-ish objects as a byte array.
    if (isArrayIsh(subject)) {
      for (var i = 0; i < this.length; i++) {
        this.parent[i + this.offset] = subject[i];
      }
    } else if (type == 'string') {
      // We are a string
      this.length = this.write(subject, 0, encoding);
    }
  }

}

function isArrayIsh(subject) {
  return Array.isArray(subject) || Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
}

exports.SlowBuffer = SlowBuffer;
exports.Buffer = Buffer;

Buffer.poolSize = 8 * 1024;
var pool;

function allocPool() {
  pool = new SlowBuffer(Buffer.poolSize);
  pool.used = 0;
}


// Static methods
Buffer.isBuffer = function isBuffer(b) {
  return b instanceof Buffer || b instanceof SlowBuffer;
};

Buffer.concat = function (list, totalLength) {
  if (!Array.isArray(list)) {
    throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");
  }

  if (list.length === 0) {
    return new Buffer(0);
  } else if (list.length === 1) {
    return list[0];
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (var i = 0; i < list.length; i++) {
      var buf = list[i];
      totalLength += buf.length;
    }
  }

  var buffer = new Buffer(totalLength);
  var pos = 0;
  for (var i = 0; i < list.length; i++) {
    var buf = list[i];
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

// Inspect
Buffer.prototype.inspect = function inspect() {
  var out = [],
      len = this.length;

  for (var i = 0; i < len; i++) {
    out[i] = toHex(this.parent[i + this.offset]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }

  return '<Buffer ' + out.join(' ') + '>';
};


Buffer.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i];
};


Buffer.prototype.set = function set(i, v) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i] = v;
};


// write(string, offset = 0, length = buffer.length-offset, encoding = 'utf8')
Buffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  var ret;
  switch (encoding) {
    case 'hex':
      ret = this.parent.hexWrite(string, this.offset + offset, length);
      break;

    case 'utf8':
    case 'utf-8':
      ret = this.parent.utf8Write(string, this.offset + offset, length);
      break;

    case 'ascii':
      ret = this.parent.asciiWrite(string, this.offset + offset, length);
      break;

    case 'binary':
      ret = this.parent.binaryWrite(string, this.offset + offset, length);
      break;

    case 'base64':
      // Warning: maxLength not taken into account in base64Write
      ret = this.parent.base64Write(string, this.offset + offset, length);
      break;

    case 'ucs2':
    case 'ucs-2':
      ret = this.parent.ucs2Write(string, this.offset + offset, length);
      break;

    default:
      throw new Error('Unknown encoding');
  }

  Buffer._charsWritten = SlowBuffer._charsWritten;

  return ret;
};


// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();

  if (typeof start == 'undefined' || start < 0) {
    start = 0;
  } else if (start > this.length) {
    start = this.length;
  }

  if (typeof end == 'undefined' || end > this.length) {
    end = this.length;
  } else if (end < 0) {
    end = 0;
  }

  start = start + this.offset;
  end = end + this.offset;

  switch (encoding) {
    case 'hex':
      return this.parent.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.parent.utf8Slice(start, end);

    case 'ascii':
      return this.parent.asciiSlice(start, end);

    case 'binary':
      return this.parent.binarySlice(start, end);

    case 'base64':
      return this.parent.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.parent.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


// byteLength
Buffer.byteLength = SlowBuffer.byteLength;


// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  value || (value = 0);
  start || (start = 0);
  end || (end = this.length);

  if (typeof value === 'string') {
    value = value.charCodeAt(0);
  }
  if (!(typeof value === 'number') || isNaN(value)) {
    throw new Error('value is not a number');
  }

  if (end < start) throw new Error('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return 0;
  if (this.length == 0) return 0;

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds');
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds');
  }

  return this.parent.fill(value,
                          start + this.offset,
                          end + this.offset);
};


// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function(target, target_start, start, end) {
  var source = this;
  start || (start = 0);
  end || (end = this.length);
  target_start || (target_start = 0);

  if (end < start) throw new Error('sourceEnd < sourceStart');

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length == 0 || source.length == 0) return 0;

  if (target_start < 0 || target_start >= target.length) {
    throw new Error('targetStart out of bounds');
  }

  if (start < 0 || start >= source.length) {
    throw new Error('sourceStart out of bounds');
  }

  if (end < 0 || end > source.length) {
    throw new Error('sourceEnd out of bounds');
  }

  // Are we oob?
  if (end > this.length) {
    end = this.length;
  }

  if (target.length - target_start < end - start) {
    end = target.length - target_start + start;
  }

  return this.parent.copy(target.parent,
                          target_start + target.offset,
                          start + this.offset,
                          end + this.offset);
};


// slice(start, end)
Buffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;
  if (end > this.length) throw new Error('oob');
  if (start > end) throw new Error('oob');

  return new Buffer(this.parent, end - start, +start + this.offset);
};


// Legacy methods for backwards compatibility.

Buffer.prototype.utf8Slice = function(start, end) {
  return this.toString('utf8', start, end);
};

Buffer.prototype.binarySlice = function(start, end) {
  return this.toString('binary', start, end);
};

Buffer.prototype.asciiSlice = function(start, end) {
  return this.toString('ascii', start, end);
};

Buffer.prototype.utf8Write = function(string, offset) {
  return this.write(string, offset, 'utf8');
};

Buffer.prototype.binaryWrite = function(string, offset) {
  return this.write(string, offset, 'binary');
};

Buffer.prototype.asciiWrite = function(string, offset) {
  return this.write(string, offset, 'ascii');
};

Buffer.prototype.readUInt8 = function(offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  return buffer.parent[buffer.offset + offset];
};

function readUInt16(buffer, offset, isBigEndian, noAssert) {
  var val = 0;


  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (isBigEndian) {
    val = buffer.parent[buffer.offset + offset] << 8;
    val |= buffer.parent[buffer.offset + offset + 1];
  } else {
    val = buffer.parent[buffer.offset + offset];
    val |= buffer.parent[buffer.offset + offset + 1] << 8;
  }

  return val;
}

Buffer.prototype.readUInt16LE = function(offset, noAssert) {
  return readUInt16(this, offset, false, noAssert);
};

Buffer.prototype.readUInt16BE = function(offset, noAssert) {
  return readUInt16(this, offset, true, noAssert);
};

function readUInt32(buffer, offset, isBigEndian, noAssert) {
  var val = 0;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (isBigEndian) {
    val = buffer.parent[buffer.offset + offset + 1] << 16;
    val |= buffer.parent[buffer.offset + offset + 2] << 8;
    val |= buffer.parent[buffer.offset + offset + 3];
    val = val + (buffer.parent[buffer.offset + offset] << 24 >>> 0);
  } else {
    val = buffer.parent[buffer.offset + offset + 2] << 16;
    val |= buffer.parent[buffer.offset + offset + 1] << 8;
    val |= buffer.parent[buffer.offset + offset];
    val = val + (buffer.parent[buffer.offset + offset + 3] << 24 >>> 0);
  }

  return val;
}

Buffer.prototype.readUInt32LE = function(offset, noAssert) {
  return readUInt32(this, offset, false, noAssert);
};

Buffer.prototype.readUInt32BE = function(offset, noAssert) {
  return readUInt32(this, offset, true, noAssert);
};


/*
 * Signed integer types, yay team! A reminder on how two's complement actually
 * works. The first bit is the signed bit, i.e. tells us whether or not the
 * number should be positive or negative. If the two's complement value is
 * positive, then we're done, as it's equivalent to the unsigned representation.
 *
 * Now if the number is positive, you're pretty much done, you can just leverage
 * the unsigned translations and return those. Unfortunately, negative numbers
 * aren't quite that straightforward.
 *
 * At first glance, one might be inclined to use the traditional formula to
 * translate binary numbers between the positive and negative values in two's
 * complement. (Though it doesn't quite work for the most negative value)
 * Mainly:
 *  - invert all the bits
 *  - add one to the result
 *
 * Of course, this doesn't quite work in Javascript. Take for example the value
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
 * course, Javascript will do the following:
 *
 * > ~0xff80
 * -65409
 *
 * Whoh there, Javascript, that's not quite right. But wait, according to
 * Javascript that's perfectly correct. When Javascript ends up seeing the
 * constant 0xff80, it has no notion that it is actually a signed number. It
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
 * binary negation, it casts it into a signed value, (positive 0xff80). Then
 * when you perform binary negation on that, it turns it into a negative number.
 *
 * Instead, we're going to have to use the following general formula, that works
 * in a rather Javascript friendly way. I'm glad we don't support this kind of
 * weird numbering scheme in the kernel.
 *
 * (BIT-MAX - (unsigned)val + 1) * -1
 *
 * The astute observer, may think that this doesn't make sense for 8-bit numbers
 * (really it isn't necessary for them). However, when you get 16-bit numbers,
 * you do. Let's go back to our prior example and see how this will look:
 *
 * (0xffff - 0xff80 + 1) * -1
 * (0x007f + 1) * -1
 * (0x0080) * -1
 */
Buffer.prototype.readInt8 = function(offset, noAssert) {
  var buffer = this;
  var neg;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  neg = buffer.parent[buffer.offset + offset] & 0x80;
  if (!neg) {
    return (buffer.parent[buffer.offset + offset]);
  }

  return ((0xff - buffer.parent[buffer.offset + offset] + 1) * -1);
};

function readInt16(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt16(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x8000;
  if (!neg) {
    return val;
  }

  return (0xffff - val + 1) * -1;
}

Buffer.prototype.readInt16LE = function(offset, noAssert) {
  return readInt16(this, offset, false, noAssert);
};

Buffer.prototype.readInt16BE = function(offset, noAssert) {
  return readInt16(this, offset, true, noAssert);
};

function readInt32(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt32(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x80000000;
  if (!neg) {
    return (val);
  }

  return (0xffffffff - val + 1) * -1;
}

Buffer.prototype.readInt32LE = function(offset, noAssert) {
  return readInt32(this, offset, false, noAssert);
};

Buffer.prototype.readInt32BE = function(offset, noAssert) {
  return readInt32(this, offset, true, noAssert);
};

function readFloat(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.readFloatLE = function(offset, noAssert) {
  return readFloat(this, offset, false, noAssert);
};

Buffer.prototype.readFloatBE = function(offset, noAssert) {
  return readFloat(this, offset, true, noAssert);
};

function readDouble(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 7 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.readDoubleLE = function(offset, noAssert) {
  return readDouble(this, offset, false, noAssert);
};

Buffer.prototype.readDoubleBE = function(offset, noAssert) {
  return readDouble(this, offset, true, noAssert);
};


/*
 * We have to make sure that the value is a valid integer. This means that it is
 * non-negative. It has no fractional component and that it does not exceed the
 * maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint(value, max) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value >= 0,
      'specified a negative value for writing an unsigned value');

  assert.ok(value <= max, 'value is larger than maximum value for type');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xff);
  }

  buffer.parent[buffer.offset + offset] = value;
};

function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffff);
  }

  if (isBigEndian) {
    buffer.parent[buffer.offset + offset] = (value & 0xff00) >>> 8;
    buffer.parent[buffer.offset + offset + 1] = value & 0x00ff;
  } else {
    buffer.parent[buffer.offset + offset + 1] = (value & 0xff00) >>> 8;
    buffer.parent[buffer.offset + offset] = value & 0x00ff;
  }
}

Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, true, noAssert);
};

function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffffffff);
  }

  if (isBigEndian) {
    buffer.parent[buffer.offset + offset] = (value >>> 24) & 0xff;
    buffer.parent[buffer.offset + offset + 1] = (value >>> 16) & 0xff;
    buffer.parent[buffer.offset + offset + 2] = (value >>> 8) & 0xff;
    buffer.parent[buffer.offset + offset + 3] = value & 0xff;
  } else {
    buffer.parent[buffer.offset + offset + 3] = (value >>> 24) & 0xff;
    buffer.parent[buffer.offset + offset + 2] = (value >>> 16) & 0xff;
    buffer.parent[buffer.offset + offset + 1] = (value >>> 8) & 0xff;
    buffer.parent[buffer.offset + offset] = value & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, true, noAssert);
};


/*
 * We now move onto our friends in the signed number category. Unlike unsigned
 * numbers, we're going to have to worry a bit more about how we put values into
 * arrays. Since we are only worrying about signed 32-bit values, we're in
 * slightly better shape. Unfortunately, we really can't do our favorite binary
 * & in this system. It really seems to do the wrong thing. For example:
 *
 * > -32 & 0xff
 * 224
 *
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
 * this aren't treated as a signed number. Ultimately a bad thing.
 *
 * What we're going to want to do is basically create the unsigned equivalent of
 * our representation and pass that off to the wuint* functions. To do that
 * we're going to do the following:
 *
 *  - if the value is positive
 *      we can pass it directly off to the equivalent wuint
 *  - if the value is negative
 *      we do the following computation:
 *         mb + val + 1, where
 *         mb   is the maximum unsigned value in that byte size
 *         val  is the Javascript negative integer
 *
 *
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
 * you do out the computations:
 *
 * 0xffff - 128 + 1
 * 0xffff - 127
 * 0xff80
 *
 * You can then encode this value as the signed version. This is really rather
 * hacky, but it should work and get the job done which is our goal here.
 */

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

function verifIEEE754(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');
}

Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7f, -0x80);
  }

  if (value >= 0) {
    buffer.writeUInt8(value, offset, noAssert);
  } else {
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
  }
};

function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fff, -0x8000);
  }

  if (value >= 0) {
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, true, noAssert);
};

function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fffffff, -0x80000000);
  }

  if (value >= 0) {
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, true, noAssert);
};

function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, false, noAssert);
};

Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, true, noAssert);
};

function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 7 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, true, noAssert);
};

SlowBuffer.prototype.readUInt8 = Buffer.prototype.readUInt8;
SlowBuffer.prototype.readUInt16LE = Buffer.prototype.readUInt16LE;
SlowBuffer.prototype.readUInt16BE = Buffer.prototype.readUInt16BE;
SlowBuffer.prototype.readUInt32LE = Buffer.prototype.readUInt32LE;
SlowBuffer.prototype.readUInt32BE = Buffer.prototype.readUInt32BE;
SlowBuffer.prototype.readInt8 = Buffer.prototype.readInt8;
SlowBuffer.prototype.readInt16LE = Buffer.prototype.readInt16LE;
SlowBuffer.prototype.readInt16BE = Buffer.prototype.readInt16BE;
SlowBuffer.prototype.readInt32LE = Buffer.prototype.readInt32LE;
SlowBuffer.prototype.readInt32BE = Buffer.prototype.readInt32BE;
SlowBuffer.prototype.readFloatLE = Buffer.prototype.readFloatLE;
SlowBuffer.prototype.readFloatBE = Buffer.prototype.readFloatBE;
SlowBuffer.prototype.readDoubleLE = Buffer.prototype.readDoubleLE;
SlowBuffer.prototype.readDoubleBE = Buffer.prototype.readDoubleBE;
SlowBuffer.prototype.writeUInt8 = Buffer.prototype.writeUInt8;
SlowBuffer.prototype.writeUInt16LE = Buffer.prototype.writeUInt16LE;
SlowBuffer.prototype.writeUInt16BE = Buffer.prototype.writeUInt16BE;
SlowBuffer.prototype.writeUInt32LE = Buffer.prototype.writeUInt32LE;
SlowBuffer.prototype.writeUInt32BE = Buffer.prototype.writeUInt32BE;
SlowBuffer.prototype.writeInt8 = Buffer.prototype.writeInt8;
SlowBuffer.prototype.writeInt16LE = Buffer.prototype.writeInt16LE;
SlowBuffer.prototype.writeInt16BE = Buffer.prototype.writeInt16BE;
SlowBuffer.prototype.writeInt32LE = Buffer.prototype.writeInt32LE;
SlowBuffer.prototype.writeInt32BE = Buffer.prototype.writeInt32BE;
SlowBuffer.prototype.writeFloatLE = Buffer.prototype.writeFloatLE;
SlowBuffer.prototype.writeFloatBE = Buffer.prototype.writeFloatBE;
SlowBuffer.prototype.writeDoubleLE = Buffer.prototype.writeDoubleLE;
SlowBuffer.prototype.writeDoubleBE = Buffer.prototype.writeDoubleBE;

},{"assert":1,"./buffer_ieee754":8,"base64-js":9}],9:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}]},{},[])
;;module.exports=require("buffer-browserify")

},{}],4:[function(require,module,exports){

},{"__browserify_Buffer":3,"__browserify_process":1}],5:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/vendor/queue.coffee",__dirname="/vendor";/*
  Common interface for promises.

  Use jQuery's Deferreds when in browser environment,
  otherwise assume node environment and load kriskowal's q.
*/

var Queue, provider;

provider = typeof window !== "undefined" ? window.jQuery : require("q");

/*
  Creates a thenable value from the given value.

  @param value
  @returns {Promise}
*/


Queue = function() {
  return provider.when.apply(provider, arguments);
};

/*
  Creates a new promise.

  Calls the resolver which takes as arguments three functions `resolve`,
  `reject` and `progress`.

  @param {function} resolver
  @returns {Promise}
*/


Queue.promise = (function() {
  if (typeof window !== "undefined") {
    return function(resolver) {
      var d;
      d = provider.Deferred();
      resolver(d.resolve, d.reject, d.progress);
      return d;
    };
  } else {
    return function() {
      return provider.promise.apply(provider, arguments);
    };
  }
})();

module.exports = Queue;


},{"__browserify_Buffer":3,"__browserify_process":1,"q":4}],6:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/utils.coffee",__dirname="/";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Utils;

Utils = {};

Utils.sharedCanvas = document.createElement("canvas");

if (Modernizr.canvas) {
  Utils.sharedContext = Utils.sharedCanvas.getContext("2d");
}

/*
  @param options Options
  @param options.image Dimensions (width, height) of the image
  @param options.container Dimensions (width, height) of the container
  @returns {Object} An object containing the final canvas dimensions (width, height)
*/


Utils.calculateCanvasSize = function(options) {
  var result, scale;
  scale = Math.min(options.container.width / options.image.width, options.container.height / options.image.height);
  result = {
    width: options.image.width * scale,
    height: options.image.height * scale
  };
  return result;
};

/*
  Creates a number as a fingerprint for an array of numbers.

  Based on http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery.

  @param {Array} data
  @returns {Number}
*/


Utils.fingerprint = function(data) {
  var hash, point, _i, _len;
  hash = 0;
  if (!data.length) {
    return hash;
  }
  for (_i = 0, _len = data.length; _i < _len; _i++) {
    point = data[_i];
    hash = ((hash << 5) - hash) + point;
    hash |= 0;
  }
  return hash;
};

/*
  @param {Image} image
  @returns {ImageData}
*/


Utils.getImageDataForImage = function(image) {
  var canvas, context;
  canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, image.width, image.height);
};

/*
  @param {Image} image
  @param {CanvasRenderingContext2d} context
*/


Utils.resizeImageSmooth = function(image, context) {
  var destHeight, destImageData, destPixels, destWidth, i, resized, resizedBuffer, resizedBufferLength, sourceImageData, sourcePixels, _i;
  sourceImageData = Utils.getImageDataForImage(image);
  destImageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
  sourcePixels = sourceImageData.data;
  destPixels = destImageData.data;
  destWidth = context.canvas.width;
  destHeight = context.canvas.height;
  resized = new Resize(image.width, image.height, destWidth, destHeight, true, true, false);
  resizedBuffer = resized.resize(sourcePixels);
  resizedBufferLength = resizedBuffer.length;
  for (i = _i = 0; 0 <= resizedBufferLength ? _i < resizedBufferLength : _i > resizedBufferLength; i = 0 <= resizedBufferLength ? ++_i : --_i) {
    destPixels[i] = resizedBuffer[i] & 0xFF;
  }
  return context.putImageData(destImageData, 0, 0);
};

/*
  @param {Image} image
  @param {} dimensions
  @returns {ImageData}
*/


Utils.getResizedImageDataForImage = function(image, dimensions, options) {
  var canvas, context;
  if (options == null) {
    options = {};
  }
  if (options.smooth == null) {
    options.smooth = false;
  }
  canvas = document.createElement("canvas");
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  context = canvas.getContext("2d");
  if (!options.smooth) {
    context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
  } else {
    Utils.resizeImageSmooth(image, context);
  }
  return context.getImageData(0, 0, canvas.width, canvas.height);
};

/*
  @param {ImageData} imageData
  @returns {ImageData}
*/


Utils.cloneImageData = function(imageData) {
  var i, newImageData, _i, _ref;
  newImageData = this.sharedContext.createImageData(imageData.width, imageData.height);
  for (i = _i = 0, _ref = imageData.data.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
    newImageData.data[i] = imageData.data[i];
  }
  return newImageData;
};

/*
  @param {Object} dimensions
  @param {Integer} dimensions.width
  @param {Integer} dimensions.height
  @returns {HTMLCanvasElement}
*/


Utils.newCanvasWithDimensions = function(dimensions) {
  var canvas;
  canvas = document.createElement("canvas");
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  return canvas;
};

/*
  @param {imageData} imageData
  @returns {HTMLCanvasElement}
*/


Utils.newCanvasFromImageData = function(imageData) {
  var canvas, context;
  canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  context = canvas.getContext("2d");
  context.putImageData(imageData, 0, 0);
  return canvas;
};

/*
  @param {String} str Input String
  @returns {String} Output Stirng
*/


Utils.dasherize = function(str) {
  return str.toLowerCase().replace(/[^\w\s-]/g, ' ').replace(/[-_\s]+/g, '-');
};

/*
  @param {Integer} number
  @param {Integer} min
  @param {Integer} max
  @returns {Integer}
*/


Utils.clamp = function(number, min, max) {
  return Math.min(Math.max(number, min), max);
};

/*
  @param {Integer} number
  @param {Integer} min
  @param {Integer} max
  @returns {Integer}
*/


Utils.within = function(number, min, max) {
  return (min < number && number < max);
};

/*
  @param {Object} x/y coordinates
  @param [Object] minimum and maximum x/y coordinates
  @returns {Boolean}
*/


Utils.withinBoundaries = function(coords, boundaries) {
  if (boundaries == null) {
    boundaries = {
      x: {
        min: 0,
        max: 1
      },
      y: {
        min: 0,
        max: 1
      }
    };
  }
  return !(coords.x < boundaries.x.min || coords.x > boundaries.x.max || coords.y < boundaries.y.min || coords.y > boundaries.y.max);
};

/*
  @param {String} string
  @returns {String}
*/


Utils.truncate = function(string, length) {
  if (length == null) {
    length = 10;
  }
  if (string.length > length) {
    return string.substr(0, length - 3) + "...";
  } else {
    return string;
  }
};

module.exports = Utils;


},{"__browserify_Buffer":3,"__browserify_process":1}],7:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/../node_modules/grunt-watchify/node_modules/browserify/node_modules/browser-builtins/builtin/events.js",__dirname="/../node_modules/grunt-watchify/node_modules/browserify/node_modules/browser-builtins/builtin";if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (typeof emitter._events[type] === 'function')
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

},{"__browserify_Buffer":3,"__browserify_process":1}],8:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/operation.coffee",__dirname="/operations";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var EventEmitter, Operation, Queue,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

Queue = require("../vendor/queue.coffee");

EventEmitter = require("events").EventEmitter;

Operation = (function(_super) {
  var buildComposition;

  __extends(Operation, _super);

  Operation.prototype.renderPreview = true;

  /*
    @param {ImglyKit} app
    @param {Object} options
  */


  function Operation(app, options) {
    var apply;
    this.app = app;
    this.options = options != null ? options : {};
    apply = this.apply;
    this.apply = function(dataOrPromise) {
      var _this = this;
      return Queue(dataOrPromise).then(function(imageData) {
        return apply.call(_this, imageData);
      });
    };
  }

  /*
    @param {CanvasRenderingContext2d} context
  */


  Operation.prototype.setContext = function(context) {
    this.context = context;
  };

  /*
    @param {Object} options
  */


  Operation.prototype.setOptions = function(options) {
    var key, val;
    for (key in options) {
      val = options[key];
      this.options[key] = val;
    }
    return this.emit("updateOptions", options);
  };

  /*
    This applies this operation to the image in the editor. However, it is not
    responsible for storing the result in any way. It receives imageData and
    returns a modified version. 
    @param {ImageData} imageData
    @param {Function} callback
    @returns {ImageData}
  */


  Operation.prototype.apply = function() {
    throw Error("Abstract: Filter#apply");
  };

  buildComposition = function(direction, filter, args) {
    var composition, self;
    if (args == null) {
      args = [];
    }
    self = this;
    if (filter.prototype instanceof Operation) {
      filter = (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(filter, [this.app].concat(__slice.call(args)), function(){});
    }
    composition = direction === "pre" ? function(imageData) {
      return self.apply(filter.apply(imageData || this));
    } : direction === "post" ? function(imageData) {
      return filter.apply(self.apply(imageData || this));
    } : void 0;
    composition.compose = Operation.prototype.compose;
    composition.precompose = Operation.prototype.precompose;
    return composition;
  };

  /*
    @param {Operation} filter
    @returns {Function}
  */


  Operation.prototype.compose = function() {
    var args, filter;
    filter = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return buildComposition.call(this, "post", filter, args);
  };

  /*
    @param {Operation} filter
    @returns {Function}
  */


  Operation.prototype.precompose = function() {
    var args, filter;
    filter = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return buildComposition.call(this, "pre", filter, args);
  };

  return Operation;

})(EventEmitter);

module.exports = Operation;


},{"../vendor/queue.coffee":5,"__browserify_Buffer":3,"__browserify_process":1,"events":7}],9:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/filter.coffee",__dirname="/operations/filters";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Filter, Operation, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operation = require("../operation.coffee");

Filter = (function(_super) {
  __extends(Filter, _super);

  function Filter() {
    _ref = Filter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  return Filter;

})(Operation);

module.exports = Filter;


},{"../operation.coffee":8,"__browserify_Buffer":3,"__browserify_process":1}],10:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/filters/primitives/identity_filter.coffee",__dirname="/operations/filters/primitives";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Filter, IdentityFilter, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("../filter.coffee");

IdentityFilter = (function(_super) {
  __extends(IdentityFilter, _super);

  function IdentityFilter() {
    _ref = IdentityFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  IdentityFilter.prototype.apply = function(imageData) {
    return imageData;
  };

  return IdentityFilter;

})(Filter);

module.exports = IdentityFilter;


},{"../filter.coffee":9,"__browserify_Buffer":3,"__browserify_process":1}],11:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/photo_processor.coffee",__dirname="/";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var IdentityFilter, Perf, PhotoProcessor, Queue, Utils;

Perf = require("./vendor/perf.coffee");

Queue = require("./vendor/queue.coffee");

Utils = require("./utils.coffee");

IdentityFilter = require("./operations/filters/primitives/identity_filter.coffee");

PhotoProcessor = (function() {
  /*
    @param {imglyUtil} app
  */

  function PhotoProcessor(app) {
    this.app = app;
    this.canvas = null;
    this.operationChain = new IdentityFilter;
    this.operationChainNeedsRender = true;
    this.cachedPreviewImageData = null;
    this.previewOperation = null;
    this.rendering = false;
  }

  PhotoProcessor.prototype.setCanvas = function(canvas) {
    this.canvas = canvas;
  };

  PhotoProcessor.prototype.setSourceImage = function(sourceImage) {
    this.sourceImage = sourceImage;
  };

  /*
    @params {ImglyKit.Operations.Operation} operation
  */


  PhotoProcessor.prototype.setPreviewOperation = function(operation) {
    operation.setContext(this.canvas.getContext());
    this.previewOperation = operation;
    if (!operation.renderPreview) {
      return;
    }
    return this.renderPreview();
  };

  PhotoProcessor.prototype.unsetPreviewOperation = function() {
    this.previewOperation = null;
    return this.renderPreview();
  };

  PhotoProcessor.prototype.acceptPreviewOperation = function() {
    if (!this.previewOperation) {
      return;
    }
    this.operationChainNeedsRender = true;
    this.operationChain = this.operationChain.compose(this.previewOperation);
    this.previewOperation = null;
    return this.renderPreview();
  };

  /*
    Render the full size final image
  */


  PhotoProcessor.prototype.renderImage = function(options, callback) {
    var dimensions, height, imageData, p, scale, width, _ref, _ref1;
    p = new Perf("imglyPhotoProcessor#renderFullImage()", {
      debug: this.app.options.debug
    });
    p.start();
    if (!(options.maxSize || options.size)) {
      dimensions = {
        width: this.sourceImage.width,
        height: this.sourceImage.height
      };
      imageData = Utils.getImageDataForImage(this.sourceImage);
    } else if (options.maxSize) {
      _ref = options.maxSize.split("x"), width = _ref[0], height = _ref[1];
      options = {
        image: {
          width: this.sourceImage.width,
          height: this.sourceImage.height
        },
        container: {
          width: width - ImglyKit.canvasContainerPadding * 2,
          height: height - ImglyKit.canvasContainerPadding * 2
        }
      };
      dimensions = Utils.calculateCanvasSize(options);
      imageData = Utils.getResizedImageDataForImage(this.sourceImage, dimensions, {
        smooth: true
      });
    } else if (options.size) {
      _ref1 = options.size.split("x"), width = _ref1[0], height = _ref1[1];
      if (width && !height) {
        scale = this.sourceImage.height / this.sourceImage.width;
        height = width * scale;
      } else if (height && !width) {
        scale = this.sourceImage.width / this.sourceImage.height;
        width = height * scale;
      }
      dimensions = {
        width: parseInt(width),
        height: parseInt(height)
      };
      imageData = Utils.getResizedImageDataForImage(this.sourceImage, dimensions, {
        smooth: true
      });
    }
    return this.render(imageData, {
      preview: false
    }, callback);
  };

  /*
    Renders a preview
  */


  PhotoProcessor.prototype.renderPreview = function(callback) {
    return this.render(null, {
      preview: true
    }, callback);
  };

  /*
    Render preview or image
  */


  PhotoProcessor.prototype.render = function(imageData, options, callback) {
    /*
      Make sure we are not rendering multiple previews at a time
    */

    var p,
      _this = this;
    if (this.rendering) {
      return;
    }
    this.rendering = true;
    p = new Perf("imglyPhotoProcessor#render({ preview: " + options.preview + " })", {
      debug: this.app.options.debug
    });
    p.start();
    imageData = options.preview ? this.renderOperationChainPreview(imageData) : this.operationChain.apply(imageData);
    return Queue(imageData).then(function(imageData) {
      if (options.preview && _this.operationChainNeedsRender) {
        _this.cachedPreviewImageData = imageData;
        _this.operationChainNeedsRender = false;
      }
      if (_this.previewOperation && options.preview) {
        return _this.previewOperation.apply(imageData);
      } else {
        return imageData;
      }
    }).then(function(imageData) {
      if (options.preview) {
        _this.canvas.renderImageData(imageData);
      }
      if (typeof callback === "function") {
        callback(null, imageData);
      }
      _this.rendering = false;
      p.stop(true);
      return imageData;
    });
  };

  PhotoProcessor.prototype.renderOperationChainPreview = function(imageData) {
    var dimensions, imageDimensions;
    if (!this.operationChainNeedsRender) {
      return Utils.cloneImageData(this.cachedPreviewImageData);
    } else {
      dimensions = this.canvas.getDimensionsForImage(this.sourceImage);
      if (this.resizedPreviewImageData == null) {
        imageDimensions = {
          width: dimensions.width * (window.devicePixelRatio || 1),
          height: dimensions.height * (window.devicePixelRatio || 1)
        };
        this.resizedPreviewImageData = imageData = Utils.getResizedImageDataForImage(this.sourceImage, imageDimensions, {
          smooth: true
        });
      } else {
        imageData = Utils.cloneImageData(this.resizedPreviewImageData);
      }
      return this.operationChain.apply(imageData);
    }
  };

  /*
    Resets all UI elements
  */


  PhotoProcessor.prototype.reset = function() {
    this.operationChain = new IdentityFilter;
    this.previewOperation = null;
    this.rendering = false;
    this.operationChainNeedsRender = true;
    return this.resizedPreviewImageData = null;
  };

  return PhotoProcessor;

})();

module.exports = PhotoProcessor;


},{"./operations/filters/primitives/identity_filter.coffee":10,"./utils.coffee":6,"./vendor/perf.coffee":2,"./vendor/queue.coffee":5,"__browserify_Buffer":3,"__browserify_process":1}],12:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/ui/controls/base/control.coffee",__dirname="/ui/controls/base";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Control, EventEmitter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require("events").EventEmitter;

/*
  Basic class for an UI control. All other UI controls are derived from this
  class or one of its subclasses.
*/


Control = (function(_super) {
  __extends(Control, _super);

  /*
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
  */


  function Control(app, ui, controls) {
    var _base, _base1;
    this.app = app;
    this.ui = ui;
    this.controls = controls;
    this.domCreated = false;
    if (this.options == null) {
      this.options = {};
    }
    if ((_base = this.options).backButton == null) {
      _base.backButton = true;
    }
    if ((_base1 = this.options).showList == null) {
      _base1.showList = true;
    }
  }

  /*
    @param {imglyUtil.Operations.Operation}
  */


  Control.prototype.setOperation = function(operation) {
    this.operation = operation;
  };

  /*
    @param {Object} options
  */


  Control.prototype.init = function(options) {};

  /*
    Handle visibility
  */


  Control.prototype.show = function(cb) {
    return this.wrapper.fadeIn("fast", cb);
  };

  Control.prototype.hide = function(cb) {
    return this.wrapper.fadeOut("fast", cb);
  };

  /*
    Returns to the default view
  */


  Control.prototype.reset = function() {};

  /*
    Create "Back" and "Done" buttons
  */


  Control.prototype.createButtons = function() {
    var back, done,
      _this = this;
    if (this.buttons == null) {
      this.buttons = {};
    }
    /*
      "Back" Button
    */

    if (this.options.backButton) {
      back = $("<div>").addClass(ImglyKit.classPrefix + "controls-button-back").appendTo(this.wrapper);
      back.click(function() {
        return _this.emit("back");
      });
      this.buttons.back = back;
    }
    /*
      "Done" Button
    */

    done = $("<div>").addClass(ImglyKit.classPrefix + "controls-button-done").appendTo(this.wrapper);
    done.click(function() {
      return _this.emit("done");
    });
    return this.buttons.done = done;
  };

  Control.prototype.remove = function() {
    return this.wrapper.remove();
  };

  return Control;

})(EventEmitter);

module.exports = Control;


},{"__browserify_Buffer":3,"__browserify_process":1,"events":7}],13:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/ui/controls/base/list_control.coffee",__dirname="/ui/controls/base";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Control, ListControl, Utils, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Control = require("./control.coffee");

Utils = require("../../../utils.coffee");

/*
  The list control offers a list of available actions to the user that can
  be activated by activating one of the list items.
*/


ListControl = (function(_super) {
  __extends(ListControl, _super);

  function ListControl() {
    _ref = ListControl.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ListControl.prototype.displayBackApplyButtons = true;

  ListControl.prototype.init = function() {
    var option, _i, _len, _ref1, _results,
      _this = this;
    this.createList();
    if (!this.options.showList) {
      this.list.hide();
    }
    /*
      Add the list elements
    */

    _ref1 = this.listItems;
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      option = _ref1[_i];
      _results.push((function(option) {
        var cssClass, item;
        if (option.name == null) {
          return $("<li>").addClass(ImglyKit.classPrefix + "controls-item-space").appendTo(_this.list);
        }
        cssClass = option.cssClass || Utils.dasherize(option.name);
        item = $("<li>").addClass(ImglyKit.classPrefix + "controls-item").addClass(ImglyKit.classPrefix + "controls-item-" + cssClass).appendTo(_this.list);
        if (option.pixmap != null) {
          item.attr("style", "background-image: url('" + (_this.app.buildAssetsPath(option.pixmap)) + "'); background-size: 42px;");
        }
        if (option.tooltip != null) {
          item.attr("title", option.tooltip);
        }
        item.click(function(e) {
          return _this.handleOptionSelect(option, item);
        });
        if (option["default"] != null) {
          return item.click();
        }
      })(option));
    }
    return _results;
  };

  /*
    @param {ImglyKit.Operations.Operation}
  */


  ListControl.prototype.setOperation = function(operation) {
    var _this = this;
    this.operation = operation;
    this.updateOptions(this.operation.options);
    return this.operation.on("updateOptions", function(o) {
      return _this.updateOptions(o);
    });
  };

  /*
    @params {Object} options
  */


  ListControl.prototype.updateOptions = function(operationOptions) {
    this.operationOptions = $.extend({}, operationOptions);
  };

  /*
    @param {Object} option
    @param {jQuery.Object} item
  */


  ListControl.prototype.handleOptionSelect = function(option, item) {
    var activeClass, _ref1;
    this.setAllItemsInactive();
    activeClass = ImglyKit.classPrefix + "controls-list-item-active";
    item.addClass(activeClass);
    if (this.hasCanvasControls) {
      this.emit("provide_canvas_controls");
    }
    this.emit("select", $.extend({}, option, {
      options: $.extend({}, this.operationOptions, option.options, null)
    }));
    this.sentSelected = true;
    if (option.method != null) {
      (_ref1 = this.operation)[option.method].apply(_ref1, option["arguments"]);
    }
    if ((this.operation != null) && this.operation.renderPreview) {
      return this.emit("renderPreview");
    }
  };

  /*
    Create controls DOM tree
  */


  ListControl.prototype.createList = function() {
    this.wrapper = $("<div>").addClass(ImglyKit.classPrefix + "controls-wrapper").attr("data-control", this.constructor.name).appendTo(this.controls.getContainer());
    this.list = $("<ul>").addClass(ImglyKit.classPrefix + "controls-list").appendTo(this.wrapper);
    if (this.cssClassIdentifier != null) {
      this.list.addClass(ImglyKit.classPrefix + "controls-list-" + this.cssClassIdentifier);
    }
    if (this.displayBackApplyButtons) {
      this.list.addClass(ImglyKit.classPrefix + "controls-list-with-buttons");
      this.list.css("margin-right", this.controls.getHeight());
      return this.createButtons();
    }
  };

  /*
    Reset active states
  */


  ListControl.prototype.reset = function() {
    return this.setAllItemsInactive();
  };

  /*
    Sets all list items to inactive state
  */


  ListControl.prototype.setAllItemsInactive = function() {
    var activeClass;
    activeClass = ImglyKit.classPrefix + "controls-list-item-active";
    return this.list.find("li").removeClass(activeClass);
  };

  return ListControl;

})(Control);

module.exports = ListControl;


},{"../../../utils.coffee":6,"./control.coffee":12,"__browserify_Buffer":3,"__browserify_process":1}],14:[function(require,module,exports){
/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Control, SliderControl, _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Control = require("./control.coffee");

/*
  The slider control offers a visual slider that lets the user adjust a specific
  parameter.
*/


SliderControl = (function(_super) {
  __extends(SliderControl, _super);

  function SliderControl() {
    this.onMouseUp = __bind(this.onMouseUp, this);
    this.onMouseMove = __bind(this.onMouseMove, this);
    _ref = SliderControl.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  SliderControl.prototype.init = function() {
    var spaceForPlusAndMinus, width;
    spaceForPlusAndMinus = 60;
    width = this.controls.getContainer().width();
    width -= this.controls.getHeight() * 2;
    width -= spaceForPlusAndMinus;
    this.wrapper = $("<div>").addClass(ImglyKit.classPrefix + "controls-wrapper").attr("data-control", this.constructor.name).appendTo(this.controls.getContainer());
    this.sliderWrapper = $("<div>").addClass(ImglyKit.classPrefix + "controls-slider-wrapper").width(width).appendTo(this.wrapper);
    this.sliderCenterDot = $("<div>").addClass(ImglyKit.classPrefix + "controls-slider-dot").appendTo(this.sliderWrapper);
    this.sliderBar = $("<div>").addClass(ImglyKit.classPrefix + "controls-slider-bar").appendTo(this.sliderWrapper);
    this.slider = $("<div>").addClass(ImglyKit.classPrefix + "controls-slider").css({
      left: width / 2
    }).appendTo(this.sliderWrapper);
    /*
      Plus / Minus images
    */

    $("<div>").addClass(ImglyKit.classPrefix + "controls-slider-plus").appendTo(this.sliderWrapper);
    $("<div>").addClass(ImglyKit.classPrefix + "controls-slider-minus").appendTo(this.sliderWrapper);
    this.handleSliderControl();
    return this.createButtons();
  };

  /*
    Handles slider dragging
  */


  SliderControl.prototype.handleSliderControl = function() {
    var _this = this;
    this.sliderWidth = this.sliderWrapper.width();
    return this.slider.mousedown(function(e) {
      _this.lastX = e.clientX;
      _this.currentSliderLeft = parseInt(_this.slider.css("left"));
      $(document).mousemove(_this.onMouseMove);
      return $(document).mouseup(_this.onMouseUp);
    });
  };

  /*
    Is called when the slider has been moved
  
    @param {Integer} left
  */


  SliderControl.prototype.setSliderLeft = function(left) {
    var barWidth, normalized;
    this.slider.css({
      left: left
    });
    if (left < this.sliderWidth / 2) {
      barWidth = this.sliderWidth / 2 - left;
      this.sliderBar.css({
        left: left,
        width: barWidth
      });
    } else {
      barWidth = left - this.sliderWidth / 2;
      this.sliderBar.css({
        left: this.sliderWidth / 2,
        width: barWidth
      });
    }
    normalized = (left - this.sliderWidth / 2) / this.sliderWidth * 2;
    this.operation[this.valueSetMethod].apply(this.operation, [normalized]);
    return this.app.getPhotoProcessor().renderPreview();
  };

  /*
    Is called when the slider has been pressed and is being dragged
  
    @param {MouseEvent} e
  */


  SliderControl.prototype.onMouseMove = function(e) {
    var curX, deltaX, sliderLeft;
    curX = e.clientX;
    deltaX = curX - this.lastX;
    sliderLeft = Math.min(Math.max(0, this.currentSliderLeft + deltaX), this.sliderWidth);
    if (sliderLeft < this.sliderWidth && sliderLeft > 0) {
      this.lastX = curX;
      this.currentSliderLeft = sliderLeft;
    }
    return this.setSliderLeft(sliderLeft);
  };

  /*
    Is called when the slider has been pressed and is being dragged
  
    @param {MouseEvent} e
  */


  SliderControl.prototype.onMouseUp = function(e) {
    $(document).off("mouseup", this.onMouseUp);
    return $(document).off("mousemove", this.onMouseMove);
  };

  return SliderControl;

})(Control);

module.exports = SliderControl;


},{"./control.coffee":12}],15:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/ui/controls/brightness_control.coffee",__dirname="/ui/controls";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var BrightnessControl, SliderControl, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

SliderControl = require("./base/slider_control.coffee");

BrightnessControl = (function(_super) {
  __extends(BrightnessControl, _super);

  function BrightnessControl() {
    _ref = BrightnessControl.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  BrightnessControl.prototype.name = "Brightness";

  BrightnessControl.prototype.cssClass = "brightness";

  BrightnessControl.prototype.valueSetMethod = "setBrightness";

  return BrightnessControl;

})(SliderControl);

module.exports = BrightnessControl;


},{"./base/slider_control.coffee":14,"__browserify_Buffer":3,"__browserify_process":1}],16:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/ui/controls/contrast_control.coffee",__dirname="/ui/controls";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var ContrastControl, SliderControl, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

SliderControl = require("./base/slider_control.coffee");

ContrastControl = (function(_super) {
  __extends(ContrastControl, _super);

  function ContrastControl() {
    _ref = ContrastControl.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ContrastControl.prototype.name = "Contrast";

  ContrastControl.prototype.cssClass = "contrast";

  ContrastControl.prototype.valueSetMethod = "setContrast";

  return ContrastControl;

})(SliderControl);

module.exports = ContrastControl;


},{"./base/slider_control.coffee":14,"__browserify_Buffer":3,"__browserify_process":1}],17:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/math/vector2.coffee",__dirname="/math";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Vector2;

Vector2 = (function() {
  function Vector2(x, y) {
    this.x = x;
    this.y = y;
    if (this.x == null) {
      this.x = 0;
    }
    if (this.y == null) {
      this.y = 0;
    }
  }

  /*
    @param {Integer} x
    @param {Integer} y
  */


  Vector2.prototype.set = function(x, y) {
    this.x = x;
    this.y = y;
  };

  /*
    @returns {Vector2} A clone of this vector
  */


  Vector2.prototype.clone = function() {
    return new Vector2(this.x, this.y);
  };

  /*
    @param {ImglyKit.Vector2} The vector we want to copy
  */


  Vector2.prototype.copy = function(other) {
    this.x = other.x;
    this.y = other.y;
    return this;
  };

  /*
    @param {Integer|Vector2} Minimum value
    @param {Integer|Vector2} Maximum value
  */


  Vector2.prototype.clamp = function(minimum, maximum) {
    if (!(minimum instanceof Vector2)) {
      minimum = new Vector2(minimum, minimum);
    }
    if (!(maximum instanceof Vector2)) {
      maximum = new Vector2(maximum, maximum);
    }
    this.x = Math.max(minimum.x, Math.min(maximum.x, this.x));
    this.y = Math.max(minimum.y, Math.min(maximum.y, this.y));
    return this;
  };

  /*
    @param {Object|Rect} The object to multiply with. Must have `width` and `height`
  */


  Vector2.prototype.multiplyWithRect = function(multiplier) {
    this.x *= multiplier.width;
    this.y *= multiplier.height;
    return this;
  };

  /*
    @param {Integer|Vector2}
  */


  Vector2.prototype.divide = function(divisor) {
    if (divisor instanceof Vector2) {
      this.x /= divisor.x;
      this.y /= divisor.y;
    } else {
      this.x /= divisor;
      this.y /= divisor;
    }
    return this;
  };

  /*
    @param {Object|Rect} The object to multiply with. Must have `width` and `height`
  */


  Vector2.prototype.divideByRect = function(divisor) {
    this.x /= divisor.width;
    this.y /= divisor.height;
    return this;
  };

  /*
    @param {Integer|Vector2}
  */


  Vector2.prototype.substract = function(subtrahend) {
    if (subtrahend instanceof Vector2) {
      this.x -= subtrahend.x;
      this.y -= subtrahend.y;
    } else {
      this.x -= subtrahend;
      this.y -= subtrahend;
    }
    return this;
  };

  /*
    @param {Rect} The object to substract
  */


  Vector2.prototype.substractRect = function(subtrahend) {
    this.x -= subtrahend.width;
    this.y -= subtrahend.height;
    return this;
  };

  /*
    @param {Rect} The object to add
  */


  Vector2.prototype.addRect = function(addend) {
    this.x += addend.width;
    this.y += addend.height;
    return this;
  };

  /*
    @param {Integer|Vector2}
  */


  Vector2.prototype.add = function(addend) {
    if (addend instanceof Vector2) {
      this.x += addend.x;
      this.y += addend.y;
    } else {
      this.x += addend;
      this.y += addend;
    }
    return this;
  };

  Vector2.prototype.toString = function() {
    return "Vector2({ x: " + this.x + ", y: " + this.y + " })";
  };

  return Vector2;

})();

module.exports = Vector2;


},{"__browserify_Buffer":3,"__browserify_process":1}],18:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/math/rect.coffee",__dirname="/math";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Rect;

Rect = (function() {
  function Rect(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    if (this.x == null) {
      this.x = 0;
    }
    if (this.y == null) {
      this.y = 0;
    }
    if (this.width == null) {
      this.width = 0;
    }
    if (this.height == null) {
      this.height = 0;
    }
  }

  /*
    @param {Integer} x
    @param {Integer} y
    @param {Integer} width
    @param {Integer} height
  */


  Rect.prototype.set = function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  };

  /*
    @param {Integer} x
    @param {Integer} y
  */


  Rect.prototype.setPosition = function(x, y) {
    this.x = x;
    this.y = y;
  };

  /*
    @param {Integer} width
    @param {Integer} height
  */


  Rect.prototype.setDimensions = function(width, height) {
    this.width = width;
    this.height = height;
  };

  /*
    @param {ImglyKit.Rect} The vector we want to copy
  */


  Rect.prototype.copy = function(other) {
    this.x = other.x;
    this.y = other.y;
    this.width = other.width;
    this.height = other.height;
    return this;
  };

  Rect.prototype.toString = function() {
    return "Rect({ x: " + this.x + ", y: " + this.y + ", width: " + this.width + ", height: " + this.height + " })";
  };

  return Rect;

})();

module.exports = Rect;


},{"__browserify_Buffer":3,"__browserify_process":1}],19:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/operations/crop_operation.coffee",__dirname="/operations";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var CropOperation, Operation, Utils, Vector2,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operation = require("./operation.coffee");

Utils = require("../utils.coffee");

Vector2 = require("../math/vector2.coffee");

CropOperation = (function(_super) {
  __extends(CropOperation, _super);

  CropOperation.prototype.renderPreview = false;

  function CropOperation(app, options) {
    var _base, _base1, _base2;
    this.app = app;
    this.options = options != null ? options : {};
    this.setRatio = __bind(this.setRatio, this);
    CropOperation.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).start == null) {
      _base.start = new Vector2(0.1, 0.1);
    }
    if ((_base1 = this.options).end == null) {
      _base1.end = new Vector2(0.9, 0.9);
    }
    if ((_base2 = this.options).ratio == null) {
      _base2.ratio = 0;
    }
  }

  CropOperation.prototype.setRatio = function(ratio) {
    this.options.ratio = ratio;
    return this.setSize("square");
  };

  CropOperation.prototype.setSize = function(size) {
    var h, height, w, width, _ref;
    _ref = this.app.ui.getCanvas().getImageData(), width = _ref.width, height = _ref.height;
    this.options.size = size;
    this.options.start.set(0.1, 0.1);
    this.options.end.set(0.9, 0.9);
    switch (size) {
      case "square":
        this.options.ratio = 1;
        break;
      case "4:3":
        this.options.ratio = 4 / 3;
        break;
      case "16:9":
        this.options.ratio = 16 / 9;
        break;
      case "9:16":
        this.options.ratio = 9 / 16;
        break;
      case "free":
        this.options.ratio = 0;
    }
    if (this.options.ratio) {
      if (width / height <= this.options.ratio) {
        this.options.start.x = 0.1;
        this.options.end.x = 0.9;
        h = 1 / height * (width / this.options.ratio * 0.8);
        this.options.start.y = (1 - h) / 2;
        this.options.end.y = 1 - this.options.start.y;
      } else {
        this.options.start.y = 0.1;
        this.options.end.y = 0.9;
        w = 1 / width * (this.options.ratio * height * 0.8);
        this.options.start.x = (1 - w) / 2;
        this.options.end.x = 1 - this.options.start.x;
      }
    }
    return this.emit("updateOptions", this.options);
  };

  CropOperation.prototype.setStart = function(x, y) {
    this.options.start.x = x;
    return this.options.start.y = y;
  };

  CropOperation.prototype.setEnd = function(x, y) {
    this.options.end.x = x;
    return this.options.end.y = y;
  };

  CropOperation.prototype.apply = function(imageData) {
    var canvas, context, h, height, w, width, x, y;
    width = imageData.width, height = imageData.height;
    canvas = Utils.newCanvasFromImageData(imageData);
    context = canvas.getContext("2d");
    x = width * this.options.start.x;
    y = height * this.options.start.y;
    w = width * (this.options.end.x - this.options.start.x);
    h = height * (this.options.end.y - this.options.start.y);
    return context.getImageData(x, y, w, h);
  };

  return CropOperation;

})(Operation);

module.exports = CropOperation;


},{"../math/vector2.coffee":17,"../utils.coffee":6,"./operation.coffee":8,"__browserify_Buffer":3,"__browserify_process":1}],20:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/ui/controls/crop_control.coffee",__dirname="/ui/controls";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var CropControl, CropOperation, ListControl, Rect, Vector2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ListControl = require("./base/list_control.coffee");

Vector2 = require("../../math/vector2.coffee");

Rect = require("../../math/rect.coffee");

CropOperation = require("../../operations/crop_operation.coffee");

CropControl = (function(_super) {
  __extends(CropControl, _super);

  CropControl.prototype.minimumCropSize = 50;

  /*
    @param {ImglyKit} app
    @param {ImglyKit.UI} ui
    @param {ImglyKit.UI.Controls} controls
  */


  function CropControl(app, ui, controls) {
    this.app = app;
    this.ui = ui;
    this.controls = controls;
    CropControl.__super__.constructor.apply(this, arguments);
    this.listItems = [
      {
        name: "Square",
        cssClass: "square",
        method: "setSize",
        "arguments": ["square"],
        operation: CropOperation,
        tooltip: "Squared crop",
        "default": true,
        options: {
          size: "square"
        }
      }, {
        name: "4:3",
        cssClass: "4-3",
        method: "setSize",
        "arguments": ["4:3"],
        operation: CropOperation,
        tooltip: "4:3 crop",
        options: {
          size: "4:3"
        }
      }, {
        name: "16:9",
        cssClass: "16-9",
        method: "setSize",
        "arguments": ["16:9"],
        operation: CropOperation,
        tooltip: "16:9 crop",
        options: {
          size: "16:9"
        }
      }, {
        name: "9:16",
        cssClass: "9-16",
        method: "setSize",
        "arguments": ["9:16"],
        operation: CropOperation,
        tooltip: "9:16 crop",
        options: {
          size: "9:16"
        }
      }
    ];
  }

  CropControl.prototype.updateOptions = function(operationOptions) {
    this.operationOptions = operationOptions;
    return this.resizeCanvasControls();
  };

  /*
    @param {jQuery.Object} canvasControlsContainer
  */


  CropControl.prototype.hasCanvasControls = true;

  CropControl.prototype.setupCanvasControls = function(canvasControlsContainer) {
    var div, position, _i, _j, _len, _len1, _ref, _ref1;
    this.canvasControlsContainer = canvasControlsContainer;
    /*
      Create the dark parts around the cropped area
    */

    this.spotlightDivs = {};
    _ref = ["tl", "tc", "tr", "lc", "rc", "bl", "bc", "br"];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      position = _ref[_i];
      div = $("<div>").addClass(ImglyKit.classPrefix + "canvas-cropping-spotlight").addClass(ImglyKit.classPrefix + "canvas-cropping-spotlight-" + position).appendTo(this.canvasControlsContainer);
      this.spotlightDivs[position] = div;
    }
    /*
      Create the center div (cropped area)
    */

    this.centerDiv = $("<div>").addClass(ImglyKit.classPrefix + "canvas-cropping-center").appendTo(this.canvasControlsContainer);
    /*
      Create the knobs the user can use to resize the cropped area
    */

    this.knobs = {};
    _ref1 = ["tl", "tr", "bl", "br"];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      position = _ref1[_j];
      div = $("<div>").addClass(ImglyKit.classPrefix + "canvas-knob").appendTo(this.canvasControlsContainer);
      this.knobs[position] = div;
    }
    this.handleCenterDragging();
    this.handleTopLeftKnob();
    this.handleBottomRightKnob();
    this.handleBottomLeftKnob();
    return this.handleTopRightKnob();
  };

  /*
    Handles the dragging of the upper right knob
  */


  CropControl.prototype.handleTopRightKnob = function() {
    var knob,
      _this = this;
    knob = this.knobs.tr;
    return knob.mousedown(function(e) {
      var canvasRect, initialEnd, initialMousePosition, initialStart, ratio;
      canvasRect = new Rect(0, 0, _this.canvasControlsContainer.width(), _this.canvasControlsContainer.height());
      initialMousePosition = new Vector2(e.clientX, e.clientY);
      initialStart = _this.operationOptions.start.clone();
      initialEnd = _this.operationOptions.end.clone();
      ratio = _this.operationOptions.ratio;
      $(document).mouseup(function(e) {
        $(document).off("mouseup");
        return $(document).off("mousemove");
      });
      return $(document).mousemove(function(e) {
        var diffMousePosition, endInPixels, heightInPixels, startInPixels, widthInPixels;
        diffMousePosition = new Vector2(e.clientX, e.clientY).substract(initialMousePosition);
        endInPixels = new Vector2().copy(initialEnd).multiplyWithRect(canvasRect);
        startInPixels = new Vector2().copy(initialStart).multiplyWithRect(canvasRect);
        if (_this.operationOptions.ratio === 0) {
          _this.operationOptions.start.copy(startInPixels);
          _this.operationOptions.start.y += diffMousePosition.y;
          _this.operationOptions.start.clamp(new Vector2(startInPixels.x, 1), new Vector2(startInPixels.x, endInPixels.y - 50)).divideByRect(canvasRect);
          _this.operationOptions.end.copy(endInPixels);
          _this.operationOptions.end.x += diffMousePosition.x;
          _this.operationOptions.end.clamp(new Vector2(startInPixels.x + 50, endInPixels.y), new Vector2(canvasRect.width - 1, endInPixels.y)).divideByRect(canvasRect);
        } else {
          endInPixels.x += (diffMousePosition.x - diffMousePosition.y) / 2;
          endInPixels.clamp(startInPixels.x + 50, canvasRect.width - 1);
          widthInPixels = endInPixels.x - startInPixels.x;
          heightInPixels = widthInPixels / _this.operationOptions.ratio;
          if (endInPixels.y - heightInPixels < 1) {
            heightInPixels = _this.operationOptions.end.y * canvasRect.height - 1;
            widthInPixels = heightInPixels * _this.operationOptions.ratio;
          }
          _this.operationOptions.end.x = (startInPixels.x + widthInPixels) / canvasRect.width;
          _this.operationOptions.start.y = (endInPixels.y - heightInPixels) / canvasRect.height;
        }
        return _this.resizeCanvasControls();
      });
    });
  };

  /*
    Handles the dragging of the lower left knob
  */


  CropControl.prototype.handleBottomLeftKnob = function() {
    var knob,
      _this = this;
    knob = this.knobs.bl;
    return knob.mousedown(function(e) {
      var canvasRect, initialEnd, initialMousePosition, initialStart, ratio;
      canvasRect = new Rect(0, 0, _this.canvasControlsContainer.width(), _this.canvasControlsContainer.height());
      initialMousePosition = new Vector2(e.clientX, e.clientY);
      initialStart = _this.operationOptions.start.clone();
      initialEnd = _this.operationOptions.end.clone();
      ratio = _this.operationOptions.ratio;
      $(document).mouseup(function(e) {
        $(document).off("mouseup");
        return $(document).off("mousemove");
      });
      return $(document).mousemove(function(e) {
        var diffMousePosition, endInPixels, heightInPixels, startInPixels, widthInPixels;
        diffMousePosition = new Vector2(e.clientX, e.clientY).substract(initialMousePosition);
        endInPixels = new Vector2().copy(initialEnd).multiplyWithRect(canvasRect);
        startInPixels = new Vector2().copy(initialStart).multiplyWithRect(canvasRect);
        if (_this.operationOptions.ratio === 0) {
          _this.operationOptions.end.copy(endInPixels);
          _this.operationOptions.end.y += diffMousePosition.y;
          _this.operationOptions.end.clamp(new Vector2(endInPixels.x, startInPixels.y + 50), new Vector2(endInPixels.x, canvasRect.height - 1)).divideByRect(canvasRect);
          _this.operationOptions.start.copy(startInPixels);
          _this.operationOptions.start.x += diffMousePosition.x;
          _this.operationOptions.start.clamp(new Vector2(1, 1), new Vector2(endInPixels.x - 50, endInPixels.y - 50)).divideByRect(canvasRect);
        } else {
          startInPixels.x += (diffMousePosition.x - diffMousePosition.y) / 2;
          startInPixels.clamp(1, endInPixels.x - 50);
          widthInPixels = endInPixels.x - startInPixels.x;
          heightInPixels = widthInPixels / _this.operationOptions.ratio;
          if (startInPixels.y + heightInPixels > canvasRect.height - 1) {
            heightInPixels = (1 - _this.operationOptions.start.y) * canvasRect.height - 1;
            widthInPixels = heightInPixels * _this.operationOptions.ratio;
          }
          _this.operationOptions.start.x = (endInPixels.x - widthInPixels) / canvasRect.width;
          _this.operationOptions.end.y = (startInPixels.y + heightInPixels) / canvasRect.height;
        }
        return _this.resizeCanvasControls();
      });
    });
  };

  /*
    Handles the dragging of the lower right knob
  */


  CropControl.prototype.handleBottomRightKnob = function() {
    var knob,
      _this = this;
    knob = this.knobs.br;
    return knob.mousedown(function(e) {
      var canvasRect, initialEnd, initialMousePosition, ratio;
      canvasRect = new Rect(0, 0, _this.canvasControlsContainer.width(), _this.canvasControlsContainer.height());
      initialMousePosition = new Vector2(e.clientX, e.clientY);
      initialEnd = new Vector2().copy(_this.operationOptions.end);
      ratio = _this.operationOptions.ratio;
      $(document).mouseup(function(e) {
        $(document).off("mouseup");
        return $(document).off("mousemove");
      });
      return $(document).mousemove(function(e) {
        var diffMousePosition, endInPixels, height, heightInPixels, startInPixels, width, widthInPixels, _ref;
        diffMousePosition = new Vector2(e.clientX, e.clientY).substract(initialMousePosition);
        endInPixels = new Vector2().copy(initialEnd).multiplyWithRect(canvasRect);
        startInPixels = new Vector2().copy(_this.operationOptions.start).multiplyWithRect(canvasRect);
        if (_this.operationOptions.ratio === 0) {
          _this.operationOptions.end.copy(endInPixels).add(diffMousePosition).clamp(new Vector2(startInPixels.x + 50, startInPixels.y + 50), new Vector2(canvasRect.width - 1, canvasRect.height - 1)).divideByRect(canvasRect);
          _ref = _this.app.ui.getCanvas().getImageData(), width = _ref.width, height = _ref.height;
          widthInPixels = endInPixels.x - startInPixels.x;
        } else {
          endInPixels.x += (diffMousePosition.x + diffMousePosition.y) / 2;
          endInPixels.clamp(startInPixels.x + 50, canvasRect.width - 1);
          widthInPixels = endInPixels.x - startInPixels.x;
          heightInPixels = widthInPixels / _this.operationOptions.ratio;
          if (startInPixels.y + heightInPixels > canvasRect.height - 1) {
            heightInPixels = (1 - _this.operationOptions.start.y) * canvasRect.height - 1;
            widthInPixels = heightInPixels * _this.operationOptions.ratio;
          }
          _this.operationOptions.end.copy(_this.operationOptions.start).multiplyWithRect(canvasRect).add(new Vector2(widthInPixels, heightInPixels)).divideByRect(canvasRect);
        }
        return _this.resizeCanvasControls();
      });
    });
  };

  /*
    Handles the dragging of the upper left knob
  */


  CropControl.prototype.handleTopLeftKnob = function() {
    var knob,
      _this = this;
    knob = this.knobs.tl;
    return knob.mousedown(function(e) {
      var canvasRect, initialMousePosition, initialStart, ratio;
      canvasRect = new Rect(0, 0, _this.canvasControlsContainer.width(), _this.canvasControlsContainer.height());
      initialMousePosition = new Vector2(e.clientX, e.clientY);
      initialStart = new Vector2().copy(_this.operationOptions.start);
      ratio = _this.operationOptions.ratio;
      $(document).mouseup(function(e) {
        $(document).off("mouseup");
        return $(document).off("mousemove");
      });
      return $(document).mousemove(function(e) {
        var diffMousePosition, endInPixels, heightInPixels, startInPixels, widthInPixels;
        diffMousePosition = new Vector2(e.clientX, e.clientY).substract(initialMousePosition);
        if (_this.operationOptions.ratio === 0) {
          endInPixels = new Vector2().copy(_this.operationOptions.end).multiplyWithRect(canvasRect);
          _this.operationOptions.start.copy(initialStart).multiplyWithRect(canvasRect).add(diffMousePosition).clamp(new Vector2(1, 1), new Vector2(endInPixels.x - 50, endInPixels.y - 50)).divideByRect(canvasRect);
        } else {
          endInPixels = new Vector2().copy(_this.operationOptions.end).multiplyWithRect(canvasRect);
          startInPixels = new Vector2().copy(initialStart).multiplyWithRect(canvasRect);
          startInPixels.x += (diffMousePosition.x + diffMousePosition.y) / 2;
          startInPixels.clamp(1, endInPixels.x - 50);
          widthInPixels = endInPixels.x - startInPixels.x;
          heightInPixels = widthInPixels / _this.operationOptions.ratio;
          if (endInPixels.y - heightInPixels < 1) {
            heightInPixels = _this.operationOptions.end.y * canvasRect.height - 1;
            widthInPixels = heightInPixels * _this.operationOptions.ratio;
          }
          _this.operationOptions.start.copy(_this.operationOptions.end).multiplyWithRect(canvasRect).substract(new Vector2(widthInPixels, heightInPixels)).divideByRect(canvasRect);
        }
        return _this.resizeCanvasControls();
      });
    });
  };

  /*
    Handles the dragging of the visible, cropped part
  */


  CropControl.prototype.handleCenterDragging = function() {
    var _this = this;
    return this.centerDiv.mousedown(function(e) {
      var canvasRect, centerRect, initialEnd, initialMousePosition, initialStart, max, min;
      canvasRect = new Rect(0, 0, _this.canvasControlsContainer.width(), _this.canvasControlsContainer.height());
      min = new Vector2(1, 1);
      max = new Vector2(canvasRect.width - _this.centerDiv.width() - 1, canvasRect.height - _this.centerDiv.height() - 1);
      initialMousePosition = new Vector2(e.clientX, e.clientY);
      initialStart = new Vector2().copy(_this.operationOptions.start);
      initialEnd = new Vector2().copy(_this.operationOptions.end);
      centerRect = new Rect(0, 0, _this.centerDiv.width(), _this.centerDiv.height());
      $(document).mouseup(function(e) {
        $(document).off("mouseup");
        return $(document).off("mousemove");
      });
      return $(document).mousemove(function(e) {
        var currentMousePosition, diffMousePosition;
        currentMousePosition = new Vector2(e.clientX, e.clientY);
        diffMousePosition = new Vector2().copy(currentMousePosition).substract(initialMousePosition);
        _this.operationOptions.start.copy(initialStart).multiplyWithRect(canvasRect).add(diffMousePosition).clamp(min, max).divideByRect(canvasRect);
        _this.operationOptions.end.copy(_this.operationOptions.start).multiplyWithRect(canvasRect).addRect(centerRect).divideByRect(canvasRect);
        return _this.resizeCanvasControls();
      });
    });
  };

  CropControl.prototype.updateOperationOptions = function() {
    var canvasHeight, canvasWidth;
    canvasWidth = this.canvasControlsContainer.width();
    canvasHeight = this.canvasControlsContainer.height();
    this.operation.setStart(this.operationOptions.start.x / canvasWidth, this.operationOptions.start.y / canvasHeight);
    return this.operation.setEnd(this.operationOptions.end.x / canvasWidth, this.operationOptions.end.y / canvasHeight);
  };

  CropControl.prototype.resizeCanvasControls = function() {
    var $el, bottomHeight, canvasRect, centerHeight, centerWidth, el, leftWidth, rightWidth, scaledEnd, scaledStart, topHeight, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
    canvasRect = new Rect(0, 0, this.canvasControlsContainer.width(), this.canvasControlsContainer.height());
    scaledStart = new Vector2().copy(this.operationOptions.start).multiplyWithRect(canvasRect);
    scaledEnd = new Vector2().copy(this.operationOptions.end).multiplyWithRect(canvasRect);
    /*
      Set fragment widths
    */

    leftWidth = scaledStart.x;
    _ref = ["tl", "lc", "bl"];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      el = _ref[_i];
      $el = this.spotlightDivs[el];
      $el.css({
        width: leftWidth,
        left: 0
      });
      if (this.knobs[el] != null) {
        this.knobs[el].css({
          left: leftWidth
        });
      }
    }
    centerWidth = scaledEnd.x - scaledStart.x;
    _ref1 = ["tc", "bc"];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      el = _ref1[_j];
      $el = this.spotlightDivs[el];
      $el.css({
        width: centerWidth,
        left: leftWidth
      });
    }
    rightWidth = canvasRect.width - centerWidth - leftWidth;
    _ref2 = ["tr", "rc", "br"];
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      el = _ref2[_k];
      $el = this.spotlightDivs[el];
      $el.css({
        width: rightWidth,
        left: leftWidth + centerWidth
      });
      if (this.knobs[el] != null) {
        this.knobs[el].css({
          left: leftWidth + centerWidth
        });
      }
    }
    /*
      Set fragment heights
    */

    topHeight = scaledStart.y;
    _ref3 = ["tl", "tc", "tr"];
    for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
      el = _ref3[_l];
      $el = this.spotlightDivs[el];
      $el.css({
        height: topHeight,
        top: 0
      });
      if (this.knobs[el] != null) {
        this.knobs[el].css({
          top: topHeight
        });
      }
    }
    centerHeight = scaledEnd.y - scaledStart.y;
    _ref4 = ["lc", "rc"];
    for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
      el = _ref4[_m];
      $el = this.spotlightDivs[el];
      $el.css({
        height: centerHeight,
        top: topHeight
      });
    }
    bottomHeight = canvasRect.height - topHeight - centerHeight;
    _ref5 = ["bl", "bc", "br"];
    for (_n = 0, _len5 = _ref5.length; _n < _len5; _n++) {
      el = _ref5[_n];
      $el = this.spotlightDivs[el];
      $el.css({
        height: bottomHeight,
        top: topHeight + centerHeight
      });
      if (this.knobs[el] != null) {
        this.knobs[el].css({
          top: topHeight + centerHeight
        });
      }
    }
    /*
      Set center fragment dimensions and position
    */

    return this.centerDiv.css({
      height: centerHeight,
      width: centerWidth,
      left: leftWidth,
      top: topHeight
    });
  };

  return CropControl;

})(ListControl);

module.exports = CropControl;


},{"../../math/rect.coffee":18,"../../math/vector2.coffee":17,"../../operations/crop_operation.coffee":19,"./base/list_control.coffee":13,"__browserify_Buffer":3,"__browserify_process":1}],21:[function(require,module,exports){
/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/


  

CropControl = require("./crop_control.coffee");



  /*
    @param {ImglyKit} app
    @param {ImglyKit.UI} ui
    @param {ImglyKit.UI.Controls} controls
  */


  MainMenuControl.prototype.displayBackApplyButtons = false;

  function MainMenuControl(app, ui, controls) {
    this.app = app;
    this.ui = ui;
    this.controls = controls;
    MainMenuControl.__super__.constructor.apply(this, arguments);
    this.listItems = [
      {
        name: "Crop",
        cssClass: "crop",
        controls: CropControl,
        operation: CropOperation,
        tooltip: "Crop"
      }
    ];
  }

  return MainMenuControl;

})(ListControl);

module.exports = MainMenuControl;


},{"../../operations/brightness_operation.coffee":74,"../../operations/contrast_operation.coffee":75,"../../operations/crop_operation.coffee":19,"../../operations/frames_operation.coffee":65,"../../operations/saturation_operation.coffee":76,"../../operations/text_operation.coffee":73,"./base/list_control.coffee":13,"./brightness_control.coffee":15,"./contrast_control.coffee":16,"./crop_control.coffee":20,"./filters_control.coffee":60,"./focus_control.coffee":64,"./frames_control.coffee":66,"./orientation_control.coffee":68,"./saturation_control.coffee":69,"./stickers_control.coffee":71,"./text_control.coffee":72,"__browserify_Buffer":3,"__browserify_process":1}],78:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/ui/controls.coffee",__dirname="/ui";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Controls, EventEmitter, MainMenuControl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MainMenuControl = require("./controls/main_menu_control.coffee");

EventEmitter = require("events").EventEmitter;

Controls = (function(_super) {
  __extends(Controls, _super);

  /*
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
  */


  function Controls(app, ui) {
    this.app = app;
    this.ui = ui;
    this.container = this.app.getContainer();
    this.init();
  }

  /*
    @returns {Integer} Height of the controls container
  */


  Controls.prototype.getHeight = function() {
    return this.controlsContainer.height();
  };

  /*
    @returns {jQuery.Object} The controls container
  */


  Controls.prototype.getContainer = function() {
    return this.controlsContainer;
  };

  /*
    @returns {ImglyKit.UI.Controls.Base}
  */


  Controls.prototype.getCurrentControls = function() {
    return this.currentControls;
  };

  /*
    Initializes the container
  */


  Controls.prototype.init = function() {
    this.controlsContainer = $("<div>").addClass(ImglyKit.classPrefix + "controls-container").appendTo(this.container);
    return this.initMainMenuControl();
  };

  /*
    Initialize the MainMenuControl
  */


  Controls.prototype.initMainMenuControl = function() {
    this.currentControls = this.MainMenuControl = new MainMenuControl(this.app, this.ui, this);
    this.attachEvents(this.currentControls);
    this.MainMenuControl.init();
    if (this.app.options.initialControls == null) {
      return this.MainMenuControl.show();
    }
  };

  /*
    Attach select events
  */


  Controls.prototype.attachEvents = function(controls) {
    var _this = this;
    controls.on("select", function(option) {
      if (option.controls != null) {
        _this.switchToControls(option.controls, controls);
      }
      if (option.operation != null) {
        return _this.emit("preview_operation", new option.operation(_this.app, $.extend({}, option.options)));
      }
    });
    controls.once("provide_canvas_controls", function() {
      var canvasControlsContainer;
      canvasControlsContainer = _this.ui.getCanvas().getControlsContainer();
      _this.currentControls.setupCanvasControls(canvasControlsContainer);
      return canvasControlsContainer.fadeIn("slow");
    });
    controls.on("back", function() {
      return _this.emit("back");
    });
    controls.on("done", function() {
      return _this.emit("done");
    });
    return controls.on("renderPreview", function() {
      return _this.app.getPhotoProcessor().renderPreview();
    });
  };

  /*
    Switch to another controls instance
  */


  Controls.prototype.switchToControls = function(controlsClass, oldControls, options) {
    var key, value,
      _this = this;
    if (options == null) {
      options = {};
    }
    this.currentControls = new controlsClass(this.app, this.ui, this);
    for (key in options) {
      value = options[key];
      this.currentControls.options[key] = value;
    }
    this.attachEvents(this.currentControls);
    this.currentControls.init();
    return oldControls.hide(function() {
      return _this.currentControls.show();
    });
  };

  /*
    Returns to the default view
  */


  Controls.prototype.reset = function() {
    var _ref,
      _this = this;
    this.MainMenuControl.reset();
    this.ui.getCanvas().getControlsContainer().hide().html("");
    return (_ref = this.currentControls) != null ? _ref.hide(function() {
      _this.currentControls.remove();
      return _this.MainMenuControl.show();
    }) : void 0;
  };

  return Controls;

})(EventEmitter);

module.exports = Controls;


},{"./controls/main_menu_control.coffee":77,"__browserify_Buffer":3,"__browserify_process":1,"events":7}],79:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/ui/canvas.coffee",__dirname="/ui";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Canvas, Utils;

Utils = require("../utils.coffee");

Canvas = (function() {
  /*
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
    @param {Integer} options.height Height of the controls
  
    @todo Get controls height from elsewhere. The options hash
          is probably not a good place for that.
  */

  function Canvas(app, ui, options) {
    this.app = app;
    this.ui = ui;
    this.options = options;
    this.container = this.app.getContainer();
    this.init();
  }

  /*
    @returns {CanvasRenderingContext2d}
  */


  Canvas.prototype.getContext = function() {
    return this.context;
  };

  /*
    @returns {ImageData}
  */


  Canvas.prototype.getImageData = function() {
    return this.context.getImageData(0, 0, this.canvasDom.width, this.canvasDom.height);
  };

  /*
    Initializes the container, creates
    the canvas object
  */


  Canvas.prototype.init = function() {
    this.canvasContainer = $("<div>").addClass(ImglyKit.classPrefix + "canvas-container").css({
      height: this.app.getHeight() - this.options.height
    }).appendTo(this.container);
    this.canvas = $("<canvas>").addClass(ImglyKit.classPrefix + "canvas").appendTo(this.canvasContainer);
    this.canvasDom = this.canvas.get(0);
    this.controlsContainer = $("<div>").addClass(ImglyKit.classPrefix + "canvas-controls-container").appendTo(this.canvasContainer);
    return this.context = this.canvasDom.getContext("2d");
  };

  /*
    Resizes the canvas and renders the given imageData
  
    @param {ImageData} imageData
  */


  Canvas.prototype.renderImageData = function(imageData) {
    var imageDataCanvas;
    this.resizeAndPositionCanvasToMatch(imageData);
    imageDataCanvas = Utils.newCanvasFromImageData(imageData);
    this.context.clearRect(0, 0, this.canvasDom.width, this.canvasDom.height);
    return this.context.drawImage(imageDataCanvas, 0, 0, imageData.width, imageData.height, 0, 0, this.canvasDom.width, this.canvasDom.height);
  };

  /*
    Resizes the canvas and renders the given image
  
    @param {Image} image
  */


  Canvas.prototype.renderImage = function(image) {
    this.resizeAndPositionCanvasToMatch(image);
    this.context.clearRect(0, 0, this.canvasDom.width, this.canvasDom.height);
    return this.context.drawImage(image, 0, 0, image.width, image.height, 0, 0, this.canvasDom.width, this.canvasDom.height);
  };

  /*
    Takes an image and returns the new dimensions
    so that it fits into the UI
  
    @param {Image} image
    @returns {Object} dimensions
    @returns {Integer} dimensions.width
    @returns {Integer} dimensions.height
  */


  Canvas.prototype.getDimensionsForImage = function(image) {
    var options;
    options = {
      image: {
        width: image.width,
        height: image.height
      },
      container: {
        width: this.canvasContainer.width() - ImglyKit.canvasContainerPadding * 2,
        height: this.canvasContainer.height() - ImglyKit.canvasContainerPadding * 2
      }
    };
    return Utils.calculateCanvasSize(options);
  };

  /*
    @returns {jQuery.Object}
  */


  Canvas.prototype.getControlsContainer = function() {
    return this.controlsContainer;
  };

  /*
    @param {Mixed} object
    @param {Integer} object.height
    @param {Integer} object.width
  */


  Canvas.prototype.resizeAndPositionCanvasToMatch = function(obj) {
    var newCanvasSize, options;
    options = {
      image: {
        width: obj.width,
        height: obj.height
      },
      container: {
        width: this.canvasContainer.width() - ImglyKit.canvasContainerPadding * 2,
        height: this.canvasContainer.height() - ImglyKit.canvasContainerPadding * 2
      }
    };
    newCanvasSize = Utils.calculateCanvasSize(options);
    this.canvas.css({
      width: newCanvasSize.width,
      height: newCanvasSize.height,
      top: Math.round((this.canvasContainer.height() - newCanvasSize.height) / 2),
      left: Math.round((this.canvasContainer.width() - newCanvasSize.width) / 2)
    });
    this.controlsContainer.css({
      width: newCanvasSize.width,
      height: newCanvasSize.height,
      top: this.canvas.position().top,
      left: this.canvas.position().left
    });
    this.canvasDom.width = newCanvasSize.width * (window.devicePixelRatio || 1);
    return this.canvasDom.height = newCanvasSize.height * (window.devicePixelRatio || 1);
  };

  /*
    Clears the context
  */


  Canvas.prototype.reset = function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    return this.controlsContainer.html("");
  };

  return Canvas;

})();

module.exports = Canvas;


},{"../utils.coffee":6,"__browserify_Buffer":3,"__browserify_process":1}],80:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/ui/ui.coffee",__dirname="/ui";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Canvas, Controls, EventEmitter, UI,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controls = require("./controls.coffee");

Canvas = require("./canvas.coffee");

EventEmitter = require("events").EventEmitter;

UI = (function(_super) {
  __extends(UI, _super);

  /*
    @param {imglyUtil} app
  */


  function UI(app) {
    this.app = app;
    this.initialized = false;
  }

  /*
    @returns {ImglyKit.UI.Canvas}
  */


  UI.prototype.getCanvas = function() {
    return this.canvas;
  };

  /*
    @returns ImglyKit.UI.Controls.Base
  */


  UI.prototype.getCurrentControls = function() {
    return this.controls.getCurrentControls();
  };

  /*
    Initializes all UI elements
  */


  UI.prototype.init = function() {
    var _this = this;
    this.controls = new Controls(this.app, this);
    this.controls.on("preview_operation", function(operation) {
      return _this.emit("preview_operation", operation);
    });
    this.controls.on("back", function() {
      return _this.emit("back");
    });
    this.controls.on("done", function() {
      return _this.emit("done");
    });
    this.canvas = new Canvas(this.app, this, {
      height: this.controls.getHeight()
    });
    return this.initialized = true;
  };

  /*
    Resets the controls
  */


  UI.prototype.resetControls = function() {
    return this.controls.reset();
  };

  return UI;

})(EventEmitter);

module.exports = UI;


},{"./canvas.coffee":79,"./controls.coffee":78,"__browserify_Buffer":3,"__browserify_process":1,"events":7}],81:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/imgly_kit.coffee",__dirname="/";/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var ImglyKit, PhotoProcessor, UI, Utils,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

PhotoProcessor = require("./photo_processor.coffee");

UI = require("./ui/ui.coffee");

Utils = require("./utils.coffee");

window.after = function(t, f) {
  return setTimeout(f, t);
};

window.every = function(t, f) {
  return setInterval(f, t);
};

ImglyKit = (function() {
  ImglyKit.classPrefix = "imgly-";

  ImglyKit.canvasContainerPadding = 15;

  /*
    @param options.container The container we ImglyKit will run in
    @param options.additionalFonts Array with objects like to specify additional fonts [{
          name: "Lobster",
          cssClass: "lobster"
        },
        {
          name: "Titillium Web",
          cssClass: "titillium-web"
        }]
  */


  function ImglyKit(options) {
    var _base, _base1;
    this.options = options != null ? options : {};
    this.onImageLoaded = __bind(this.onImageLoaded, this);
    if ((_base = this.options).debug == null) {
      _base.debug = false;
    }
    if ((_base1 = this.options).assetsPath == null) {
      _base1.assetsPath = "/build/assets";
    }
    if (this.options.container == null) {
      throw new Error("No container given");
    }
    this.options.container = $(this.options.container);
    this.options.container.addClass(ImglyKit.classPrefix + "container");
    this.photoProcessor = new PhotoProcessor(this);
    this.ui = new UI(this);
  }

  /*
    @returns {Boolean} Whether Canvas and Canvastext is supported or not
  */


  ImglyKit.prototype.checkSupport = function() {
    var error;
    if (Modernizr.canvas && Modernizr.canvastext) {
      return true;
    }
    error = new Error("Canvas and / or Canvas Text drawing not supported");
    error.name = "NoSupportError";
    error.description = "No Canvas support";
    throw error;
  };

  /*
    @returns {jQuery.Object} The jQuery object for the app container
  */


  ImglyKit.prototype.getContainer = function() {
    return this.options.container;
  };

  /*
    @returns {Integer} The height of the app container
  */


  ImglyKit.prototype.getHeight = function() {
    return this.options.container.height();
  };

  /*
    @returns {ImglyKit.PhotoProcessor}
  */


  ImglyKit.prototype.getPhotoProcessor = function() {
    return this.photoProcessor;
  };

  /*
    @param {String} file path
    @returns {String} assets file path
  */


  ImglyKit.prototype.buildAssetsPath = function(path) {
    return this.options.assetsPath + "/" + path;
  };

  /*
    @param {Image|String} image Data URL or Image object
  */


  ImglyKit.prototype.run = function(image) {
    var dataUrl, error,
      _this = this;
    this.image = image;
    this.checkSupport();
    if (this.options.ratio != null) {
      this.options.initialControls = require("./ui/controls/crop_control.coffee");
      this.options.forceInitialControls = true;
      this.options.operationOptionsHook = function(operation) {
        return operation.setRatio(_this.options.ratio);
      };
    }
    if (!(typeof this.image === "string" || this.image instanceof Image)) {
      throw new Error("First parameter needs to be a String or an Image");
    }
    if (typeof this.image === "string") {
      if (this.image.slice(0, 10) !== "data:image") {
        error = new Error("First parameter is a string, but not an image data URL");
        error.name = "InvalidError";
        throw error;
      }
      dataUrl = this.image;
      this.image = new Image();
      this.image.src = dataUrl;
    }
    if (this.image.width > 0 && this.image.height > 0) {
      return this.onImageLoaded();
    } else {
      return this.image.onload = this.onImageLoaded;
    }
  };

  /*
    Gets called as soon as the image has been loaded
    and the image dimensions are available
  */


  ImglyKit.prototype.onImageLoaded = function() {
    /*
      Set up the user interface
    */

    var _this = this;
    if (!this.ui.initialized) {
      this.ui.init();
      this.photoProcessor.setCanvas(this.ui.getCanvas());
      this.ui.on("preview_operation", function(operation) {
        var _ref;
        if ((_ref = _this.ui.getCurrentControls()) != null) {
          _ref.setOperation(operation);
        }
        return _this.photoProcessor.setPreviewOperation(operation);
      });
      this.ui.on("back", function() {
        _this.photoProcessor.unsetPreviewOperation();
        return _this.ui.resetControls();
      });
      this.ui.on("done", function() {
        _this.photoProcessor.acceptPreviewOperation();
        return _this.ui.resetControls();
      });
    } else {
      this.photoProcessor.reset();
      this.ui.resetControls();
    }
    /*
      Reset everything
    */

    this.reset();
    /*
      Set source image of the photo processor and tell
      it to render it
    */

    this.photoProcessor.setSourceImage(this.image);
    return this.photoProcessor.renderPreview(function(err) {
      /*
        Do we have controls that have to be shown
        on startup?
      */

      var controls;
      if (_this.options.initialControls) {
        controls = _this.ui.controls;
        controls.switchToControls(_this.options.initialControls, controls.getCurrentControls(), {
          backButton: !_this.options.forceInitialControls,
          showList: !_this.options.forceInitialControls
        });
        if (_this.options.operationOptionsHook != null) {
          return _this.options.operationOptionsHook(controls.getCurrentControls().operation);
        }
      }
    });
  };

  /*
    Resets everything
  */


  ImglyKit.prototype.reset = function() {
    return this.photoProcessor.reset();
  };

  /*
    Renders the image and returns a data url
  */


  ImglyKit.prototype.renderToDataURL = function(format, options, callback) {
    var _this = this;
    if (options == null) {
      options = {};
    }
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    return this.photoProcessor.renderImage(options, function(err, imageData) {
      var canvas;
      canvas = Utils.newCanvasFromImageData(imageData);
      return callback(null, canvas.toDataURL(format));
    });
  };

  return ImglyKit;

})();

window.ImglyKit = ImglyKit;


},{"./photo_processor.coffee":11,"./ui/controls/crop_control.coffee":20,"./ui/ui.coffee":80,"./utils.coffee":6,"__browserify_Buffer":3,"__browserify_process":1}],73:[function(require,module,exports){
/*
  ImglyKit
  Copyright (c) 2013-2014 img.ly
*/

var Operation, Rect, TextOperation, Utils, Vector2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operation = require("./operation.coffee");

Utils = require("../utils.coffee");

Vector2 = require("../math/vector2.coffee");

Rect = require("../math/rect.coffee");

TextOperation = (function(_super) {
  __extends(TextOperation, _super);

  TextOperation.prototype.renderPreview = false;

  function TextOperation(app, options) {
    var _base, _base1, _base2, _base3, _base4, _base5, _base6, _base7, _base8;
    this.app = app;
    this.options = options != null ? options : {};
    TextOperation.__super__.constructor.apply(this, arguments);
    (_base = this.options).start || (_base.start = new Vector2(0.2, 0.2));
    (_base1 = this.options).width || (_base1.width = 300);
    (_base2 = this.options).text || (_base2.text = "Text");
    (_base3 = this.options).color || (_base3.color = "rgba(255, 255, 255, 1.0)");
    (_base4 = this.options).backgroundColor || (_base4.backgroundColor = "rgba(0, 0, 0, 0.5)");
    (_base5 = this.options).fontSize || (_base5.fontSize = 0.1);
    (_base6 = this.options).lineHeight || (_base6.lineHeight = 1.1);
    (_base7 = this.options).paddingLeft || (_base7.paddingLeft = 0);
    (_base8 = this.options).paddingTop || (_base8.paddingTop = 0);
  }

  /*
    @param {String} font
  */


  TextOperation.prototype.setFont = function(font) {
    this.options.font = font;
    return this.emit("updateOptions", this.options);
  };

  TextOperation.prototype.apply = function(imageData) {
    var boundingBoxHeight, boundingBoxWidth, canvas, context, line, lineHeight, lineNum, lineOffset, lineWidth, padding, paddingVector, scaledFontSize, scaledStart, _i, _j, _len, _len1, _ref, _ref1;
    scaledFontSize = this.options.fontSize * imageData.height;
    paddingVector = new Vector2(this.options.paddingLeft, this.options.paddingTop);
    scaledStart = new Vector2().copy(this.options.start).add(paddingVector).multiplyWithRect(imageData);
    canvas = Utils.newCanvasFromImageData(imageData);
    context = canvas.getContext("2d");
    context.font = "normal " + scaledFontSize + "px " + this.options.font;
    context.textBaseline = "hanging";
    lineHeight = this.options.lineHeight;
    boundingBoxWidth = 0;
    boundingBoxHeight = 0;
    _ref = this.options.text.split("\n");
    for (lineNum = _i = 0, _len = _ref.length; _i < _len; lineNum = ++_i) {
      line = _ref[lineNum];
      lineWidth = context.measureText(line).width;
      if (lineWidth > boundingBoxWidth) {
        boundingBoxWidth = lineWidth;
      }
      boundingBoxHeight += scaledFontSize * lineHeight;
    }
    context.fillStyle = this.options.backgroundColor;
    padding = 10;
    context.fillRect(scaledStart.x - padding, scaledStart.y - padding, boundingBoxWidth + padding * 2, boundingBoxHeight + padding);
    context.fillStyle = this.options.color;
    _ref1 = this.options.text.split("\n");
    for (lineNum = _j = 0, _len1 = _ref1.length; _j < _len1; lineNum = ++_j) {
      line = _ref1[lineNum];
      lineOffset = lineNum * scaledFontSize * lineHeight;
      context.fillText(line, scaledStart.x, scaledStart.y + this.options.paddingLeft + lineOffset);
    }
    return context.getImageData(0, 0, imageData.width, imageData.height);
  };

  return TextOperation;

})(Operation);

module.exports = TextOperation;


},{"../math/rect.coffee":18,"../math/vector2.coffee":17,"../utils.coffee":6,"./operation.coffee":8}]},{},[81])
;