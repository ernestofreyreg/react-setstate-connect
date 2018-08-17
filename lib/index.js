'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var React = _interopRequireWildcard(_react);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var mergeAll = function mergeAll(arr) {
  return arr.reduce(function (prev, item) {
    return Object.assign(prev, item);
  }, {});
};

var connect = function connect(component, stateManager) {
  var attach = function attach(instance) {
    return {
      getState: function getState() {
        return instance.state || {};
      },
      dispatch: createDispatcher(stateManager.reducer, function (fn) {
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

      _this.state = stateManager.collect ? mergeAll([stateManager.initialState || {}, props]) : stateManager.initialState || {};

      _this.actions = stateManager.createActions(attach(_this));
      return _this;
    }

    _createClass(Connected, [{
      key: 'render',
      value: function render() {
        return React.createElement(component, mergeAll([this.props, this.actions, this.state]));
      }
    }]);

    return Connected;
  }(React.PureComponent);
};

exports.default = connect;