'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');
var deepmerge = require('deepmerge');

var connect = function connect(component) {
  for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    params[_key - 1] = arguments[_key];
  }

  var createConnection = function createConnection(reducer, createActions, initialState, collect) {
    var attach = function attach(instance) {
      return {
        getState: function getState() {
          return instance.state;
        },
        dispatch: createDispatcher(reducer, function (fn) {
          return new Promise(function (resolve) {
            return instance.setState(fn, resolve);
          });
        })
      };
    };

    var createDispatcher = function createDispatcher(reducer, set) {
      return function (type) {
        var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return set(function (state) {
          return reducer(state, Object.assign({ type: type }, params));
        });
      };
    };

    var Connected = function (_React$PureComponent) {
      _inherits(Connected, _React$PureComponent);

      function Connected(props, context) {
        _classCallCheck(this, Connected);

        var _this = _possibleConstructorReturn(this, (Connected.__proto__ || Object.getPrototypeOf(Connected)).call(this, props, context));

        _this.state = collect ? deepmerge.all([initialState || {}, props]) : initialState || {};
        _this.actions = createActions(attach(_this));
        return _this;
      }

      _createClass(Connected, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
          if (collect) {
            this.setState(function (state) {
              return deepmerge.all([state, nextProps]);
            });
          }
        }
      }, {
        key: 'render',
        value: function render() {
          return React.createElement(component, deepmerge.all([this.props, this.actions, this.state]));
        }
      }]);

      return Connected;
    }(React.PureComponent);

    return Connected;
  };

  if (typeof params[0] === 'function') {
    var _params = params,
        _params2 = _slicedToArray(_params, 4),
        _reducer = _params2[0],
        _createActions = _params2[1],
        _initialState = _params2[2],
        _params2$ = _params2[3],
        _collect = _params2$ === undefined ? false : _params2$;

    return createConnection(_reducer, _createActions, _initialState, _collect);
  }

  var stateHandlers = params[0];

  var reducer = function reducer(state, action) {
    return Object.keys(stateHandlers).reduce(function (prev, key) {
      return _extends({}, prev, _defineProperty({}, key, stateHandlers[key].reducer(state[key], action)));
    }, {});
  };

  var createActions = function createActions(_ref) {
    var getState = _ref.getState,
        dispatch = _ref.dispatch;

    var getPartialState = function getPartialState(key) {
      return function () {
        return getState()[key];
      };
    };

    return Object.keys(stateHandlers).reduce(function (prev, key) {
      return _extends({}, prev, _defineProperty({}, key, stateHandlers[key].createActions({ getState: getPartialState(key), dispatch: dispatch })));
    }, {});
  };

  var initialState = Object.keys(stateHandlers).reduce(function (prev, key) {
    return _extends({}, prev, _defineProperty({}, key, stateHandlers[key].initialState));
  }, {});

  var collect = params.length > 1 && params[1];

  return createConnection(reducer, createActions, initialState, collect);
};

module.exports = connect;