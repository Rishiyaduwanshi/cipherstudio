"use client";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";
import MonacoIframe from "./MonacoIframe";

const CodeEditor = forwardRef(function CodeEditor(
  { language = "javascript", code, onChange, onCursor, options = {} },
  ref,
) {
  const iframeRef = useRef(null);

  useImperativeHandle(ref, () => ({
    format: () => iframeRef.current?.format(),
    runCommand: (cmd, args) => iframeRef.current?.runCommand(cmd, args),
    getValue: () => iframeRef.current?.getValue(),
    setValue: (v) => iframeRef.current?.setValue(v),
    focus: () => iframeRef.current?.focus(),
    setLanguage: (l) => iframeRef.current?.setLanguage(l),
  }));

  useEffect(() => {}, []);

  return (
    <div className="editor-isolation">
      <MonacoIframe
        ref={iframeRef}
        code={code}
        language={language}
        options={options}
        onChange={onChange}
        onCursor={onCursor}
      />
    </div>
  );
});

export default CodeEditor;
