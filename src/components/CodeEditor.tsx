import { useRef, useEffect } from 'preact/hooks';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { python } from '@codemirror/lang-python';
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
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

		const extensions = [
			basicSetup,
			python(),
			oneDark,
			keymap.of([indentWithTab]),
			EditorView.theme({
				'&': { height: '100%' },
				'.cm-scroller': { overflow: 'auto' },
			}),
		];

		// set up a code update listener only if it is needed
		// if the onCodeChange callback is provided, register this listener
		// this is mainly used when a game canvas needs to read live code changes
		if (onCodeChange) {
			extensions.push(
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						onCodeChange(update.state.doc.toString());
					}
				}),
			);
		}

		const state = EditorState.create({
			doc: initialCode,
			extensions,
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
