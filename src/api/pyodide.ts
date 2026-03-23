const worker = new Worker(new URL('./pyodideWorker.ts', import.meta.url), { type: 'classic' });

let idCounter = 0;
const pending = new Map<number, { resolve: (value: any) => void; reject: (reason: any) => void }>();
let initPromise: Promise<void> | null = null;

worker.onmessage = (e: MessageEvent) => {
  const { id, type, result, error, stdout } = e.data;
  const handler = pending.get(id);
  if (!handler) return;
  pending.delete(id);

  if (type === 'ready') {
    handler.resolve(undefined);
  } else if (type === 'result') {
    handler.resolve({ result, stdout });
  } else if (type === 'error') {
    handler.reject({ error, stdout });
  }
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
    initPromise = send('init');
  }
  return initPromise;
}

export async function runPython(code: string): Promise<{ result: string | null; stdout: string[] }> {
  await initPyodide();
  return send('run', { code });
}
