"use client";
import React, { useMemo } from "react";
import {
  LiveProvider,
  LivePreview as RLPreview,
  LiveError as RLLiveError,
} from "react-live";

export default function LivePreview({ files = {} }) {
  const previewWrapper = React.useMemo(
    () => `live-preview-${Math.random().toString(36).slice(2, 8)}`,
    [],
  );
  const scopeCss = (rawCss, wrapper) => {
    if (!rawCss) return "";
    let css = String(rawCss);
    css = css.replace(/:root/g, `.${wrapper}`);
    css = css.replace(/(^|[,\s])html(\b)/g, `$1.${wrapper}$2`);
    css = css.replace(/(^|[,\s])body(\b)/g, `$1.${wrapper}$2`);

    try {
      css = css.replace(/(^|\})\s*([^@{}][^{]+)\s*\{/g, (m, p1, selectors) => {
        const scoped = selectors
          .split(",")
          .map((s) => {
            const raw = s.trim();
            if (!raw) return "";
            if (raw.startsWith(`.${wrapper}`)) return raw;
            if (/^(from|to|\d+%)/.test(raw)) return raw;
            if (raw.startsWith("@")) return raw;
            return `.${wrapper} ${raw}`;
          })
          .join(", ");
        return `${p1} ${scoped} {`;
      });
    } catch (e) {
      return rawCss;
    }
    return css;
  };

  const { hasCommonJS, commonJsFiles } = useMemo(() => {
    const entries = Object.entries(files || {});
    const commons = entries
      .filter(([_, f]) => {
        const code = (f && f.code) || "";
        return /\brequire\s*\(|module\.exports|exports\./.test(code);
      })
      .map(([p]) => p);
    return { hasCommonJS: commons.length > 0, commonJsFiles: commons };
  }, [JSON.stringify(files)]);

  const liveCode = useMemo(() => {
    const jsFiles = Object.keys(files).filter((path) =>
      /\.(js|jsx)$/.test(path),
    );

    const entryCandidates = [
      "/src/main.jsx",
      "/src/index.jsx",
      "/src/main.js",
      "/src/index.js",
    ];
    const entry = entryCandidates.find((p) => files[p]);
    if (!entry) return null;

    const appCandidates = [
      "/src/App.jsx",
      "/src/App.js",
      "/src/App.tsx",
      "/src/App.ts",
    ];
    const appPath = appCandidates.find((p) => files[p]);
    if (!appPath) return null;

    let appCode = (files[appPath] && (files[appPath].code || "")) || "";

    const cssImports = new Map();
    for (const jsFile of jsFiles) {
      const code = files[jsFile]?.code || "";
      const matches = code.matchAll(/^import\s+['"](.+?\.css)['"];?$/gm);
      for (const match of matches) {
        const cssPath = match[1].startsWith("/")
          ? match[1]
          : `/src/${match[1]}`;
        if (files[cssPath]) {
          cssImports.set(jsFile, [...(cssImports.get(jsFile) || []), cssPath]);
        }
      }
    }

    appCode = appCode.replace(/^import\s+['"].+?\.css['"];?$/gm, "");

    appCode = appCode.replace(/^\s*['"]use client['"];?\s*/m, "");

    appCode = appCode.replace(
      /^import\s+[^;]+from\s+['"](?![\.\/]).+?['"];?\s*$/gm,
      "",
    );
    appCode = appCode.replace(/^import\s+['"](?![\.\/]).+?['"];?\s*$/gm, "");

    appCode = appCode.replace(/export\s+default\s+/, "const __APP__ = ");

    appCode = appCode.replace(/^\s*export\s+/gm, "");
    const reactHookNames = [
      "useState",
      "useEffect",
      "useRef",
      "useMemo",
      "useCallback",
      "useContext",
      "useReducer",
      "useLayoutEffect",
      "useImperativeHandle",
      "useDebugValue",
    ];
    reactHookNames.forEach((hook) => {
      const re = new RegExp("\\b" + hook + "\\b", "g");
      appCode = appCode.replace(re, `React.${hook}`);
    });

    const relevantCssSources = new Set();
    const processedFiles = new Set();

    const addCssForFile = (jsFile) => {
      if (processedFiles.has(jsFile)) return;
      processedFiles.add(jsFile);

      const cssFiles = cssImports.get(jsFile) || [];
      cssFiles.forEach((css) => relevantCssSources.add(css));

      const code = files[jsFile]?.code || "";
      const importMatches = code.matchAll(
        /^import.+?from\s+['"](.+?\.jsx?)['"];?$/gm,
      );
      for (const match of Array.from(importMatches)) {
        const importPath = match[1].startsWith("/")
          ? match[1]
          : `/src/${match[1]}`;
        if (files[importPath]) {
          addCssForFile(importPath);
        }
      }
    };

    addCssForFile(appPath);

    const cssText = Array.from(relevantCssSources)
      .map((k) => (files[k] && (files[k].code || "")) || "")
      .filter(Boolean)
      .join("\n");
    const scoped = scopeCss(cssText || "", previewWrapper);
    const cssStr = JSON.stringify(scoped || "");

    const cssInjector = `function __INJECT_CSS(){ React.useEffect(()=>{ if(typeof document !== 'undefined'){ const s=document.createElement('style'); s.setAttribute('data-live-scope','${previewWrapper}'); s.textContent = ${cssStr}; document.head.appendChild(s); return ()=>{ try{ document.head.removeChild(s); }catch(e){} }; } }, []); return null; }`;

    const requireShim = `const require = (name) => { throw new Error('require() is not supported in the in-browser preview. Convert to ESM imports or run the project in a bundler/server.'); }; const module = { exports: {} }; const exports = module.exports;`;

    const final = `(() => {\n${requireShim}\n${appCode}\n\n${cssInjector}\n\n  return React.createElement(React.Fragment, null, React.createElement(__INJECT_CSS, null), React.createElement('div', { className: '${previewWrapper}' }, React.createElement(__APP__, null)));\n})()`;
    return final;
  }, [JSON.stringify(files)]);

  const scope = useMemo(() => ({ React }), []);

  if (hasCommonJS) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-6 text-sm">
        <div className="mb-3 text-destructive font-semibold">
          Preview unavailable — project uses CommonJS (require/module.exports)
        </div>
        <div className="mb-2 text-xs text-neutral-300">
          Files that use CommonJS detected:
        </div>
        <ul className="mb-3 text-xs list-disc list-inside text-neutral-200">
          {commonJsFiles.map((f) => (
            <li key={f}>
              <code className="px-1">{f}</code>
            </li>
          ))}
        </ul>
        {files["/index.html"] && files["/index.html"].code ? (
          <div className="mt-4">
            <div className="mb-2 text-xs text-neutral-300">
              This project contains a static <code>/index.html</code>. You can
              preview it below:
            </div>
            <iframe
              title="static-preview"
              srcDoc={files["/index.html"].code}
              sandbox="allow-scripts allow-same-origin"
              style={{ width: 640, height: 320, border: "1px solid #222" }}
            />
          </div>
        ) : null}
        <div className="mt-4 text-xs text-neutral-400 max-w-xl">
          The in-browser editor preview only supports browser-ready ESM code
          (import/export). Convert CommonJS-style <code>require()</code> calls
          and <code>module.exports</code> to ESM imports/exports or run the
          project in a bundler/server for a full preview.
        </div>
      </div>
    );
  }

  if (!liveCode) {
    if (files["/index.html"] && files["/index.html"].code) {
      return (
        <iframe
          srcDoc={files["/index.html"].code}
          sandbox="allow-scripts allow-same-origin"
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      );
    }
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        No runnable JS files found to preview.
      </div>
    );
  }

  return (
    <div className="h-full w-ful">
      <LiveProvider code={liveCode} scope={scope} noInline={false}>
        <div className="h-full w-full overflow-auto ">
          <RLPreview />
          <RLLiveError />
        </div>
      </LiveProvider>
    </div>
  );
}
