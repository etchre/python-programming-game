import { useRef, useEffect } from 'preact/hooks';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { MutableRef } from 'preact/hooks';

interface CodeEditorProps {
	initialCode?: string;
	editorViewRef?: MutableRef<EditorView | null>;
	onCodeChange?: (code: string) => void;
}

export function CodeEditor({ initialCode = '', editorViewRef, onCodeChange }: CodeEditorProps) {
	const editorRef = useRef<HTMLDivElement>(null);

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
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						onCodeChange?.(update.state.doc.toString());
					}
				}),
			],
		});

		const view = new EditorView({
			state,
			parent: editorRef.current,
		});

		if (editorViewRef) editorViewRef.current = view;

		return () => {
			view.destroy();
			if (editorViewRef) editorViewRef.current = null;
		};
	}, []);

	return <div ref={editorRef} style={{ height: '100%' }} />;
}
