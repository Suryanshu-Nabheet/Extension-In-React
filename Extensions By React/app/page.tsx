import TiptapEditor from "@/components/tiptap-editor"

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Tiptap Code Time Tracker</h1>
        <TiptapEditor />
      </div>
    </main>
  )
}

