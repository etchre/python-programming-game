importScripts('https://cdn.jsdelivr.net/pyodide/v0.29.3/full/pyodide.js');

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
    const { trace } = e.data;
    stdout = [];
    try {
      if (trace) {
        // Expose stdout array to Python so the tracer can snapshot its length
        (self as any)._stdout = stdout;

        // Wrap user code with sys.settrace to collect line-by-line execution trace
        // and stdout counts at each step for synchronized console playback
        const wrappedCode = `
import sys, js
_trace_lines = []
_stdout_counts = []
def _tracer(frame, event, arg):
    if event == 'line' and frame.f_code.co_filename == '<user>':
        _trace_lines.append(frame.f_lineno)
        _stdout_counts.append(int(js._stdout.length))
    return _tracer
sys.settrace(_tracer)
exec(compile(${JSON.stringify(code)}, '<user>', 'exec'))
sys.settrace(None)
`;
        await pyodide.runPythonAsync(wrappedCode);
        const lineTrace = pyodide.globals.get('_trace_lines').toJs();
        const stdoutCounts = pyodide.globals.get('_stdout_counts').toJs();
        self.postMessage({ id, type: 'result', result: null, stdout, lineTrace, stdoutCounts });
      } else {
        const result = await pyodide.runPythonAsync(code);
        self.postMessage({ id, type: 'result', result: result?.toString() ?? null, stdout });
      }
    } catch (err: any) {
      self.postMessage({ id, type: 'error', error: err.message, stdout });
    }
  }
};
