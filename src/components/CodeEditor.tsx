import { useRef, useEffect } from 'preact/hooks';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodeEditorProps {
	initialCode?: string;
}

export function CodeEditor({ initialCode = '' }: CodeEditorProps) {
	const editorRef = useRef<HTMLDivElement>(null);
	const viewRef = useRef<EditorView | null>(null);

	useEffect(() => {
		if (!editorRef.current) return;

		const state = EditorState.create({
			doc: initialCode,
			extensions: [
				basicSetup,
				python(),
				oneDark,
				EditorView.theme({
					'&': { height: '100%' },
					'.cm-scroller': { overflow: 'auto' },
				}),
			],
		});

		const view = new EditorView({
			state,
			parent: editorRef.current,
		});

		viewRef.current = view;

		return () => view.destroy();
	}, []);

	return <div ref={editorRef} style={{ height: '100%' }} />;
}
