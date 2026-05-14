const worker = new Worker(new URL('./pyodideWorker.ts', import.meta.url), { type: 'classic' });

let idCounter = 0;
const pending = new Map<number, { resolve: (value: any) => void; reject: (reason: any) => void }>();
let initPromise: Promise<void> | null = null;

worker.onmessage = (e: MessageEvent) => {
  const { id, type, result, error, stdout, lineTrace, stdoutCounts, events } = e.data;
  const handler = pending.get(id);
  if (!handler) return;
  pending.delete(id);

  if (type === 'ready') {
    handler.resolve(undefined);
  } else if (type === 'result') {
    handler.resolve({ result, stdout, lineTrace, stdoutCounts, events });
  } else if (type === 'error') {
    handler.resolve({ result: null, stdout: stdout ?? [], lineTrace: [], stdoutCounts: [], events: [], error });
  }
};

function rejectPending(error: Error) {
  for (const handler of pending.values()) {
    handler.reject(error);
  }
  pending.clear();
  initPromise = null;
}

worker.onerror = (event: ErrorEvent) => {
  rejectPending(new Error(event.message || 'Pyodide worker failed to load'));
};

worker.onmessageerror = () => {
  rejectPending(new Error('Pyodide worker returned an unreadable message'));
};

function send(type: string, data: any = {}): Promise<any> {
  const id = idCounter++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    worker.postMessage({ id, type, ...data });
  });
}

export async function initPyodide(): Promise<void> {
  if (!initPromise) {
    initPromise = send('init').then((response) => {
      if (response?.error) {
        throw new Error(response.error);
      }
    }).catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

export async function runPython(code: string): Promise<{ result: string | null; stdout: string[] }> {
  try {
    await initPyodide();
    return send('run', { code });
  } catch (err: any) {
    return { result: null, stdout: [], error: err?.message ?? String(err) } as any;
  }
}

import type { PythonModule, GameEvent } from '../types';

export async function runPythonTraced(
  code: string,
  modules?: PythonModule[],
  levelData?: Record<string, any>,
  evaluate?: string,
): Promise<{ result: string | null; stdout: string[]; lineTrace: number[]; stdoutCounts: number[]; events: GameEvent[]; error?: string }> {
  try {
    await initPyodide();
    return send('run', { code, trace: true, modules, levelData, evaluate });
  } catch (err: any) {
    return {
      result: null,
      stdout: [],
      lineTrace: [],
      stdoutCounts: [],
      events: [],
      error: err?.message ?? String(err),
    };
  }
}
