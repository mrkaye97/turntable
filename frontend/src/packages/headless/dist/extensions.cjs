"use client";
var ee = Object.create;
var p = Object.defineProperty;
var te = Object.getOwnPropertyDescriptor;
var oe = Object.getOwnPropertyNames;
var re = Object.getPrototypeOf,
  ne = Object.prototype.hasOwnProperty;
var ie = (e, o) => {
    for (var t in o) p(e, t, { get: o[t], enumerable: !0 });
  },
  C = (e, o, t, r) => {
    if ((o && typeof o == "object") || typeof o == "function")
      for (const n of oe(o))
        !ne.call(e, n) &&
          n !== t &&
          p(e, n, {
            get: () => o[n],
            enumerable: !(r = te(o, n)) || r.enumerable,
          });
    return e;
  };
var i = (e, o, t) => (
    (t = e != null ? ee(re(e)) : {}),
    C(
      o || !e || !e.__esModule
        ? p(t, "default", { value: e, enumerable: !0 })
        : t,
      e,
    )
  ),
  se = (e) => C(p({}, "__esModule", { value: !0 }), e);
var xe = {};
ie(xe, {
  AIHighlight: () => de,
  CharacterCount: () => X.default,
  CodeBlockLowlight: () => J.default,
  Command: () => pe,
  GlobalDragHandle: () => j.default,
  HorizontalRule: () => Ce,
  ImageResizer: () => T,
  InputRule: () => R.InputRule,
  Placeholder: () => ye,
  StarterKit: () => Y.default,
  TaskItem: () => F.TaskItem,
  TaskList: () => G.TaskList,
  TiptapImage: () => B.default,
  TiptapLink: () => U.default,
  UpdatedImage: () => S,
  Youtube: () => Z.default,
  addAIHighlight: () => le,
  createSuggestionItems: () => fe,
  handleCommandNavigation: () => he,
  inputRegex: () => w,
  pasteRegex: () => H,
  removeAIHighlight: () => ce,
  renderItems: () => ge,
  simpleExtensions: () => Re,
});
module.exports = se(xe);
var R = require("@tiptap/core"),
  D = require("@tiptap/extension-color"),
  $ = i(require("@tiptap/extension-highlight"), 1),
  q = i(require("@tiptap/extension-horizontal-rule"), 1),
  B = i(require("@tiptap/extension-image"), 1),
  U = i(require("@tiptap/extension-link"), 1),
  W = i(require("@tiptap/extension-placeholder"), 1),
  F = require("@tiptap/extension-task-item"),
  G = require("@tiptap/extension-task-list"),
  _ = i(require("@tiptap/extension-text-style"), 1),
  Q = i(require("@tiptap/extension-underline"), 1),
  Y = i(require("@tiptap/starter-kit"), 1),
  V = require("tiptap-markdown");
var x = require("@tiptap/core"),
  ae = x.Extension.create({
    name: "CustomKeymap",
    addCommands() {
      return {
        selectTextWithinNodeBoundaries:
          () =>
          ({ editor: e, commands: o }) => {
            const { state: t } = e,
              { tr: r } = t,
              n = r.selection.$from.start(),
              s = r.selection.$to.end();
            return o.setTextSelection({ from: n, to: s });
          },
      };
    },
    addKeyboardShortcuts() {
      return {
        "Mod-a": ({ editor: e }) => {
          const { state: o } = e,
            { tr: t } = o,
            r = t.selection.from,
            n = t.selection.to,
            s = t.selection.$from.start(),
            c = t.selection.$to.end();
          return r > s || n < c
            ? (e.chain().selectTextWithinNodeBoundaries().run(), !0)
            : !1;
        },
      };
    },
  }),
  b = ae;
