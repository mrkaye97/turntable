"use client";
var so = Object.create;
var C = Object.defineProperty;
var po = Object.getOwnPropertyDescriptor;
var lo = Object.getOwnPropertyNames;
var uo = Object.getPrototypeOf,
  co = Object.prototype.hasOwnProperty;
var fo = (o, t) => {
    for (var e in t) C(o, e, { get: t[e], enumerable: !0 });
  },
  w = (o, t, e, n) => {
    if ((t && typeof t == "object") || typeof t == "function")
      for (const r of lo(t))
        !co.call(o, r) &&
          r !== e &&
          C(o, r, {
            get: () => t[r],
            enumerable: !(n = po(t, r)) || n.enumerable,
          });
    return o;
  };
var i = (o, t, e) => (
    (e = o != null ? so(uo(o)) : {}),
    w(
      t || !o || !o.__esModule
        ? C(e, "default", { value: o, enumerable: !0 })
        : e,
      o,
    )
  ),
  Co = (o) => w(C({}, "__esModule", { value: !0 }), o);
var To = {};
fo(To, {
  EditorBubble: () => T,
  EditorBubbleItem: () => I,
  EditorCommand: () => v,
  EditorCommandEmpty: () => ro,
  EditorCommandItem: () => S,
  EditorCommandList: () => D,
  EditorContent: () => g,
  EditorRoot: () => G,
  useEditor: () => mo.useCurrentEditor,
});
module.exports = Co(To);
var mo = require("@tiptap/react"),
  Qo = require("@tiptap/core");
var p = require("react"),
  _ = require("@tiptap/react"),
  Q = require("jotai"),
  V = i(require("tunnel-rat"), 1);
var K = require("@tiptap/core"),
  W = require("@tiptap/extension-color"),
  O = i(require("@tiptap/extension-highlight"), 1),
  $ = i(require("@tiptap/extension-horizontal-rule"), 1),
  yo = i(require("@tiptap/extension-image"), 1),
  xo = i(require("@tiptap/extension-link"), 1),
  q = i(require("@tiptap/extension-placeholder"), 1),
  Po = require("@tiptap/extension-task-item"),
  bo = require("@tiptap/extension-task-list"),
  z = i(require("@tiptap/extension-text-style"), 1),
  F = i(require("@tiptap/extension-underline"), 1),
  Ro = i(require("@tiptap/starter-kit"), 1),
  J = require("tiptap-markdown");
var M = require("@tiptap/core"),
  Eo = M.Extension.create({
    name: "CustomKeymap",
    addCommands() {
      return {
        selectTextWithinNodeBoundaries:
          () =>
          ({ editor: o, commands: t }) => {
            const { state: e } = o,
              { tr: n } = e,
              r = n.selection.$from.start(),
              m = n.selection.$to.end();
            return t.setTextSelection({ from: r, to: m });
          },
      };
    },
    addKeyboardShortcuts() {
      return {
        "Mod-a": ({ editor: o }) => {
          const { state: t } = o,
            { tr: e } = t,
            n = e.selection.from,
            r = e.selection.to,
            m = e.selection.$from.start(),
            d = e.selection.$to.end();
          return n > m || r < d
            ? (o.chain().selectTextWithinNodeBoundaries().run(), !0)
            : !1;
        },
      };
    },
  }),
  k = Eo;
var ho = i(require("@tiptap/extension-character-count"), 1),
  vo = i(require("@tiptap/extension-code-block-lowlight"), 1),
  go = i(require("@tiptap/extension-youtube"), 1),
  No = i(require("tiptap-extension-global-drag-handle"), 1);
var R = require("jotai"),
  u = require("react"),
  E = require("cmdk");
var P = require("jotai"),
  L = (0, P.atom)(""),
  b = (0, P.atom)(null);
var A = require("jotai"),
  H = (0, A.createStore)();
var s = require("react/jsx-runtime"),
  h = (0, u.createContext)({});
var v = (0, u.forwardRef)(({ children: o, className: t, ...e }, n) => {
    const [r, m] = (0, R.useAtom)(L);
    return (0, s.jsx)(h.Consumer, {
      children: (d) =>
        (0, s.jsx)(d.In, {
          children: (0, s.jsxs)(E.Command, {
            ref: n,
            onKeyDown: (x) => {
              x.stopPropagation();
            },
            id: "slash-command",
            className: t,
            ...e,
            children: [
              (0, s.jsx)(E.Command.Input, {
                value: r,
                onValueChange: m,
                style: { display: "none" },
              }),
              o,
            ],
          }),
        }),
    });
  }),
  D = E.Command.List;
