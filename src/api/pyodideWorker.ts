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
    const { trace, modules, levelData } = e.data;
    stdout = [];
    try {
      if (trace) {
        // Event recording state
        const events: Array<{ action: string; args: any[]; step: number }> = [];
        let currentStep = 0;

        // Expose helpers to worker global scope so Python can access them via js.*
        (self as any)._stdout = stdout;
        (self as any)._record_event = (action: string, args: any) => {
          const argsArray = args?.toJs ? args.toJs() : (Array.isArray(args) ? args : []);
          events.push({ action, step: currentStep, args: argsArray });
        };
        (self as any)._set_trace_step = (step: number) => {
          currentStep = step;
        };

        // Register custom Python modules for this level
        if (modules?.length) {
          for (const mod of modules) {
            // Inject levelData as _level_data into the module's namespace
            const dataInjection = levelData != null
              ? `import json\n_level_data = json.loads(${JSON.stringify(JSON.stringify(levelData))})\n`
              : '';
            const fullCode = dataInjection + mod.code;
            await pyodide.runPythonAsync(`
import types, sys
_mod = types.ModuleType(${JSON.stringify(mod.name)})
exec(compile(${JSON.stringify(fullCode)}, ${JSON.stringify(mod.name + '.py')}, 'exec'), _mod.__dict__)
sys.modules[${JSON.stringify(mod.name)}] = _mod
del _mod
`);
          }
        }

        // Wrap user code with sys.settrace to collect line-by-line execution trace,
        // stdout counts at each step, and event step tracking
        const wrappedCode = `
import sys, js
_trace_lines = []
_stdout_counts = []
def _tracer(frame, event, arg):
    if event == 'line' and frame.f_code.co_filename == '<user>':
        _trace_lines.append(frame.f_lineno)
        _stdout_counts.append(int(js._stdout.length))
        js._set_trace_step(int(len(_trace_lines) - 1))
    return _tracer
sys.settrace(_tracer)
exec(compile(${JSON.stringify(code)}, '<user>', 'exec'))
sys.settrace(None)
`;
        await pyodide.runPythonAsync(wrappedCode);
        const lineTrace = pyodide.globals.get('_trace_lines').toJs();
        const stdoutCounts = pyodide.globals.get('_stdout_counts').toJs();
        self.postMessage({ id, type: 'result', result: null, stdout, lineTrace, stdoutCounts, events });
      } else {
        const result = await pyodide.runPythonAsync(code);
        self.postMessage({ id, type: 'result', result: result?.toString() ?? null, stdout });
      }
    } catch (err: any) {
      self.postMessage({ id, type: 'error', error: err.message, stdout });
    }
  }
};
