!(function (e, t) {
  "object" == typeof exports && "object" == typeof module
    ? (module.exports = t(require("react"), require("react-dom")))
    : "function" == typeof define && define.amd
      ? define(["react", "react-dom"], t)
      : "object" == typeof exports
        ? (exports.ReactModal = t(require("react"), require("react-dom")))
        : (e.ReactModal = t(e.React, e.ReactDOM));
})(window, function (e, t) {
  return (function (e) {
    var t = {};
    function n(o) {
      if (t[o]) return t[o].exports;
      var r = (t[o] = { i: o, l: !1, exports: {} });
      return e[o].call(r.exports, r, r.exports, n), (r.l = !0), r.exports;
    }
    return (
      (n.m = e),
      (n.c = t),
      (n.d = function (e, t, o) {
        n.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: o });
      }),
      (n.r = function (e) {
        "undefined" != typeof Symbol &&
          Symbol.toStringTag &&
          Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
          Object.defineProperty(e, "__esModule", { value: !0 });
      }),
      (n.t = function (e, t) {
        if ((1 & t && (e = n(e)), 8 & t)) return e;
        if (4 & t && "object" == typeof e && e && e.__esModule) return e;
        var o = Object.create(null);
        if (
          (n.r(o),
          Object.defineProperty(o, "default", { enumerable: !0, value: e }),
          2 & t && "string" != typeof e)
        )
          for (var r in e)
            n.d(
              o,
              r,
              function (t) {
                return e[t];
              }.bind(null, r),
            );
        return o;
      }),
      (n.n = function (e) {
        var t =
          e && e.__esModule
            ? function () {
                return e.default;
              }
            : function () {
                return e;
              };
        return n.d(t, "a", t), t;
      }),
      (n.o = function (e, t) {
        return Object.prototype.hasOwnProperty.call(e, t);
      }),
      (n.p = "/"),
      n((n.s = 8))
    );
  })([
    function (e, t, n) {
      "use strict";
      e.exports = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
    },
    function (e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.canUseDOM = t.SafeNodeList = t.SafeHTMLCollection = void 0);
      var o,
        r = n(21);
      var a = ((o = r) && o.__esModule ? o : { default: o }).default,
        l = a.canUseDOM ? window.HTMLElement : {};
      (t.SafeHTMLCollection = a.canUseDOM ? window.HTMLCollection : {}),
        (t.SafeNodeList = a.canUseDOM ? window.NodeList : {}),
        (t.canUseDOM = a.canUseDOM);
      t.default = l;
    },
    function (t, n) {
      t.exports = e;
    },
    function (e, t, n) {
      var o = n(4);
      e.exports = n(13)(o.isElement, !0);
    },
    function (e, t, n) {
      "use strict";
      e.exports = n(12);
    },
    function (e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.default = function (e) {
          return [].slice.call(e.querySelectorAll("*"), 0).filter(l);
        });
      /*!
       * Adapted from jQuery UI core
       *
       * http://jqueryui.com
       *
       * Copyright 2014 jQuery Foundation and other contributors
       * Released under the MIT license.
       * http://jquery.org/license
       *
       * http://api.jqueryui.com/category/ui-core/
       */
      var o = /input|select|textarea|button|object/;
      function r(e) {
        var t = e.offsetWidth <= 0 && e.offsetHeight <= 0;
        if (t && !e.innerHTML) return !0;
        try {
          var n = window.getComputedStyle(e);
          return t
            ? "visible" !== n.getPropertyValue("overflow") ||
                (e.scrollWidth <= 0 && e.scrollHeight <= 0)
            : "none" == n.getPropertyValue("display");
        } catch (e) {
          return console.warn("Failed to inspect element style"), !1;
        }
      }
      function a(e, t) {
        var n = e.nodeName.toLowerCase();
        return (
          ((o.test(n) && !e.disabled) || ("a" === n && e.href) || t) &&
          (function (e) {
            for (var t = e; t && t !== document.body; ) {
              if (r(t)) return !1;
              t = t.parentNode;
            }
            return !0;
          })(e)
        );
      }
      function l(e) {
        var t = e.getAttribute("tabindex");
        null === t && (t = void 0);
        var n = isNaN(t);
        return (n || t >= 0) && a(e, !n);
      }
      e.exports = t.default;
    },
    function (e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.resetState = function () {
          i &&
            (i.removeAttribute
              ? i.removeAttribute("aria-hidden")
              : null != i.length
                ? i.forEach(function (e) {
                    return e.removeAttribute("aria-hidden");
                  })
                : document.querySelectorAll(i).forEach(function (e) {
                    return e.removeAttribute("aria-hidden");
                  }));
          i = null;
        }),
        (t.log = function () {
          0;
          var e = i || {};
          console.log("ariaAppHider ----------"),
            console.log(e.nodeName, e.className, e.id),
            console.log("end ariaAppHider ----------");
        }),
        (t.assertNodeList = s),
        (t.setElement = function (e) {
          var t = e;
          if ("string" == typeof t && l.canUseDOM) {
            var n = document.querySelectorAll(t);
            s(n, t), (t = n);
          }
          return (i = t || i);
        }),
        (t.validateElement = u),
        (t.hide = function (e) {
          var t = !0,
            n = !1,
            o = void 0;
          try {
            for (
              var r, a = u(e)[Symbol.iterator]();
              !(t = (r = a.next()).done);
              t = !0
            ) {
              r.value.setAttribute("aria-hidden", "true");
            }
          } catch (e) {
            (n = !0), (o = e);
          } finally {
            try {
              !t && a.return && a.return();
            } finally {
              if (n) throw o;
            }
          }
        }),
        (t.show = function (e) {
          var t = !0,
            n = !1,
            o = void 0;
          try {
            for (
              var r, a = u(e)[Symbol.iterator]();
              !(t = (r = a.next()).done);
              t = !0
            ) {
              r.value.removeAttribute("aria-hidden");
            }
          } catch (e) {
            (n = !0), (o = e);
          } finally {
            try {
              !t && a.return && a.return();
            } finally {
              if (n) throw o;
            }
          }
        }),
        (t.documentNotReadyOrSSRTesting = function () {
          i = null;
        });
      var o,
        r = n(20),
        a = (o = r) && o.__esModule ? o : { default: o },
        l = n(1);
      var i = null;
      function s(e, t) {
        if (!e || !e.length)
          throw new Error(
            "react-modal: No elements were found for selector " + t + ".",
          );
      }
      function u(e) {
        var t = e || i;
        return t
          ? Array.isArray(t) ||
            t instanceof HTMLCollection ||
            t instanceof NodeList
            ? t
            : [t]
          : ((0, a.default)(
              !1,
              [
                "react-modal: App element is not defined.",
                "Please use `Modal.setAppElement(el)` or set `appElement={el}`.",
                "This is needed so screen readers don't see main content",
                "when modal is opened. It is not recommended, but you can opt-out",
                "by setting `ariaHideApp={false}`.",
              ].join(" "),
            ),
            []);
      }
    },
    function (e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.log = function () {
          console.log("portalOpenInstances ----------"),
            console.log(r.openInstances.length),
            r.openInstances.forEach(function (e) {
              return console.log(e);
            }),
            console.log("end portalOpenInstances ----------");
        }),
        (t.resetState = function () {
          r = new o();
        });
      var o = function e() {
          var t = this;
          !(function (e, t) {
            if (!(e instanceof t))
              throw new TypeError("Cannot call a class as a function");
          })(this, e),
            (this.register = function (e) {
              -1 === t.openInstances.indexOf(e)
                ? (t.openInstances.push(e), t.emit("register"))
                : console.warn(
                    "React-Modal: Cannot register modal instance that's already open",
                  );
            }),
            (this.deregister = function (e) {
              var n = t.openInstances.indexOf(e);
              -1 !== n
                ? (t.openInstances.splice(n, 1), t.emit("deregister"))
                : console.warn(
                    "React-Modal: Unable to deregister " +
                      e +
                      " as it was never registered",
                  );
            }),
            (this.subscribe = function (e) {
              t.subscribers.push(e);
            }),
            (this.emit = function (e) {
              t.subscribers.forEach(function (n) {
                return n(e, t.openInstances.slice());
              });
            }),
            (this.openInstances = []),
            (this.subscribers = []);
        },
        r = new o();
      t.default = r;
    },
    function (e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 });
      var o,
        r = n(9),
        a = (o = r) && o.__esModule ? o : { default: o };
      (t.default = a.default), (e.exports = t.default);
    },
    function (e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.bodyOpenClassName = t.portalClassName = void 0);
      var o =
          Object.assign ||
          function (e) {
            for (var t = 1; t < arguments.length; t++) {
              var n = arguments[t];
              for (var o in n)
                Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o]);
            }
            return e;
          },
        r = (function () {
          function e(e, t) {
            for (var n = 0; n < t.length; n++) {
              var o = t[n];
              (o.enumerable = o.enumerable || !1),
                (o.configurable = !0),
                "value" in o && (o.writable = !0),
                Object.defineProperty(e, o.key, o);
            }
          }
          return function (t, n, o) {
            return n && e(t.prototype, n), o && e(t, o), t;
          };
        })(),
        a = n(2),
        l = y(a),
        i = y(n(10)),
        s = y(n(3)),
        u = y(n(17)),
        c = (function (e) {
          if (e && e.__esModule) return e;
          var t = {};
          if (null != e)
            for (var n in e)
              Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
          return (t.default = e), t;
        })(n(6)),
        f = n(1),
        p = y(f),
        d = n(24);
      function y(e) {
        return e && e.__esModule ? e : { default: e };
      }
      function m(e, t) {
        if (!(e instanceof t))
          throw new TypeError("Cannot call a class as a function");
      }
      function h(e, t) {
        if (!e)
          throw new ReferenceError(
            "this hasn't been initialised - super() hasn't been called",
          );
        return !t || ("object" != typeof t && "function" != typeof t) ? e : t;
      }
      var v = (t.portalClassName = "ReactModalPortal"),
        b = (t.bodyOpenClassName = "ReactModal__Body--open"),
        g = f.canUseDOM && void 0 !== i.default.createPortal,
        O = function (e) {
          return document.createElement(e);
        },
        w = function () {
          return g
            ? i.default.createPortal
            : i.default.unstable_renderSubtreeIntoContainer;
        };
      function C(e) {
        return e();
      }
      var S = (function (e) {
        function t() {
          var e, n, r;
          m(this, t);
          for (var a = arguments.length, s = Array(a), c = 0; c < a; c++)
            s[c] = arguments[c];
          return (
            (n = r =
              h(
                this,
                (e = t.__proto__ || Object.getPrototypeOf(t)).call.apply(
                  e,
                  [this].concat(s),
                ),
              )),
            (r.removePortal = function () {
              !g && i.default.unmountComponentAtNode(r.node);
              var e = C(r.props.parentSelector);
              e && e.contains(r.node)
                ? e.removeChild(r.node)
                : console.warn(
                    'React-Modal: "parentSelector" prop did not returned any DOM element. Make sure that the parent element is unmounted to avoid any memory leaks.',
                  );
            }),
            (r.portalRef = function (e) {
              r.portal = e;
            }),
            (r.renderPortal = function (e) {
              var n = w()(
                r,
                l.default.createElement(
                  u.default,
                  o({ defaultStyles: t.defaultStyles }, e),
                ),
                r.node,
              );
              r.portalRef(n);
            }),
            h(r, n)
          );
        }
        return (
          (function (e, t) {
            if ("function" != typeof t && null !== t)
              throw new TypeError(
                "Super expression must either be null or a function, not " +
                  typeof t,
              );
            (e.prototype = Object.create(t && t.prototype, {
              constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0,
              },
            })),
              t &&
                (Object.setPrototypeOf
                  ? Object.setPrototypeOf(e, t)
                  : (e.__proto__ = t));
          })(t, e),
          r(
            t,
            [
              {
                key: "componentDidMount",
                value: function () {
                  f.canUseDOM &&
                    (g || (this.node = O("div")),
                    (this.node.className = this.props.portalClassName),
                    C(this.props.parentSelector).appendChild(this.node),
                    !g && this.renderPortal(this.props));
                },
              },
              {
                key: "getSnapshotBeforeUpdate",
                value: function (e) {
                  return {
                    prevParent: C(e.parentSelector),
                    nextParent: C(this.props.parentSelector),
                  };
                },
              },
              {
                key: "componentDidUpdate",
                value: function (e, t, n) {
                  if (f.canUseDOM) {
                    var o = this.props,
                      r = o.isOpen,
                      a = o.portalClassName;
                    e.portalClassName !== a && (this.node.className = a);
                    var l = n.prevParent,
                      i = n.nextParent;
                    i !== l &&
                      (l.removeChild(this.node), i.appendChild(this.node)),
                      (e.isOpen || r) && !g && this.renderPortal(this.props);
                  }
                },
              },
              {
                key: "componentWillUnmount",
                value: function () {
                  if (f.canUseDOM && this.node && this.portal) {
                    var e = this.portal.state,
                      t = Date.now(),
                      n =
                        e.isOpen &&
                        this.props.closeTimeoutMS &&
                        (e.closesAt || t + this.props.closeTimeoutMS);
                    n
                      ? (e.beforeClose || this.portal.closeWithTimeout(),
                        setTimeout(this.removePortal, n - t))
                      : this.removePortal();
                  }
                },
              },
              {
                key: "render",
                value: function () {
                  return f.canUseDOM && g
                    ? (!this.node && g && (this.node = O("div")),
                      w()(
                        l.default.createElement(
                          u.default,
                          o(
                            {
                              ref: this.portalRef,
                              defaultStyles: t.defaultStyles,
                            },
                            this.props,
                          ),
                        ),
                        this.node,
                      ))
                    : null;
                },
              },
            ],
            [
              {
                key: "setAppElement",
                value: function (e) {
                  c.setElement(e);
                },
              },
            ],
          ),
          t
        );
      })(a.Component);
      (S.propTypes = {
        isOpen: s.default.bool.isRequired,
        style: s.default.shape({
          content: s.default.object,
          overlay: s.default.object,
        }),
        portalClassName: s.default.string,
        bodyOpenClassName: s.default.string,
        htmlOpenClassName: s.default.string,
        className: s.default.oneOfType([
          s.default.string,
          s.default.shape({
            base: s.default.string.isRequired,
            afterOpen: s.default.string.isRequired,
            beforeClose: s.default.string.isRequired,
          }),
        ]),
        overlayClassName: s.default.oneOfType([
          s.default.string,
          s.default.shape({
            base: s.default.string.isRequired,
            afterOpen: s.default.string.isRequired,
            beforeClose: s.default.string.isRequired,
          }),
        ]),
        appElement: s.default.oneOfType([
          s.default.instanceOf(p.default),
          s.default.instanceOf(f.SafeHTMLCollection),
          s.default.instanceOf(f.SafeNodeList),
          s.default.arrayOf(s.default.instanceOf(p.default)),
        ]),
        onAfterOpen: s.default.func,
        onRequestClose: s.default.func,
        closeTimeoutMS: s.default.number,
        ariaHideApp: s.default.bool,
        shouldFocusAfterRender: s.default.bool,
        shouldCloseOnOverlayClick: s.default.bool,
        shouldReturnFocusAfterClose: s.default.bool,
        preventScroll: s.default.bool,
        parentSelector: s.default.func,
        aria: s.default.object,
        data: s.default.object,
        role: s.default.string,
        contentLabel: s.default.string,
        shouldCloseOnEsc: s.default.bool,
        overlayRef: s.default.func,
        contentRef: s.default.func,
        id: s.default.string,
        overlayElement: s.default.func,
        contentElement: s.default.func,
      }),
        (S.defaultProps = {
          isOpen: !1,
          portalClassName: v,
          bodyOpenClassName: b,
          role: "dialog",
          ariaHideApp: !0,
          closeTimeoutMS: 0,
          shouldFocusAfterRender: !0,
          shouldCloseOnEsc: !0,
          shouldCloseOnOverlayClick: !0,
          shouldReturnFocusAfterClose: !0,
          preventScroll: !1,
          parentSelector: function () {
            return document.body;
          },
          overlayElement: function (e, t) {
            return l.default.createElement("div", e, t);
          },
          contentElement: function (e, t) {
            return l.default.createElement("div", e, t);
          },
        }),
        (S.defaultStyles = {
          overlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.75)",
          },
          content: {
            position: "absolute",
            top: "40px",
            left: "40px",
            right: "40px",
            bottom: "40px",
            border: "1px solid #ccc",
            background: "#fff",
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
            borderRadius: "4px",
            outline: "none",
            padding: "20px",
          },
        }),
        (0, d.polyfill)(S),
        (S.setCreateHTMLElement = function (e) {
          return (O = e);
        }),
        (t.default = S);
    },
    function (e, n) {
      e.exports = t;
    },
    function (e, t, n) {
      "use strict";
      /** @license React v16.13.1
       * react-is.production.min.js
       *
       * Copyright (c) Facebook, Inc. and its affiliates.
       *
       * This source code is licensed under the MIT license found in the
       * LICENSE file in the root directory of this source tree.
       */ var o = "function" == typeof Symbol && Symbol.for,
        r = o ? Symbol.for("react.element") : 60103,
        a = o ? Symbol.for("react.portal") : 60106,
        l = o ? Symbol.for("react.fragment") : 60107,
        i = o ? Symbol.for("react.strict_mode") : 60108,
        s = o ? Symbol.for("react.profiler") : 60114,
        u = o ? Symbol.for("react.provider") : 60109,
        c = o ? Symbol.for("react.context") : 60110,
        f = o ? Symbol.for("react.async_mode") : 60111,
        p = o ? Symbol.for("react.concurrent_mode") : 60111,
        d = o ? Symbol.for("react.forward_ref") : 60112,
        y = o ? Symbol.for("react.suspense") : 60113,
        m = o ? Symbol.for("react.suspense_list") : 60120,
        h = o ? Symbol.for("react.memo") : 60115,
        v = o ? Symbol.for("react.lazy") : 60116,
        b = o ? Symbol.for("react.block") : 60121,
        g = o ? Symbol.for("react.fundamental") : 60117,
        O = o ? Symbol.for("react.responder") : 60118,
        w = o ? Symbol.for("react.scope") : 60119;
      function C(e) {
        if ("object" == typeof e && null !== e) {
          var t = e.$$typeof;
          switch (t) {
            case r:
              switch ((e = e.type)) {
                case f:
                case p:
                case l:
                case s:
                case i:
                case y:
                  return e;
                default:
                  switch ((e = e && e.$$typeof)) {
                    case c:
                    case d:
                    case v:
                    case h:
                    case u:
                      return e;
                    default:
                      return t;
                  }
              }
            case a:
              return t;
          }
        }
      }
      function S(e) {
        return C(e) === p;
      }
      (t.AsyncMode = f),
        (t.ConcurrentMode = p),
        (t.ContextConsumer = c),
        (t.ContextProvider = u),
        (t.Element = r),
        (t.ForwardRef = d),
        (t.Fragment = l),
        (t.Lazy = v),
        (t.Memo = h),
        (t.Portal = a),
        (t.Profiler = s),
        (t.StrictMode = i),
        (t.Suspense = y),
        (t.isAsyncMode = function (e) {
          return S(e) || C(e) === f;
        }),
        (t.isConcurrentMode = S),
        (t.isContextConsumer = function (e) {
          return C(e) === c;
        }),
        (t.isContextProvider = function (e) {
          return C(e) === u;
        }),
        (t.isElement = function (e) {
          return "object" == typeof e && null !== e && e.$$typeof === r;
        }),
        (t.isForwardRef = function (e) {
          return C(e) === d;
        }),
        (t.isFragment = function (e) {
          return C(e) === l;
        }),
        (t.isLazy = function (e) {
          return C(e) === v;
        }),
        (t.isMemo = function (e) {
          return C(e) === h;
        }),
        (t.isPortal = function (e) {
          return C(e) === a;
        }),
        (t.isProfiler = function (e) {
          return C(e) === s;
        }),
        (t.isStrictMode = function (e) {
          return C(e) === i;
        }),
        (t.isSuspense = function (e) {
          return C(e) === y;
        }),
        (t.isValidElementType = function (e) {
          return (
            "string" == typeof e ||
            "function" == typeof e ||
            e === l ||
            e === p ||
            e === s ||
            e === i ||
            e === y ||
            e === m ||
            ("object" == typeof e &&
              null !== e &&
              (e.$$typeof === v ||
                e.$$typeof === h ||
                e.$$typeof === u ||
                e.$$typeof === c ||
                e.$$typeof === d ||
                e.$$typeof === g ||
                e.$$typeof === O ||
                e.$$typeof === w ||
                e.$$typeof === b))
          );
        }),
        (t.typeOf = C);
    },
    function (e, t, n) {
      "use strict";
      /** @license React v16.13.1
       * react-is.development.js
       *
       * Copyright (c) Facebook, Inc. and its affiliates.
       *
       * This source code is licensed under the MIT license found in the
       * LICENSE file in the root directory of this source tree.
       */ (function () {
        var e = "function" == typeof Symbol && Symbol.for,
          n = e ? Symbol.for("react.element") : 60103,
          o = e ? Symbol.for("react.portal") : 60106,
          r = e ? Symbol.for("react.fragment") : 60107,
          a = e ? Symbol.for("react.strict_mode") : 60108,
          l = e ? Symbol.for("react.profiler") : 60114,
          i = e ? Symbol.for("react.provider") : 60109,
          s = e ? Symbol.for("react.context") : 60110,
          u = e ? Symbol.for("react.async_mode") : 60111,
          c = e ? Symbol.for("react.concurrent_mode") : 60111,
          f = e ? Symbol.for("react.forward_ref") : 60112,
          p = e ? Symbol.for("react.suspense") : 60113,
          d = e ? Symbol.for("react.suspense_list") : 60120,
          y = e ? Symbol.for("react.memo") : 60115,
          m = e ? Symbol.for("react.lazy") : 60116,
          h = e ? Symbol.for("react.block") : 60121,
          v = e ? Symbol.for("react.fundamental") : 60117,
          b = e ? Symbol.for("react.responder") : 60118,
          g = e ? Symbol.for("react.scope") : 60119;
        function O(e) {
          if ("object" == typeof e && null !== e) {
            var t = e.$$typeof;
            switch (t) {
              case n:
                var d = e.type;
                switch (d) {
                  case u:
                  case c:
                  case r:
                  case l:
                  case a:
                  case p:
                    return d;
                  default:
                    var h = d && d.$$typeof;
                    switch (h) {
                      case s:
                      case f:
                      case m:
                      case y:
                      case i:
                        return h;
                      default:
                        return t;
                    }
                }
              case o:
                return t;
            }
          }
        }
        var w = u,
          C = c,
          S = s,
          E = i,
          _ = n,
          M = f,
          j = r,
          P = m,
          T = y,
          x = o,
          R = l,
          N = a,
          A = p,
          k = !1;
        function F(e) {
          return O(e) === c;
        }
        (t.AsyncMode = w),
          (t.ConcurrentMode = C),
          (t.ContextConsumer = S),
          (t.ContextProvider = E),
          (t.Element = _),
          (t.ForwardRef = M),
          (t.Fragment = j),
          (t.Lazy = P),
          (t.Memo = T),
          (t.Portal = x),
          (t.Profiler = R),
          (t.StrictMode = N),
          (t.Suspense = A),
          (t.isAsyncMode = function (e) {
            return (
              k ||
                ((k = !0),
                console.warn(
                  "The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 17+. Update your code to use ReactIs.isConcurrentMode() instead. It has the exact same API.",
                )),
              F(e) || O(e) === u
            );
          }),
          (t.isConcurrentMode = F),
          (t.isContextConsumer = function (e) {
            return O(e) === s;
          }),
          (t.isContextProvider = function (e) {
            return O(e) === i;
          }),
          (t.isElement = function (e) {
            return "object" == typeof e && null !== e && e.$$typeof === n;
          }),
          (t.isForwardRef = function (e) {
            return O(e) === f;
          }),
          (t.isFragment = function (e) {
            return O(e) === r;
          }),
          (t.isLazy = function (e) {
            return O(e) === m;
          }),
          (t.isMemo = function (e) {
            return O(e) === y;
          }),
          (t.isPortal = function (e) {
            return O(e) === o;
          }),
          (t.isProfiler = function (e) {
            return O(e) === l;
          }),
          (t.isStrictMode = function (e) {
            return O(e) === a;
          }),
          (t.isSuspense = function (e) {
            return O(e) === p;
          }),
          (t.isValidElementType = function (e) {
            return (
              "string" == typeof e ||
              "function" == typeof e ||
              e === r ||
              e === c ||
              e === l ||
              e === a ||
              e === p ||
              e === d ||
              ("object" == typeof e &&
                null !== e &&
                (e.$$typeof === m ||
                  e.$$typeof === y ||
                  e.$$typeof === i ||
                  e.$$typeof === s ||
                  e.$$typeof === f ||
                  e.$$typeof === v ||
                  e.$$typeof === b ||
                  e.$$typeof === g ||
                  e.$$typeof === h))
            );
          }),
          (t.typeOf = O);
      })();
    },
    function (e, t, n) {
      "use strict";
      var o = n(4),
        r = n(14),
        a = n(0),
        l = n(15),
        i = Function.call.bind(Object.prototype.hasOwnProperty),
        s = function () {};
      function u() {
        return null;
      }
      (s = function (e) {
        var t = "Warning: " + e;
        "undefined" != typeof console && console.error(t);
        try {
          throw new Error(t);
        } catch (e) {}
      }),
        (e.exports = function (e, t) {
          var n = "function" == typeof Symbol && Symbol.iterator;
          var c = {
            array: y("array"),
            bool: y("boolean"),
            func: y("function"),
            number: y("number"),
            object: y("object"),
            string: y("string"),
            symbol: y("symbol"),
            any: d(u),
            arrayOf: function (e) {
              return d(function (t, n, o, r, l) {
                if ("function" != typeof e)
                  return new p(
                    "Property `" +
                      l +
                      "` of component `" +
                      o +
                      "` has invalid PropType notation inside arrayOf.",
                  );
                var i = t[n];
                if (!Array.isArray(i))
                  return new p(
                    "Invalid " +
                      r +
                      " `" +
                      l +
                      "` of type `" +
                      h(i) +
                      "` supplied to `" +
                      o +
                      "`, expected an array.",
                  );
                for (var s = 0; s < i.length; s++) {
                  var u = e(i, s, o, r, l + "[" + s + "]", a);
                  if (u instanceof Error) return u;
                }
                return null;
              });
            },
            element: d(function (t, n, o, r, a) {
              var l = t[n];
              return e(l)
                ? null
                : new p(
                    "Invalid " +
                      r +
                      " `" +
                      a +
                      "` of type `" +
                      h(l) +
                      "` supplied to `" +
                      o +
                      "`, expected a single ReactElement.",
                  );
            }),
            elementType: d(function (e, t, n, r, a) {
              var l = e[t];
              return o.isValidElementType(l)
                ? null
                : new p(
                    "Invalid " +
                      r +
                      " `" +
                      a +
                      "` of type `" +
                      h(l) +
                      "` supplied to `" +
                      n +
                      "`, expected a single ReactElement type.",
                  );
            }),
            instanceOf: function (e) {
              return d(function (t, n, o, r, a) {
                if (!(t[n] instanceof e)) {
                  var l = e.name || "<<anonymous>>";
                  return new p(
                    "Invalid " +
                      r +
                      " `" +
                      a +
                      "` of type `" +
                      (function (e) {
                        if (!e.constructor || !e.constructor.name)
                          return "<<anonymous>>";
                        return e.constructor.name;
                      })(t[n]) +
                      "` supplied to `" +
                      o +
                      "`, expected instance of `" +
                      l +
                      "`.",
                  );
                }
                return null;
              });
            },
            node: d(function (e, t, n, o, r) {
              return m(e[t])
                ? null
                : new p(
                    "Invalid " +
                      o +
                      " `" +
                      r +
                      "` supplied to `" +
                      n +
                      "`, expected a ReactNode.",
                  );
            }),
            objectOf: function (e) {
              return d(function (t, n, o, r, l) {
                if ("function" != typeof e)
                  return new p(
                    "Property `" +
                      l +
                      "` of component `" +
                      o +
                      "` has invalid PropType notation inside objectOf.",
                  );
                var s = t[n],
                  u = h(s);
                if ("object" !== u)
                  return new p(
                    "Invalid " +
                      r +
                      " `" +
                      l +
                      "` of type `" +
                      u +
                      "` supplied to `" +
                      o +
                      "`, expected an object.",
                  );
                for (var c in s)
                  if (i(s, c)) {
                    var f = e(s, c, o, r, l + "." + c, a);
                    if (f instanceof Error) return f;
                  }
                return null;
              });
            },
            oneOf: function (e) {
              if (!Array.isArray(e))
                return (
                  s(
                    arguments.length > 1
                      ? "Invalid arguments supplied to oneOf, expected an array, got " +
                          arguments.length +
                          " arguments. A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z])."
                      : "Invalid argument supplied to oneOf, expected an array.",
                  ),
                  u
                );
              function t(t, n, o, r, a) {
                for (var l = t[n], i = 0; i < e.length; i++)
                  if (f(l, e[i])) return null;
                var s = JSON.stringify(e, function (e, t) {
                  return "symbol" === v(t) ? String(t) : t;
                });
                return new p(
                  "Invalid " +
                    r +
                    " `" +
                    a +
                    "` of value `" +
                    String(l) +
                    "` supplied to `" +
                    o +
                    "`, expected one of " +
                    s +
                    ".",
                );
              }
              return d(t);
            },
            oneOfType: function (e) {
              if (!Array.isArray(e))
                return (
                  s(
                    "Invalid argument supplied to oneOfType, expected an instance of array.",
                  ),
                  u
                );
              for (var t = 0; t < e.length; t++) {
                var n = e[t];
                if ("function" != typeof n)
                  return (
                    s(
                      "Invalid argument supplied to oneOfType. Expected an array of check functions, but received " +
                        b(n) +
                        " at index " +
                        t +
                        ".",
                    ),
                    u
                  );
              }
              return d(function (t, n, o, r, l) {
                for (var i = 0; i < e.length; i++) {
                  if (null == (0, e[i])(t, n, o, r, l, a)) return null;
                }
                return new p(
                  "Invalid " + r + " `" + l + "` supplied to `" + o + "`.",
                );
              });
            },
            shape: function (e) {
              return d(function (t, n, o, r, l) {
                var i = t[n],
                  s = h(i);
                if ("object" !== s)
                  return new p(
                    "Invalid " +
                      r +
                      " `" +
                      l +
                      "` of type `" +
                      s +
                      "` supplied to `" +
                      o +
                      "`, expected `object`.",
                  );
                for (var u in e) {
                  var c = e[u];
                  if (c) {
                    var f = c(i, u, o, r, l + "." + u, a);
                    if (f) return f;
                  }
                }
                return null;
              });
            },
            exact: function (e) {
              return d(function (t, n, o, l, i) {
                var s = t[n],
                  u = h(s);
                if ("object" !== u)
                  return new p(
                    "Invalid " +
                      l +
                      " `" +
                      i +
                      "` of type `" +
                      u +
                      "` supplied to `" +
                      o +
                      "`, expected `object`.",
                  );
                var c = r({}, t[n], e);
                for (var f in c) {
                  var d = e[f];
                  if (!d)
                    return new p(
                      "Invalid " +
                        l +
                        " `" +
                        i +
                        "` key `" +
                        f +
                        "` supplied to `" +
                        o +
                        "`.\nBad object: " +
                        JSON.stringify(t[n], null, "  ") +
                        "\nValid keys: " +
                        JSON.stringify(Object.keys(e), null, "  "),
                    );
                  var y = d(s, f, o, l, i + "." + f, a);
                  if (y) return y;
                }
                return null;
              });
            },
          };
          function f(e, t) {
            return e === t ? 0 !== e || 1 / e == 1 / t : e != e && t != t;
          }
          function p(e) {
            (this.message = e), (this.stack = "");
          }
          function d(e) {
            var n = {},
              o = 0;
            function r(r, l, i, u, c, f, d) {
              if (((u = u || "<<anonymous>>"), (f = f || i), d !== a)) {
                if (t) {
                  var y = new Error(
                    "Calling PropTypes validators directly is not supported by the `prop-types` package. Use `PropTypes.checkPropTypes()` to call them. Read more at http://fb.me/use-check-prop-types",
                  );
                  throw ((y.name = "Invariant Violation"), y);
                }
                if ("undefined" != typeof console) {
                  var m = u + ":" + i;
                  !n[m] &&
                    o < 3 &&
                    (s(
                      "You are manually calling a React.PropTypes validation function for the `" +
                        f +
                        "` prop on `" +
                        u +
                        "`. This is deprecated and will throw in the standalone `prop-types` package. You may be seeing this warning due to a third-party PropTypes library. See https://fb.me/react-warning-dont-call-proptypes for details.",
                    ),
                    (n[m] = !0),
                    o++);
                }
              }
              return null == l[i]
                ? r
                  ? null === l[i]
                    ? new p(
                        "The " +
                          c +
                          " `" +
                          f +
                          "` is marked as required in `" +
                          u +
                          "`, but its value is `null`.",
                      )
                    : new p(
                        "The " +
                          c +
                          " `" +
                          f +
                          "` is marked as required in `" +
                          u +
                          "`, but its value is `undefined`.",
                      )
                  : null
                : e(l, i, u, c, f);
            }
            var l = r.bind(null, !1);
            return (l.isRequired = r.bind(null, !0)), l;
          }
          function y(e) {
            return d(function (t, n, o, r, a, l) {
              var i = t[n];
              return h(i) !== e
                ? new p(
                    "Invalid " +
                      r +
                      " `" +
                      a +
                      "` of type `" +
                      v(i) +
                      "` supplied to `" +
                      o +
                      "`, expected `" +
                      e +
                      "`.",
                  )
                : null;
            });
          }
          function m(t) {
            switch (typeof t) {
              case "number":
              case "string":
              case "undefined":
                return !0;
              case "boolean":
                return !t;
              case "object":
                if (Array.isArray(t)) return t.every(m);
                if (null === t || e(t)) return !0;
                var o = (function (e) {
                  var t = e && ((n && e[n]) || e["@@iterator"]);
                  if ("function" == typeof t) return t;
                })(t);
                if (!o) return !1;
                var r,
                  a = o.call(t);
                if (o !== t.entries) {
                  for (; !(r = a.next()).done; ) if (!m(r.value)) return !1;
                } else
                  for (; !(r = a.next()).done; ) {
                    var l = r.value;
                    if (l && !m(l[1])) return !1;
                  }
                return !0;
              default:
                return !1;
            }
          }
          function h(e) {
            var t = typeof e;
            return Array.isArray(e)
              ? "array"
              : e instanceof RegExp
                ? "object"
                : (function (e, t) {
                      return (
                        "symbol" === e ||
                        (!!t &&
                          ("Symbol" === t["@@toStringTag"] ||
                            ("function" == typeof Symbol &&
                              t instanceof Symbol)))
                      );
                    })(t, e)
                  ? "symbol"
                  : t;
          }
          function v(e) {
            if (null == e) return "" + e;
            var t = h(e);
            if ("object" === t) {
              if (e instanceof Date) return "date";
              if (e instanceof RegExp) return "regexp";
            }
            return t;
          }
          function b(e) {
            var t = v(e);
            switch (t) {
              case "array":
              case "object":
                return "an " + t;
              case "boolean":
              case "date":
              case "regexp":
                return "a " + t;
              default:
                return t;
            }
          }
          return (
            (p.prototype = Error.prototype),
            (c.checkPropTypes = l),
            (c.resetWarningCache = l.resetWarningCache),
            (c.PropTypes = c),
            c
          );
        });
    },
    function (e, t, n) {
      "use strict";
      /*
object-assign
(c) Sindre Sorhus
@license MIT
*/ var o = Object.getOwnPropertySymbols,
        r = Object.prototype.hasOwnProperty,
        a = Object.prototype.propertyIsEnumerable;
      function l(e) {
        if (null == e)
          throw new TypeError(
            "Object.assign cannot be called with null or undefined",
          );
        return Object(e);
      }
      e.exports = (function () {
        try {
          if (!Object.assign) return !1;
          var e = new String("abc");
          if (((e[5] = "de"), "5" === Object.getOwnPropertyNames(e)[0]))
            return !1;
          for (var t = {}, n = 0; n < 10; n++)
            t["_" + String.fromCharCode(n)] = n;
          if (
            "0123456789" !==
            Object.getOwnPropertyNames(t)
              .map(function (e) {
                return t[e];
              })
              .join("")
          )
            return !1;
          var o = {};
          return (
            "abcdefghijklmnopqrst".split("").forEach(function (e) {
              o[e] = e;
            }),
            "abcdefghijklmnopqrst" ===
              Object.keys(Object.assign({}, o)).join("")
          );
        } catch (e) {
          return !1;
        }
      })()
        ? Object.assign
        : function (e, t) {
            for (var n, i, s = l(e), u = 1; u < arguments.length; u++) {
              for (var c in (n = Object(arguments[u])))
                r.call(n, c) && (s[c] = n[c]);
              if (o) {
                i = o(n);
                for (var f = 0; f < i.length; f++)
                  a.call(n, i[f]) && (s[i[f]] = n[i[f]]);
              }
            }
            return s;
          };
    },
    function (e, t, n) {
      "use strict";
      var o = function () {},
        r = n(0),
        a = {},
        l = Function.call.bind(Object.prototype.hasOwnProperty);
      function i(e, t, n, i, s) {
        for (var u in e)
          if (l(e, u)) {
            var c;
            try {
              if ("function" != typeof e[u]) {
                var f = Error(
                  (i || "React class") +
                    ": " +
                    n +
                    " type `" +
                    u +
                    "` is invalid; it must be a function, usually from the `prop-types` package, but received `" +
                    typeof e[u] +
                    "`.",
                );
                throw ((f.name = "Invariant Violation"), f);
              }
              c = e[u](t, u, i, n, null, r);
            } catch (e) {
              c = e;
            }
            if (
              (!c ||
                c instanceof Error ||
                o(
                  (i || "React class") +
                    ": type specification of " +
                    n +
                    " `" +
                    u +
                    "` is invalid; the type checker function must return `null` or an `Error` but returned a " +
                    typeof c +
                    ". You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).",
                ),
              c instanceof Error && !(c.message in a))
            ) {
              a[c.message] = !0;
              var p = s ? s() : "";
              o("Failed " + n + " type: " + c.message + (null != p ? p : ""));
            }
          }
      }
      (o = function (e) {
        var t = "Warning: " + e;
        "undefined" != typeof console && console.error(t);
        try {
          throw new Error(t);
        } catch (e) {}
      }),
        (i.resetWarningCache = function () {
          a = {};
        }),
        (e.exports = i);
    },
    function (e, t, n) {
      "use strict";
      var o = n(0);
      function r() {}
      function a() {}
      (a.resetWarningCache = r),
        (e.exports = function () {
          function e(e, t, n, r, a, l) {
            if (l !== o) {
              var i = new Error(
                "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types",
              );
              throw ((i.name = "Invariant Violation"), i);
            }
          }
          function t() {
            return e;
          }
          e.isRequired = e;
          var n = {
            array: e,
            bool: e,
            func: e,
            number: e,
            object: e,
            string: e,
            symbol: e,
            any: e,
            arrayOf: t,
            element: e,
            elementType: e,
            instanceOf: t,
            node: e,
            objectOf: t,
            oneOf: t,
            oneOfType: t,
            shape: t,
            exact: t,
            checkPropTypes: a,
            resetWarningCache: r,
          };
          return (n.PropTypes = n), n;
        });
    },
    function (e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 });
      var o =
          Object.assign ||
          function (e) {
            for (var t = 1; t < arguments.length; t++) {
              var n = arguments[t];
              for (var o in n)
                Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o]);
            }
            return e;
          },
        r =
          "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
            ? function (e) {
                return typeof e;
              }
            : function (e) {
                return e &&
                  "function" == typeof Symbol &&
                  e.constructor === Symbol &&
                  e !== Symbol.prototype
                  ? "symbol"
                  : typeof e;
              },
        a = (function () {
          function e(e, t) {
            for (var n = 0; n < t.length; n++) {
              var o = t[n];
              (o.enumerable = o.enumerable || !1),
                (o.configurable = !0),
                "value" in o && (o.writable = !0),
                Object.defineProperty(e, o.key, o);
            }
          }
          return function (t, n, o) {
            return n && e(t.prototype, n), o && e(t, o), t;
          };
        })(),
        l = n(2),
        i = h(n(3)),
        s = m(n(18)),
        u = h(n(19)),
        c = m(n(6)),
        f = m(n(22)),
        p = n(1),
        d = h(p),
        y = h(n(7));
      function m(e) {
        if (e && e.__esModule) return e;
        var t = {};
        if (null != e)
          for (var n in e)
            Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
        return (t.default = e), t;
      }
      function h(e) {
        return e && e.__esModule ? e : { default: e };
      }
      n(23);
      var v = {
          overlay: "ReactModal__Overlay",
          content: "ReactModal__Content",
        },
        b = 0,
        g = (function (e) {
          function t(e) {
            !(function (e, t) {
              if (!(e instanceof t))
                throw new TypeError("Cannot call a class as a function");
            })(this, t);
            var n = (function (e, t) {
              if (!e)
                throw new ReferenceError(
                  "this hasn't been initialised - super() hasn't been called",
                );
              return !t || ("object" != typeof t && "function" != typeof t)
                ? e
                : t;
            })(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e));
            return (
              (n.setOverlayRef = function (e) {
                (n.overlay = e), n.props.overlayRef && n.props.overlayRef(e);
              }),
              (n.setContentRef = function (e) {
                (n.content = e), n.props.contentRef && n.props.contentRef(e);
              }),
              (n.afterClose = function () {
                var e = n.props,
                  t = e.appElement,
                  o = e.ariaHideApp,
                  r = e.htmlOpenClassName,
                  a = e.bodyOpenClassName;
                a && f.remove(document.body, a),
                  r && f.remove(document.getElementsByTagName("html")[0], r),
                  o && b > 0 && 0 === (b -= 1) && c.show(t),
                  n.props.shouldFocusAfterRender &&
                    (n.props.shouldReturnFocusAfterClose
                      ? (s.returnFocus(n.props.preventScroll),
                        s.teardownScopedFocus())
                      : s.popWithoutFocus()),
                  n.props.onAfterClose && n.props.onAfterClose(),
                  y.default.deregister(n);
              }),
              (n.open = function () {
                n.beforeOpen(),
                  n.state.afterOpen && n.state.beforeClose
                    ? (clearTimeout(n.closeTimer),
                      n.setState({ beforeClose: !1 }))
                    : (n.props.shouldFocusAfterRender &&
                        (s.setupScopedFocus(n.node), s.markForFocusLater()),
                      n.setState({ isOpen: !0 }, function () {
                        n.openAnimationFrame = requestAnimationFrame(
                          function () {
                            n.setState({ afterOpen: !0 }),
                              n.props.isOpen &&
                                n.props.onAfterOpen &&
                                n.props.onAfterOpen({
                                  overlayEl: n.overlay,
                                  contentEl: n.content,
                                });
                          },
                        );
                      }));
              }),
              (n.close = function () {
                n.props.closeTimeoutMS > 0
                  ? n.closeWithTimeout()
                  : n.closeWithoutTimeout();
              }),
              (n.focusContent = function () {
                return (
                  n.content &&
                  !n.contentHasFocus() &&
                  n.content.focus({ preventScroll: !0 })
                );
              }),
              (n.closeWithTimeout = function () {
                var e = Date.now() + n.props.closeTimeoutMS;
                n.setState({ beforeClose: !0, closesAt: e }, function () {
                  n.closeTimer = setTimeout(
                    n.closeWithoutTimeout,
                    n.state.closesAt - Date.now(),
                  );
                });
              }),
              (n.closeWithoutTimeout = function () {
                n.setState(
                  {
                    beforeClose: !1,
                    isOpen: !1,
                    afterOpen: !1,
                    closesAt: null,
                  },
                  n.afterClose,
                );
              }),
              (n.handleKeyDown = function (e) {
                9 === e.keyCode && (0, u.default)(n.content, e),
                  n.props.shouldCloseOnEsc &&
                    27 === e.keyCode &&
                    (e.stopPropagation(), n.requestClose(e));
              }),
              (n.handleOverlayOnClick = function (e) {
                null === n.shouldClose && (n.shouldClose = !0),
                  n.shouldClose &&
                    n.props.shouldCloseOnOverlayClick &&
                    (n.ownerHandlesClose()
                      ? n.requestClose(e)
                      : n.focusContent()),
                  (n.shouldClose = null);
              }),
              (n.handleContentOnMouseUp = function () {
                n.shouldClose = !1;
              }),
              (n.handleOverlayOnMouseDown = function (e) {
                n.props.shouldCloseOnOverlayClick ||
                  e.target != n.overlay ||
                  e.preventDefault();
              }),
              (n.handleContentOnClick = function () {
                n.shouldClose = !1;
              }),
              (n.handleContentOnMouseDown = function () {
                n.shouldClose = !1;
              }),
              (n.requestClose = function (e) {
                return n.ownerHandlesClose() && n.props.onRequestClose(e);
              }),
              (n.ownerHandlesClose = function () {
                return n.props.onRequestClose;
              }),
              (n.shouldBeClosed = function () {
                return !n.state.isOpen && !n.state.beforeClose;
              }),
              (n.contentHasFocus = function () {
                return (
                  document.activeElement === n.content ||
                  n.content.contains(document.activeElement)
                );
              }),
              (n.buildClassName = function (e, t) {
                var o =
                    "object" === (void 0 === t ? "undefined" : r(t))
                      ? t
                      : {
                          base: v[e],
                          afterOpen: v[e] + "--after-open",
                          beforeClose: v[e] + "--before-close",
                        },
                  a = o.base;
                return (
                  n.state.afterOpen && (a = a + " " + o.afterOpen),
                  n.state.beforeClose && (a = a + " " + o.beforeClose),
                  "string" == typeof t && t ? a + " " + t : a
                );
              }),
              (n.attributesFromObject = function (e, t) {
                return Object.keys(t).reduce(function (n, o) {
                  return (n[e + "-" + o] = t[o]), n;
                }, {});
              }),
              (n.state = { afterOpen: !1, beforeClose: !1 }),
              (n.shouldClose = null),
              (n.moveFromContentToOverlay = null),
              n
            );
          }
          return (
            (function (e, t) {
              if ("function" != typeof t && null !== t)
                throw new TypeError(
                  "Super expression must either be null or a function, not " +
                    typeof t,
                );
              (e.prototype = Object.create(t && t.prototype, {
                constructor: {
                  value: e,
                  enumerable: !1,
                  writable: !0,
                  configurable: !0,
                },
              })),
                t &&
                  (Object.setPrototypeOf
                    ? Object.setPrototypeOf(e, t)
                    : (e.__proto__ = t));
            })(t, e),
            a(t, [
              {
                key: "componentDidMount",
                value: function () {
                  this.props.isOpen && this.open();
                },
              },
              {
                key: "componentDidUpdate",
                value: function (e, t) {
                  e.bodyOpenClassName !== this.props.bodyOpenClassName &&
                    console.warn(
                      'React-Modal: "bodyOpenClassName" prop has been modified. This may cause unexpected behavior when multiple modals are open.',
                    ),
                    e.htmlOpenClassName !== this.props.htmlOpenClassName &&
                      console.warn(
                        'React-Modal: "htmlOpenClassName" prop has been modified. This may cause unexpected behavior when multiple modals are open.',
                      ),
                    this.props.isOpen && !e.isOpen
                      ? this.open()
                      : !this.props.isOpen && e.isOpen && this.close(),
                    this.props.shouldFocusAfterRender &&
                      this.state.isOpen &&
                      !t.isOpen &&
                      this.focusContent();
                },
              },
              {
                key: "componentWillUnmount",
                value: function () {
                  this.state.isOpen && this.afterClose(),
                    clearTimeout(this.closeTimer),
                    cancelAnimationFrame(this.openAnimationFrame);
                },
              },
              {
                key: "beforeOpen",
                value: function () {
                  var e = this.props,
                    t = e.appElement,
                    n = e.ariaHideApp,
                    o = e.htmlOpenClassName,
                    r = e.bodyOpenClassName;
                  r && f.add(document.body, r),
                    o && f.add(document.getElementsByTagName("html")[0], o),
                    n && ((b += 1), c.hide(t)),
                    y.default.register(this);
                },
              },
              {
                key: "render",
                value: function () {
                  var e = this.props,
                    t = e.id,
                    n = e.className,
                    r = e.overlayClassName,
                    a = e.defaultStyles,
                    l = e.children,
                    i = n ? {} : a.content,
                    s = r ? {} : a.overlay;
                  if (this.shouldBeClosed()) return null;
                  var u = {
                      ref: this.setOverlayRef,
                      className: this.buildClassName("overlay", r),
                      style: o({}, s, this.props.style.overlay),
                      onClick: this.handleOverlayOnClick,
                      onMouseDown: this.handleOverlayOnMouseDown,
                    },
                    c = o(
                      {
                        id: t,
                        ref: this.setContentRef,
                        style: o({}, i, this.props.style.content),
                        className: this.buildClassName("content", n),
                        tabIndex: "-1",
                        onKeyDown: this.handleKeyDown,
                        onMouseDown: this.handleContentOnMouseDown,
                        onMouseUp: this.handleContentOnMouseUp,
                        onClick: this.handleContentOnClick,
                        role: this.props.role,
                        "aria-label": this.props.contentLabel,
                      },
                      this.attributesFromObject(
                        "aria",
                        o({ modal: !0 }, this.props.aria),
                      ),
                      this.attributesFromObject("data", this.props.data || {}),
                      { "data-testid": this.props.testId },
                    ),
                    f = this.props.contentElement(c, l);
                  return this.props.overlayElement(u, f);
                },
              },
            ]),
            t
          );
        })(l.Component);
      (g.defaultProps = {
        style: { overlay: {}, content: {} },
        defaultStyles: {},
      }),
        (g.propTypes = {
          isOpen: i.default.bool.isRequired,
          defaultStyles: i.default.shape({
            content: i.default.object,
            overlay: i.default.object,
          }),
          style: i.default.shape({
            content: i.default.object,
            overlay: i.default.object,
          }),
          className: i.default.oneOfType([i.default.string, i.default.object]),
          overlayClassName: i.default.oneOfType([
            i.default.string,
            i.default.object,
          ]),
          bodyOpenClassName: i.default.string,
          htmlOpenClassName: i.default.string,
          ariaHideApp: i.default.bool,
          appElement: i.default.oneOfType([
            i.default.instanceOf(d.default),
            i.default.instanceOf(p.SafeHTMLCollection),
            i.default.instanceOf(p.SafeNodeList),
            i.default.arrayOf(i.default.instanceOf(d.default)),
          ]),
          onAfterOpen: i.default.func,
          onAfterClose: i.default.func,
          onRequestClose: i.default.func,
          closeTimeoutMS: i.default.number,
          shouldFocusAfterRender: i.default.bool,
          shouldCloseOnOverlayClick: i.default.bool,
          shouldReturnFocusAfterClose: i.default.bool,
          preventScroll: i.default.bool,
          role: i.default.string,
          contentLabel: i.default.string,
          aria: i.default.object,
          data: i.default.object,
          children: i.default.node,
          shouldCloseOnEsc: i.default.bool,
          overlayRef: i.default.func,
          contentRef: i.default.func,
          id: i.default.string,
          overlayElement: i.default.func,
          contentElement: i.default.func,
          testId: i.default.string,
        }),
        (t.default = g),
        (e.exports = t.default);
    },
    function (e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.resetState = function () {
          l = [];
        }),
        (t.log = function () {
          0;
          console.log("focusManager ----------"),
            l.forEach(function (e) {
              var t = e || {};
              console.log(t.nodeName, t.className, t.id);
            }),
            console.log("end focusManager ----------");
        }),
        (t.handleBlur = u),
        (t.handleFocus = c),
        (t.markForFocusLater = function () {
          l.push(document.activeElement);
        }),
        (t.returnFocus = function () {
          var e =
              arguments.length > 0 && void 0 !== arguments[0] && arguments[0],
            t = null;
          try {
            return void (
              0 !== l.length && (t = l.pop()).focus({ preventScroll: e })
            );
          } catch (e) {
            console.warn(
              [
                "You tried to return focus to",
                t,
                "but it is not in the DOM anymore",
              ].join(" "),
            );
          }
        }),
        (t.popWithoutFocus = function () {
          l.length > 0 && l.pop();
        }),
        (t.setupScopedFocus = function (e) {
          (i = e),
            window.addEventListener
              ? (window.addEventListener("blur", u, !1),
                document.addEventListener("focus", c, !0))
              : (window.attachEvent("onBlur", u),
                document.attachEvent("onFocus", c));
        }),
        (t.teardownScopedFocus = function () {
          (i = null),
            window.addEventListener
              ? (window.removeEventListener("blur", u),
                document.removeEventListener("focus", c))
              : (window.detachEvent("onBlur", u),
                document.detachEvent("onFocus", c));
        });
      var o,
        r = n(5),
        a = (o = r) && o.__esModule ? o : { default: o };
      var l = [],
        i = null,
        s = !1;
      function u() {
        s = !0;
      }
      function c() {
        if (s) {
          if (((s = !1), !i)) return;
          setTimeout(function () {
            i.contains(document.activeElement) ||
              ((0, a.default)(i)[0] || i).focus();
          }, 0);
        }
      }
    },
    function (e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.default = function (e, t) {
          var n = (0, a.default)(e);
          if (!n.length) return void t.preventDefault();
          var o = void 0,
            r = t.shiftKey,
            l = n[0],
            i = n[n.length - 1];
          if (e === document.activeElement) {
            if (!r) return;
            o = i;
          }
          i !== document.activeElement || r || (o = l);
          l === document.activeElement && r && (o = i);
          if (o) return t.preventDefault(), void o.focus();
          var s = /(\bChrome\b|\bSafari\b)\//.exec(navigator.userAgent);
          if (
            null == s ||
            "Chrome" == s[1] ||
            null != /\biPod\b|\biPad\b/g.exec(navigator.userAgent)
          )
            return;
          var u = n.indexOf(document.activeElement);
          u > -1 && (u += r ? -1 : 1);
          if (void 0 === (o = n[u]))
            return t.preventDefault(), void (o = r ? i : l).focus();
          t.preventDefault(), o.focus();
        });
      var o,
        r = n(5),
        a = (o = r) && o.__esModule ? o : { default: o };
      e.exports = t.default;
    },
    function (e, t, n) {
      "use strict";
      var o = function () {},
        r = function (e, t) {
          var n = arguments.length;
          t = new Array(n > 1 ? n - 1 : 0);
          for (var o = 1; o < n; o++) t[o - 1] = arguments[o];
          var r = 0,
            a =
              "Warning: " +
              e.replace(/%s/g, function () {
                return t[r++];
              });
          "undefined" != typeof console && console.error(a);
          try {
            throw new Error(a);
          } catch (e) {}
        };
      (o = function (e, t, n) {
        var o = arguments.length;
        n = new Array(o > 2 ? o - 2 : 0);
        for (var a = 2; a < o; a++) n[a - 2] = arguments[a];
        if (void 0 === t)
          throw new Error(
            "`warning(condition, format, ...args)` requires a warning message argument",
          );
        e || r.apply(null, [t].concat(n));
      }),
        (e.exports = o);
    },
    function (e, t, n) {
      var o;
      /*!
  Copyright (c) 2015 Jed Watson.
  Based on code that is Copyright 2013-2015, Facebook, Inc.
  All rights reserved.
*/ !(function () {
        "use strict";
        var r = !(
            "undefined" == typeof window ||
            !window.document ||
            !window.document.createElement
          ),
          a = {
            canUseDOM: r,
            canUseWorkers: "undefined" != typeof Worker,
            canUseEventListeners:
              r && !(!window.addEventListener && !window.attachEvent),
            canUseViewport: r && !!window.screen,
          };
        void 0 ===
          (o = function () {
            return a;
          }.call(t, n, t, e)) || (e.exports = o);
      })();
    },
    function (e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.resetState = function () {
          var e = document.getElementsByTagName("html")[0];
          for (var t in o) a(e, o[t]);
          var n = document.body;
          for (var l in r) a(n, r[l]);
          (o = {}), (r = {});
        }),
        (t.log = function () {
          0;
          var e = document.getElementsByTagName("html")[0].className,
            t = "Show tracked classes:\n\n";
          for (var n in ((t += "<html /> (" + e + "):\n"), o))
            t += "  " + n + " " + o[n] + "\n";
          for (var a in ((e = document.body.className),
          (t += "\n\ndoc.body (" + e + "):\n"),
          r))
            t += "  " + a + " " + r[a] + "\n";
          (t += "\n"), console.log(t);
        });
      var o = {},
        r = {};
      function a(e, t) {
        e.classList.remove(t);
      }
      (t.add = function (e, t) {
        return (
          (n = e.classList),
          (a = "html" == e.nodeName.toLowerCase() ? o : r),
          void t.split(" ").forEach(function (e) {
            !(function (e, t) {
              e[t] || (e[t] = 0), (e[t] += 1);
            })(a, e),
              n.add(e);
          })
        );
        var n, a;
      }),
        (t.remove = function (e, t) {
          return (
            (n = e.classList),
            (a = "html" == e.nodeName.toLowerCase() ? o : r),
            void t.split(" ").forEach(function (e) {
              !(function (e, t) {
                e[t] && (e[t] -= 1);
              })(a, e),
                0 === a[e] && n.remove(e);
            })
          );
          var n, a;
        });
    },
    function (e, t, n) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.resetState = function () {
          for (var e = [l, i], t = 0; t < e.length; t++) {
            var n = e[t];
            n && n.parentNode && n.parentNode.removeChild(n);
          }
          (l = i = null), (s = []);
        }),
        (t.log = function () {
          console.log("bodyTrap ----------"), console.log(s.length);
          for (var e = [l, i], t = 0; t < e.length; t++) {
            var n = e[t] || {};
            console.log(n.nodeName, n.className, n.id);
          }
          console.log("edn bodyTrap ----------");
        });
      var o,
        r = n(7),
        a = (o = r) && o.__esModule ? o : { default: o };
      var l = void 0,
        i = void 0,
        s = [];
      function u() {
        0 !== s.length
          ? s[s.length - 1].focusContent()
          : console.warn("React-Modal: Open instances > 0 expected");
      }
      a.default.subscribe(function (e, t) {
        l ||
          i ||
          ((l = document.createElement("div")).setAttribute(
            "data-react-modal-body-trap",
            "",
          ),
          (l.style.position = "absolute"),
          (l.style.opacity = "0"),
          l.setAttribute("tabindex", "0"),
          l.addEventListener("focus", u),
          (i = l.cloneNode()).addEventListener("focus", u)),
          (s = t).length > 0
            ? (document.body.firstChild !== l &&
                document.body.insertBefore(l, document.body.firstChild),
              document.body.lastChild !== i && document.body.appendChild(i))
            : (l.parentElement && l.parentElement.removeChild(l),
              i.parentElement && i.parentElement.removeChild(i));
      });
    },
    function (e, t, n) {
      "use strict";
      function o() {
        var e = this.constructor.getDerivedStateFromProps(
          this.props,
          this.state,
        );
        null != e && this.setState(e);
      }
      function r(e) {
        this.setState(
          function (t) {
            var n = this.constructor.getDerivedStateFromProps(e, t);
            return null != n ? n : null;
          }.bind(this),
        );
      }
      function a(e, t) {
        try {
          var n = this.props,
            o = this.state;
          (this.props = e),
            (this.state = t),
            (this.__reactInternalSnapshotFlag = !0),
            (this.__reactInternalSnapshot = this.getSnapshotBeforeUpdate(n, o));
        } finally {
          (this.props = n), (this.state = o);
        }
      }
      function l(e) {
        var t = e.prototype;
        if (!t || !t.isReactComponent)
          throw new Error("Can only polyfill class components");
        if (
          "function" != typeof e.getDerivedStateFromProps &&
          "function" != typeof t.getSnapshotBeforeUpdate
        )
          return e;
        var n = null,
          l = null,
          i = null;
        if (
          ("function" == typeof t.componentWillMount
            ? (n = "componentWillMount")
            : "function" == typeof t.UNSAFE_componentWillMount &&
              (n = "UNSAFE_componentWillMount"),
          "function" == typeof t.componentWillReceiveProps
            ? (l = "componentWillReceiveProps")
            : "function" == typeof t.UNSAFE_componentWillReceiveProps &&
              (l = "UNSAFE_componentWillReceiveProps"),
          "function" == typeof t.componentWillUpdate
            ? (i = "componentWillUpdate")
            : "function" == typeof t.UNSAFE_componentWillUpdate &&
              (i = "UNSAFE_componentWillUpdate"),
          null !== n || null !== l || null !== i)
        ) {
          var s = e.displayName || e.name,
            u =
              "function" == typeof e.getDerivedStateFromProps
                ? "getDerivedStateFromProps()"
                : "getSnapshotBeforeUpdate()";
          throw Error(
            "Unsafe legacy lifecycles will not be called for components using new component APIs.\n\n" +
              s +
              " uses " +
              u +
              " but also contains the following legacy lifecycles:" +
              (null !== n ? "\n  " + n : "") +
              (null !== l ? "\n  " + l : "") +
              (null !== i ? "\n  " + i : "") +
              "\n\nThe above lifecycles should be removed. Learn more about this warning here:\nhttps://fb.me/react-async-component-lifecycle-hooks",
          );
        }
        if (
          ("function" == typeof e.getDerivedStateFromProps &&
            ((t.componentWillMount = o), (t.componentWillReceiveProps = r)),
          "function" == typeof t.getSnapshotBeforeUpdate)
        ) {
          if ("function" != typeof t.componentDidUpdate)
            throw new Error(
              "Cannot polyfill getSnapshotBeforeUpdate() for components that do not define componentDidUpdate() on the prototype",
            );
          t.componentWillUpdate = a;
          var c = t.componentDidUpdate;
          t.componentDidUpdate = function (e, t, n) {
            var o = this.__reactInternalSnapshotFlag
              ? this.__reactInternalSnapshot
              : n;
            c.call(this, e, t, o);
          };
        }
        return e;
      }
      n.r(t),
        n.d(t, "polyfill", function () {
          return l;
        }),
        (o.__suppressDeprecationWarning = !0),
        (r.__suppressDeprecationWarning = !0),
        (a.__suppressDeprecationWarning = !0);
    },
  ]);
});
