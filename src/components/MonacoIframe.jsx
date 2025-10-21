'use client';
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

// A lightweight iframe-based Monaco host. Communicates via postMessage.
const MonacoIframe = forwardRef(function MonacoIframe({ code = '', language = 'javascript', options = {}, onChange, onCursor }, ref) {
  const iframeRef = useRef(null);
  const isReadyRef = useRef(false);
  const initializedRef = useRef(false);
  const pendingRequests = useRef(new Map());
  const requestId = useRef(1);

  useEffect(() => {
    function handleMessage(e) {
      const msg = e.data;
      if (!msg || !msg.type) return;
      if (msg.type === 'ready') {
        // Monaco in iframe reports ready after it has processed an 'init' call.
        // Mark as ready so later setValue/getValue calls can resolve against an
        // already-created editor.
        isReadyRef.current = true;
        return;
      }

      if (msg.type === 'change') {
        // Record the latest content seen from the iframe so the parent's
        // effect that posts 'setValue' does not echo the exact same content
        // back into Monaco (which would reset the cursor/selection).
        lastSentRef.current = msg.value;
        if (typeof onChange === 'function') onChange(msg.value);
        return;
      }

      if (msg.type === 'cursor') {
        if (typeof onCursor === 'function') onCursor(msg.value);
        return;
      }

      if (msg.type === 'value' && msg.id) {
        const resolver = pendingRequests.current.get(msg.id);
        if (resolver) {
          resolver(msg.value);
          pendingRequests.current.delete(msg.id);
        }
      }

      if (msg.type === 'iframe-loaded') {
        // iframe JS has loaded and is listening. Send the initial 'init'
        // payload once so the iframe can create the editor/model. The
        // iframe will respond with 'ready' after it finishes creating the
        // Monaco editor.
        if (!initializedRef.current) {
          initializedRef.current = true;
          lastSentRef.current = code;
          post({ type: 'init', value: { content: code || '', language, options } });
        }
        return;
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onChange, onCursor, code, language, options]);

  function post(msg) {
    const w = iframeRef.current && iframeRef.current.contentWindow;
    if (!w) return;
    w.postMessage(msg, '*');
  }

  useImperativeHandle(ref, () => ({
    format: () => post({ type: 'format' }),
    runCommand: (cmd, args) => post({ type: 'runCommand', value: cmd, args }),
    undo: () => post({ type: 'undo' }),
    redo: () => post({ type: 'redo' }),
    setValue: (v) => post({ type: 'setValue', value: v }),
    getValue: () => {
      return new Promise((resolve) => {
        const id = String(requestId.current++);
        pendingRequests.current.set(id, resolve);
        post({ type: 'getValue', id });
        // timeout if no response
        setTimeout(() => {
          if (pendingRequests.current.has(id)) {
            pendingRequests.current.delete(id);
            resolve('');
          }
        }, 3000);
      });
    },
    setLanguage: (lang) => post({ type: 'setLanguage', value: lang }),
    focus: () => post({ type: 'focus' }),
  }));

  // When code prop updates from parent, send new value (avoid re-sending on every render if same)
  const lastSentRef = useRef(code);
  useEffect(() => {
    if (code === lastSentRef.current) return;
    lastSentRef.current = code;
    post({ type: 'setValue', value: code });
  }, [code]);

  // If iframe is navigated away or reload we may need to re-init. Watch language changes.
  useEffect(() => {
    if (!isReadyRef.current) return;
    post({ type: 'setLanguage', value: language });
  }, [language]);

  return (
    <iframe
      ref={iframeRef}
      src="/monaco-iframe.html"
      title="Monaco Editor"
      sandbox="allow-scripts allow-same-origin"
      style={{ border: 0, width: '100%', height: '100%' }}
    />
  );
});

export default MonacoIframe;