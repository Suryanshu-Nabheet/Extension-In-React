import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"

interface CodeBlockTimer {
  startTime: number
  totalTime: number
  isActive: boolean
}

interface CodeTimerStorage {
  timers: { [key: number]: CodeBlockTimer }
}

export interface CodeTimerOptions {
  updateInterval: number
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    codeTimer: {
      startTimer: (pos: number) => ReturnType
      stopTimer: (pos: number) => ReturnType
      resetTimer: (pos: number) => ReturnType
    }
  }
}

export const CodeTimer = Extension.create<CodeTimerOptions>({
  name: "codeTimer",

  addOptions() {
    return {
      updateInterval: 1000, // Update every second
    }
  },

  addStorage() {
    return {
      timers: {},
    } as CodeTimerStorage
  },

  addCommands() {
    return {
      startTimer:
        (pos: number) =>
        ({ editor }) => {
          const timers = { ...this.storage.timers }
          timers[pos] = {
            startTime: Date.now(),
            totalTime: timers[pos]?.totalTime || 0,
            isActive: true,
          }
          this.storage.timers = timers
          return true
        },
      stopTimer:
        (pos: number) =>
        ({ editor }) => {
          const timers = { ...this.storage.timers }
          if (timers[pos] && timers[pos].isActive) {
            const elapsed = Date.now() - timers[pos].startTime
            timers[pos] = {
              ...timers[pos],
              totalTime: timers[pos].totalTime + elapsed,
              isActive: false,
            }
            this.storage.timers = timers
          }
          return true
        },
      resetTimer:
        (pos: number) =>
        ({ editor }) => {
          const timers = { ...this.storage.timers }
          delete timers[pos]
          this.storage.timers = timers
          return true
        },
    }
  },

  addProseMirrorPlugins() {
    const extension = this
    let updateInterval: NodeJS.Timeout

    return [
      new Plugin({
        key: new PluginKey("codeTimer"),
        view(view) {
          updateInterval = setInterval(() => {
            view.dispatch(view.state.tr)
          }, extension.options.updateInterval)

          return {
            destroy() {
              clearInterval(updateInterval)
            },
          }
        },
        props: {
          decorations(state) {
            const { doc } = state
            const decorations: Decoration[] = []

            doc.descendants((node, pos) => {
              if (node.type.name === "codeBlock") {
                const timer = extension.storage.timers[pos]
                if (timer) {
                  const currentTime = timer.isActive
                    ? timer.totalTime + (Date.now() - timer.startTime)
                    : timer.totalTime

                  const minutes = Math.floor(currentTime / 60000)
                  const seconds = Math.floor((currentTime % 60000) / 1000)

                  const timerDiv = document.createElement("div")
                  timerDiv.className = "code-block-timer"
                  timerDiv.textContent = `⏱ ${minutes}:${seconds.toString().padStart(2, "0")}`

                  decorations.push(
                    Decoration.widget(pos, timerDiv, {
                      key: `timer-${pos}`,
                    }),
                  )
                }
              }
            })

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})

