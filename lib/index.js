'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var mergeAll = function mergeAll(arr) {
  return arr.reduce(function (prev, item) {
    return Object.assign(prev, item);
  }, {});
};

var connect = function connect(component, _ref) {
  var reducer = _ref.reducer,
      createActions = _ref.createActions,
      initialState = _ref.initialState,
      _ref$collect = _ref.collect,
      collect = _ref$collect === undefined ? false : _ref$collect;

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

  return function (_React$PureComponent) {
    _inherits(Connected, _React$PureComponent);

    function Connected(props) {
      _classCallCheck(this, Connected);

      var _this = _possibleConstructorReturn(this, (Connected.__proto__ || Object.getPrototypeOf(Connected)).call(this, props));

      _this.state = collect ? mergeAll([initialState || {}, props]) : initialState || {};
      _this.actions = createActions(attach(_this));
      return _this;
    }

    _createClass(Connected, [{
      key: 'render',
      value: function render() {
        return _react2.default.createElement(component, mergeAll([this.props, this.actions, this.state]));
      }
    }]);

    return Connected;
  }(_react2.default.PureComponent);
};

exports.default = connect;