v.displayName = "EditorCommand";
var Ao = q.default.configure({
    placeholder: ({ node: o }) =>
      o.type.name === "heading"
        ? `Heading ${o.attrs.level}`
        : "Press '/' for commands",
    includeChildren: !0,
  }),
  U = [
    F.default,
    z.default,
    W.Color,
    O.default.configure({ multicolor: !0 }),
    J.Markdown.configure({ html: !1, transformCopiedText: !0 }),
    k,
  ],
  Ho = $.default.extend({
    addInputRules() {
      return [
        new K.InputRule({
          find: /^(?:---|—-|___\s|\*\*\*\s)$/u,
          handler: ({ state: o, range: t }) => {
            const e = {},
              { tr: n } = o,
              r = t.from,
              m = t.to;
            n.insert(r - 1, this.type.create(e)).delete(
              n.mapping.map(r),
              n.mapping.map(m),
            );
          },
        }),
      ];
    },
  });
var c = require("react/jsx-runtime"),
  G = ({ children: o }) => {
    const t = (0, p.useRef)((0, V.default)()).current;
    return (0, c.jsx)(Q.Provider, {
      store: H,
      children: (0, c.jsx)(h.Provider, { value: t, children: o }),
    });
  },
  g = (0, p.forwardRef)(
    ({ className: o, children: t, initialContent: e, ...n }, r) => {
      const m = (0, p.useMemo)(
        () => [...U, ...(n.extensions ?? [])],
        [n.extensions],
      );
      return (0, c.jsx)("div", {
        ref: r,
        className: o,
        children: (0, c.jsx)(_.EditorProvider, {
          ...n,
          content: e,
          extensions: m,
          children: t,
        }),
      });
    },
  );
g.displayName = "EditorContent";
var l = require("@tiptap/react"),
  a = require("react"),
  N = require("react/jsx-runtime"),
  T = (0, a.forwardRef)(({ children: o, tippyOptions: t, ...e }, n) => {
    const { editor: r } = (0, l.useCurrentEditor)(),
      m = (0, a.useRef)(null);
    (0, a.useEffect)(() => {
      !m.current ||
        !t?.placement ||
        (m.current.setProps({ placement: t.placement }),
        m.current.popperInstance?.update());
    }, [t?.placement]);
    const d = (0, a.useMemo)(
      () => ({
        shouldShow: ({ editor: f, state: io }) => {
          const { selection: B } = io,
            { empty: ao } = B;
          return !(
            !f.isEditable ||
            f.isActive("image") ||
            ao ||
            (0, l.isNodeSelection)(B)
          );
        },
        tippyOptions: {
          onCreate: (f) => {
            m.current = f;
          },
          moveTransition: "transform 0.15s ease-out",
          ...t,
        },
        ...e,
      }),
      [e, t],
    );
    return r
      ? (0, N.jsx)("div", {
          ref: n,
          children: (0, N.jsx)(l.BubbleMenu, { editor: r, ...d, children: o }),
        })
      : null;
  });
T.displayName = "EditorBubble";
var Y = require("react"),
  X = require("@radix-ui/react-slot"),
  Z = require("@tiptap/react"),
  j = require("react/jsx-runtime"),
  I = (0, Y.forwardRef)(({ children: o, asChild: t, onSelect: e, ...n }, r) => {
    const { editor: m } = (0, Z.useCurrentEditor)(),
      d = t ? X.Slot : "div";
    return m
      ? (0, j.jsx)(d, { ref: r, ...n, onClick: () => e?.(m), children: o })
      : null;
  });
I.displayName = "EditorBubbleItem";
var oo = require("react"),
  y = require("cmdk"),
  to = require("@tiptap/react"),
  eo = require("jotai");
var no = require("react/jsx-runtime"),
  S = (0, oo.forwardRef)(({ children: o, onCommand: t, ...e }, n) => {
    const { editor: r } = (0, to.useCurrentEditor)(),
      m = (0, eo.useAtomValue)(b);
    return !r || !m
      ? null
      : (0, no.jsx)(y.CommandItem, {
          ref: n,
          ...e,
          onSelect: () => t({ editor: r, range: m }),
          children: o,
        });
  });
S.displayName = "EditorCommandItem";
var ro = y.CommandEmpty;
0 &&
  (module.exports = {
    EditorBubble,
    EditorBubbleItem,
    EditorCommand,
    EditorCommandEmpty,
    EditorCommandItem,
    EditorCommandList,
    EditorContent,
    EditorRoot,
    useEditor,
  });
