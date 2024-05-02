import { defineComponent as p, provide as G, h as l, reactive as T, inject as I, watchEffect as O, onMounted as R } from "vue";
const J = p(
  (e, { slots: t }) => (G("$theme", e.theme), () => l("div", null, t)),
  {
    name: "ThemeProvider",
    props: {
      theme: {
        type: Object,
        required: !0,
        default: () => {
        }
      }
    }
  }
), X = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "big",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "keygen",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "menu",
  "menuitem",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr",
  // SVG
  "circle",
  "clipPath",
  "defs",
  "ellipse",
  "g",
  "image",
  "line",
  "linearGradient",
  "mask",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialGradient",
  "rect",
  "stop",
  "svg",
  "text",
  "tspan"
], w = new Set(X);
function D(e) {
  return typeof e == "string" && w.has(e);
}
function A(e) {
  var t;
  return typeof e == "object" && ((t = e == null ? void 0 : e.name) == null ? void 0 : t.includes("styled"));
}
function h(e) {
  return e && (typeof e.setup == "function" || typeof e.render == "function" || typeof e.template == "string");
}
function j(e) {
  return D(e) || A(e) || h(e);
}
function K(e, t) {
  if (j(e))
    return p(
      (r, { slots: n }) => () => l(e, t, n == null ? void 0 : n.default)
    );
  throw Error("The target is invalid.");
}
const F = "styled", V = "styled", u = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", $ = /* @__PURE__ */ new Set(), v = () => {
  let e;
  do {
    const t = (/* @__PURE__ */ new Date()).getTime(), r = Math.floor(Math.random() * 1e4) * Math.floor(Math.random() * 10);
    e = `${P(t * Math.floor(Math.random() * 1e3))}${r}`;
  } while ($.has(e));
  return $.add(e), e;
}, P = (e) => {
  const t = u[e % u.length];
  return e > u.length ? `${P(Math.floor(e / u.length))}${t}` : t;
};
function q(e) {
  return `${V}-${e}-${v()}`;
}
function L() {
  return `${F}-${v()}`;
}
function C(e, t) {
  return t.reduce(
    (r, n, o) => r.concat(n, e[o + 1]),
    [e[0]]
  );
}
function b(e, t) {
  return e.reduce((r, n) => n == null || n === !1 || n === "" ? r : Array.isArray(n) ? [...r, ...b(n, t)] : typeof n == "function" ? t ? r.concat(...b([n(t)], t)) : r.concat(n) : r.concat(n.toString()), []);
}
const U = 65536;
let y = 0;
const E = {}, g = [];
function W() {
  const e = document.createElement("style");
  return document.head.appendChild(e), g.push(e), e;
}
function Z(e, t) {
  y++;
  let r = g[g.length - 1];
  (!r || y >= U) && (r = W(), y = 0);
  const n = E[e];
  let o = `.${e} { ${t} }`;
  if ((e === "global" || e === "keyframes") && (o = t), n) {
    n.data = o;
    return;
  }
  const s = document.createTextNode(o);
  r.appendChild(s), E[e] = s;
}
function m(e, t, r) {
  const n = b(t, r).join("");
  Z(e, n);
}
const Q = (e, ...t) => p(
  (r, { attrs: n }) => {
    const o = C(e, t);
    return m("global", o, n), () => l("div", { style: "display: none" });
  },
  {
    name: q("global"),
    inheritAttrs: !0
  }
);
function Y(e) {
  const t = `kf-${v()}`;
  return m(
    "keyframes",
    [
      `
        @keyframes ${t} {
          ${e.join("")}
        }
      `
    ],
    {}
  ), t;
}
function ee(e, ...t) {
  return C(e, t);
}
const M = T({});
function z() {
  return {
    getStyledClassName: (t) => M[t.name],
    styledClassNameMap: M
  };
}
function x(e, t = {}) {
  if (!j(e))
    throw Error("The element is invalid.");
  let r = {};
  const n = function(i, ...a) {
    const c = C(i, a);
    return o(c);
  };
  n.attrs = function(s) {
    return r = s, n;
  };
  function o(s) {
    let i = e;
    h(e) && (i = "vue-component"), A(e) && (i = "styled-component");
    const a = L(), c = q(i), { styledClassNameMap: k } = z();
    return k[c] = a, p(
      (d, { slots: _ }) => {
        const N = { ...r }, S = T(I("$theme", {}));
        let f = {
          theme: S,
          ...d
        };
        return N.class = a, O(() => {
          f = {
            theme: S,
            ...d
          }, m(a, s, f);
        }), R(() => {
          m(a, s, f);
        }), () => l(
          h(e) ? l(e, { as: d.as }) : d.as ?? e,
          {
            ...N
          },
          _
        );
      },
      {
        name: c,
        props: {
          as: {
            type: String
          },
          ...t
        },
        inheritAttrs: !0
      }
    );
  }
  return n;
}
const B = x;
w.forEach((e) => {
  B[e] = x(e);
});
export {
  J as ThemeProvider,
  Q as createGlobalStyle,
  ee as css,
  A as isStyledComponent,
  D as isTag,
  j as isValidElementType,
  h as isVueComponent,
  Y as keyframes,
  B as styled,
  z as useStyledClassName,
  K as withAttrs
};
