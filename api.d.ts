/**
 * Caelune plugin API — ambient declarations for plugin authors.
 *
 * A plugin is a folder: one SKILL.md (frontmatter + instructions) plus any
 * .js / .html / .css files. All plugin JS runs in a Web Worker; the `caelune`
 * namespace below is injected before plugin code. Members marked
 * `[capability: X]` exist only when X is declared in SKILL.md's
 * `capabilities:` list — the host enforces declarations per call.
 *
 * Frontmatter:
 *   ---
 *   name: My Plugin
 *   description: What it does
 *   version: 1.0.0
 *   capabilities:
 *     - storage
 *     - settings.customCss
 *     - network
 *   tools:
 *     - name: my_tool
 *       description: Shown to the model
 *       parameters: {"type":"object","properties":{...}}
 *       run: tools/main.js
 *   components:
 *     - name: my-card
 *       html: components/card.html
 *       css: components/card.css
 *       js: components/card.js
 *   ---
 */

/** A tool's return value. `content` is text the model reads; `render` paints
 * a component card inside the assistant message. */
interface CaeluneToolResult {
  content: string;
  render?: CaeluneRender;
}

interface CaeluneRender {
  /** Mount a named component declared in SKILL.md. */
  component?: string;
  props?: Record<string, unknown>;
  /** Or render inline markup directly (no component needed). */
  html?: string;
  css?: string;
}

/** Per-instance DOM bridge given to component mounts. Ops are sandboxed to
 * that component's iframe; `on(name, cb)` receives `data-emit`/`submit`
 * events; `on('unmount', cb)` runs on teardown (clear timers there). */
interface CaeluneUi {
  text(sel: string, text: string): void;
  html(sel: string, html: string): void;
  attr(sel: string, name: string, value: string): void;
  on(name: 'unmount' | (string & {}), cb: (data: unknown) => void | Promise<void>): void;
}

interface CaeluneComponentCtx {
  ui: CaeluneUi;
  props: Record<string, unknown>;
}

interface CaeluneToolCtx {
  fetch: typeof fetch;
  console: Console;
}

interface CaeluneApi {
  /** Register a tool implementation. `name` must match a `tools:` entry in
   * SKILL.md; the model calls it with `args` matching `parameters`. */
  tool(
    name: string,
    run: (args: Record<string, unknown>, ctx: CaeluneToolCtx) => unknown,
  ): void;

  /** Register a component. Mount receives `{ui, props}` — ui is bound to that
   * card's sandboxed iframe. */
  component(name: string, mount: (ctx: CaeluneComponentCtx) => unknown): void;

  log(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;

  /** [capability: storage] Per-plugin persistent KV (survives reloads and
   * plugin updates; wiped on uninstall; ~64KB budget). */
  storage: {
    get(key: string): Promise<unknown>;
    set(key: string, value: unknown): Promise<boolean>;
    del(key: string): Promise<unknown>;
    keys(): Promise<string[]>;
  };

  /** [capability: settings.<key>] Read/write whitelisted app settings.
   * Currently only `customCss` (≤50KB) is grantable. */
  settings: {
    get(key: string): Promise<unknown>;
    set(key: string, value: unknown): Promise<unknown>;
  };

  /** [capability: network] Explicit network access (declares intent; the
   * worker's ambient fetch exists regardless). */
  fetch: typeof fetch;

  /** [capability: files] Per-plugin workspaces of persistent text files
   * (survive reloads; wiped on uninstall). Workspace names: 1-40 chars of
   * letters/digits/_/-, no dots. Paths: ≤8 segments of [\w.-], `.`/`..`
   * rejected. Caps: 20 workspaces, 200 files each, 256KB per file, 2MB per
   * workspace. `write` auto-creates a missing workspace; `read` is ranged
   * (16KB default, 48KB max) so big files stay out of context. */
  files: {
    workspaces(): Promise<string[]>;
    createWs(name: string): Promise<boolean>;
    removeWs(name: string): Promise<boolean>;
    /** Rename a workspace — every file moves under the new prefix. */
    renameWs(name: string, to: string): Promise<boolean>;
    list(ws: string, prefix?: string): Promise<{ path: string; size: number }[]>;
    stat(ws: string, path: string): Promise<{ path: string; size: number } | null>;
    /** Char mode `{offset,length}` or line mode `{line,count}` (1-based). */
    read(
      ws: string,
      path: string,
      opts?: { offset?: number; length?: number; line?: number; count?: number },
    ): Promise<{
      path: string;
      size: number;
      offset: number;
      content: string;
      hasMore: boolean;
      totalLines?: number;
    }>;
    write(
      ws: string,
      path: string,
      content: string,
      opts?: { append?: boolean },
    ): Promise<{ path: string; bytes: number; size: number }>;
    /** Surgical replace — `old` must match once unless `all: true`;
     * ambiguous matches are rejected rather than hitting the wrong span. */
    edit(
      ws: string,
      path: string,
      opts: { old: string; new: string; all?: boolean },
    ): Promise<{ path: string; replaced: number; size: number }>;
    /** Substring search — returns `path:line` hits (cap 60). */
    search(
      ws: string,
      opts: { query: string; prefix?: string; ci?: boolean; max?: number },
    ): Promise<{
      query: string;
      matches: { path: string; line: number; text: string }[];
      truncated: boolean;
    }>;
    remove(ws: string, path: string): Promise<boolean>;
    move(ws: string, from: string, to: string): Promise<boolean>;
    /** Triggers a real browser download — `path` saves that file as
     * `ws--path`; omitted, exports the whole workspace as a `ws-export.md`
     * markdown bundle. Content never passes through the worker. */
    download(ws: string, path?: string): Promise<boolean>;
  };

  /* -- Deprecated v1 aliases (kept working) -- */
  /** @deprecated Use `storage` (capability: storage). */
  store: CaeluneApi['storage'];
  /** @deprecated Use `settings.get('customCss')` (capability: settings.customCss). */
  getCustomCss(): Promise<unknown>;
  /** @deprecated Use `settings.set('customCss', v)`. */
  setCustomCss(css: string): Promise<unknown>;
}

declare const caelune: CaeluneApi;

/** @deprecated Use `caelune.tool` — kept for v1 plugins. */
declare function tool(
  name: string,
  run: (args: Record<string, unknown>, ctx: CaeluneToolCtx) => unknown,
): void;
/** @deprecated Use `caelune.component` — note v1 mounts were `(ui, props)`;
 * v2 mounts receive a single `{ui, props}` ctx. Both arities still run. */
declare function component(
  name: string,
  mount: ((ui: CaeluneUi, props: Record<string, unknown>) => unknown) &
    ((ctx: CaeluneComponentCtx) => unknown),
): void;
