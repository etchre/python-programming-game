importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js');

declare const loadPyodide: any;

let pyodide: any = null;
let stdout: string[] = [];

self.onmessage = async (e: MessageEvent) => {
  const { id, type, code } = e.data;

  if (type === 'init') {
    pyodide = await loadPyodide({
      stdout: (text: string) => stdout.push(text),
      stderr: (text: string) => stdout.push(text),
    });
    self.postMessage({ id, type: 'ready' });
  }

  if (type === 'run') {
    stdout = [];
    try {
      const result = await pyodide.runPythonAsync(code);
      self.postMessage({ id, type: 'result', result: result?.toString() ?? null, stdout });
    } catch (err: any) {
      self.postMessage({ id, type: 'error', error: err.message, stdout });
    }
  }
};
