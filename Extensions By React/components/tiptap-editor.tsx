"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { CodeTimer } from "../extensions/code-timer"
import { useCallback, useEffect } from "react"

export default function TiptapEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      CodeTimer.configure({
        updateInterval: 1000,
      }),
    ],
    content: `
      <h2>Code Time Tracker Demo</h2>
      <p>Start writing code in a code block to track time:</p>
      <pre><code>// Your code here</code></pre>
      <p>Try adding more code blocks to track multiple timers!</p>
    `,
    onUpdate: ({ editor }) => {
      // Find all code blocks and ensure they have timers
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "codeBlock") {
          const timer = editor.extensionStorage.codeTimer.timers[pos]
          if (!timer?.isActive) {
            editor.commands.startTimer(pos)
          }
        }
      })
    },
  })

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!editor) return

      // Stop timer when leaving code block
      if (event.key === "Escape" || event.key === "ArrowUp" || event.key === "ArrowDown") {
        editor.state.doc.descendants((node, pos) => {
          if (node.type.name === "codeBlock") {
            editor.commands.stopTimer(pos)
          }
        })
      }
    },
    [editor],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <div className="max-w-2xl mx-auto p-4">
      <style jsx global>{`
        .code-block-timer {
          position: absolute;
          right: 8px;
          top: 4px;
          font-size: 12px;
          color: #666;
          background: #f0f0f0;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
        }

        .ProseMirror {
          position: relative;
          min-height: 300px;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        .ProseMirror pre {
          position: relative;
          background: #f5f5f5;
          padding: 0.75rem;
          border-radius: 4px;
          margin: 1rem 0;
        }
      `}</style>
      <EditorContent editor={editor} />
    </div>
  )
}

