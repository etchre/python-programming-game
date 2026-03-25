import { useRef, useEffect } from 'preact/hooks';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, StateEffect, StateField } from '@codemirror/state';
import { Decoration, type DecorationSet } from '@codemirror/view';
import { python } from '@codemirror/lang-python';
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';
import { MutableRef } from 'preact/hooks';

// Line highlight effect and field for playback stepping
const setHighlightLine = StateEffect.define<number | null>();

const highlightLineMark = Decoration.line({
	attributes: { style: 'background-color: rgba(255, 213, 79, 0.35)' },
});

const highlightLineField = StateField.define<DecorationSet>({
	create() {
		return Decoration.none;
	},
	update(decos, tr) {
		for (const e of tr.effects) {
			if (e.is(setHighlightLine)) {
				if (e.value === null) return Decoration.none;
				const lineCount = tr.state.doc.lines;
				if (e.value < 1 || e.value > lineCount) return Decoration.none;
				const line = tr.state.doc.line(e.value);
				return Decoration.set([highlightLineMark.range(line.from)]);
			}
		}
		return decos;
	},
	provide: (f) => EditorView.decorations.from(f),
});

export function highlightLine(view: EditorView, lineNumber: number | null) {
	view.dispatch({ effects: setHighlightLine.of(lineNumber) });
}

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
			highlightLineField,
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