var E = require("@tiptap/react"),
  I = i(require("react-moveable"), 1),
  A = require("react/jsx-runtime"),
  T = () => {
    const { editor: e } = (0, E.useCurrentEditor)();
    if (!e?.isActive("image")) return null;
    const o = () => {
      const t = document.querySelector(".ProseMirror-selectednode");
      if (t) {
        const r = e.state.selection,
          n = e.commands.setImage;
        n({
          src: t.src,
          width: Number(t.style.width.replace("px", "")),
          height: Number(t.style.height.replace("px", "")),
        }),
          e.commands.setNodeSelection(r.from);
      }
    };
    return (0, A.jsx)(I.default, {
      target: document.querySelector(".ProseMirror-selectednode"),
      container: null,
      origin: !1,
      edge: !1,
      throttleDrag: 0,
      keepRatio: !0,
      resizable: !0,
      throttleResize: 0,
      onResize: ({ target: t, width: r, height: n, delta: s }) => {
        s[0] && (t.style.width = `${r}px`), s[1] && (t.style.height = `${n}px`);
      },
      onResizeEnd: () => {
        o();
      },
      scalable: !0,
      throttleScale: 0,
      renderDirections: ["w", "e"],
      onScale: ({ target: t, transform: r }) => {
        t.style.transform = r;
      },
    });
  };
var k = i(require("@tiptap/extension-image"), 1),
  me = k.default.extend({
    name: "image",
    addAttributes() {
      return {
        ...this.parent?.(),
        width: { default: null },
        height: { default: null },
      };
    },
  }),
  S = me;
var X = i(require("@tiptap/extension-character-count"), 1),
  J = i(require("@tiptap/extension-code-block-lowlight"), 1),
  Z = i(require("@tiptap/extension-youtube"), 1),
  j = i(require("tiptap-extension-global-drag-handle"), 1);
var a = require("@tiptap/core"),
  w = /(?:^|\s)((?:==)((?:[^~=]+))(?:==))$/,
  H = /(?:^|\s)((?:==)((?:[^~=]+))(?:==))/g,
  de = a.Mark.create({
    name: "ai-highlight",
    addOptions() {
      return { HTMLAttributes: {} };
    },
    addAttributes() {
      return {
        color: {
          default: null,
          parseHTML: (e) =>
            e.getAttribute("data-color") || e.style.backgroundColor,
          renderHTML: (e) =>
            e.color
              ? {
                  "data-color": e.color,
                  style: `background-color: ${e.color}; color: inherit`,
                }
              : {},
        },
      };
    },
    parseHTML() {
      return [{ tag: "mark" }];
    },
    renderHTML({ HTMLAttributes: e }) {
      return [
        "mark",
        (0, a.mergeAttributes)(this.options.HTMLAttributes, e),
        0,
      ];
    },
    addCommands() {
      return {
        setAIHighlight:
          (e) =>
          ({ commands: o }) =>
            o.setMark(this.name, e),
        toggleAIHighlight:
          (e) =>
          ({ commands: o }) =>
            o.toggleMark(this.name, e),
        unsetAIHighlight:
          () =>
          ({ commands: e }) =>
            e.unsetMark(this.name),
      };
    },
    addKeyboardShortcuts() {
      return { "Mod-Shift-h": () => this.editor.commands.toggleAIHighlight() };
    },
    addInputRules() {
      return [(0, a.markInputRule)({ find: w, type: this.type })];
    },
    addPasteRules() {
      return [(0, a.markPasteRule)({ find: H, type: this.type })];
    },
  }),
  ce = (e) => {
    const o = e.state.tr;
    o.removeMark(
      0,
      e.state.doc.nodeSize - 2,
      e.state.schema.marks["ai-highlight"],
    ),
      e.view.dispatch(o);
  },
  le = (e, o) => {
    e.chain()
      .setAIHighlight({ color: o ?? "#c1ecf970" })
      .run();
  };
var z = require("@tiptap/core"),
  L = require("@tiptap/react"),
  K = i(require("@tiptap/suggestion"), 1),
  O = i(require("tippy.js"), 1);
var u = require("jotai"),
  m = require("react"),
  g = require("cmdk");
var f = require("jotai"),
  h = (0, f.atom)(""),
  v = (0, f.atom)(null);
var P = require("jotai"),
  y = (0, P.createStore)();
var d = require("react/jsx-runtime"),
  M = (0, m.createContext)({}),
  N = ({ query: e, range: o }) => {
    const t = (0, u.useSetAtom)(h, { store: y }),
      r = (0, u.useSetAtom)(v, { store: y });
    return (
      (0, m.useEffect)(() => {
        t(e);
      }, [e, t]),
      (0, m.useEffect)(() => {
        r(o);
      }, [o, r]),
      (0, m.useEffect)(() => {
        const n = ["ArrowUp", "ArrowDown", "Enter"],
          s = (c) => {
            if (n.includes(c.key)) {
              c.preventDefault();
              const l = document.querySelector("#slash-command");
              return (
                l &&
                  l.dispatchEvent(
                    new KeyboardEvent("keydown", {
                      key: c.key,
                      cancelable: !0,
                      bubbles: !0,
                    }),
                  ),
                !1
              );
            }
          };
        return (
          document.addEventListener("keydown", s),
          () => {
            document.removeEventListener("keydown", s);
          }
        );
      }, []),
      (0, d.jsx)(M.Consumer, { children: (n) => (0, d.jsx)(n.Out, {}) })
    );
  },
  ue = (0, m.forwardRef)(({ children: e, className: o, ...t }, r) => {
    const [n, s] = (0, u.useAtom)(h);
    return (0, d.jsx)(M.Consumer, {
      children: (c) =>
        (0, d.jsx)(c.In, {
          children: (0, d.jsxs)(g.Command, {
            ref: r,
            onKeyDown: (l) => {
              l.stopPropagation();
            },
            id: "slash-command",
            className: o,
            ...t,
            children: [
              (0, d.jsx)(g.Command.Input, {
                value: n,
                onValueChange: s,
                style: { display: "none" },
              }),
              e,
            ],
          }),
        }),
    });
  }),
  ve = g.Command.List;
ue.displayName = "EditorCommand";
var pe = z.Extension.create({
    name: "slash-command",
    addOptions() {
      return {
        suggestion: {
          char: "/",
          command: ({ editor: e, range: o, props: t }) => {
            t.command({ editor: e, range: o });
          },
        },
      };
    },
    addProseMirrorPlugins() {
      return [
        (0, K.default)({ editor: this.editor, ...this.options.suggestion }),
      ];
    },
  }),
  ge = () => {
    let e = null,
      o = null;
    return {
      onStart: (t) => {
        e = new L.ReactRenderer(N, { props: t, editor: t.editor });
        const { selection: r } = t.editor.state;
        if (r.$from.node(r.$from.depth).type.name === "codeBlock") return !1;
        o = (0, O.default)("body", {
          getReferenceClientRect: t.clientRect,
          appendTo: () => document.body,
          content: e.element,
          showOnCreate: !0,
          interactive: !0,
          trigger: "manual",
          placement: "bottom-start",
        });
      },
      onUpdate: (t) => {
        e?.updateProps(t),
          o?.[0]?.setProps({ getReferenceClientRect: t.clientRect });
      },
      onKeyDown: (t) =>
        t.event.key === "Escape" ? (o?.[0]?.hide(), !0) : e?.ref?.onKeyDown(t),
      onExit: () => {
        o?.[0]?.destroy(), e?.destroy();
      },
    };
  },
  fe = (e) => e,
  he = (e) => {
    if (
      ["ArrowUp", "ArrowDown", "Enter"].includes(e.key) &&
      document.querySelector("#slash-command")
    )
      return !0;
  };
var ye = W.default.configure({
    placeholder: ({ node: e }) =>
      e.type.name === "heading"
        ? `Heading ${e.attrs.level}`
        : "Press '/' for commands",
    includeChildren: !0,
  }),
  Re = [
    Q.default,
    _.default,
    D.Color,
    $.default.configure({ multicolor: !0 }),
    V.Markdown.configure({ html: !1, transformCopiedText: !0 }),
    b,
  ],
  Ce = q.default.extend({
    addInputRules() {
      return [
        new R.InputRule({
          find: /^(?:---|—-|___\s|\*\*\*\s)$/u,
          handler: ({ state: e, range: o }) => {
            const t = {},
              { tr: r } = e,
              n = o.from,
              s = o.to;
            r.insert(n - 1, this.type.create(t)).delete(
              r.mapping.map(n),
              r.mapping.map(s),
            );
          },
        }),
      ];
    },
  });
0 &&
  (module.exports = {
    AIHighlight,
    CharacterCount,
    CodeBlockLowlight,
    Command,
    GlobalDragHandle,
    HorizontalRule,
    ImageResizer,
    InputRule,
    Placeholder,
    StarterKit,
    TaskItem,
    TaskList,
    TiptapImage,
    TiptapLink,
    UpdatedImage,
    Youtube,
    addAIHighlight,
    createSuggestionItems,
    handleCommandNavigation,
    inputRegex,
    pasteRegex,
    removeAIHighlight,
    renderItems,
    simpleExtensions,
  });
