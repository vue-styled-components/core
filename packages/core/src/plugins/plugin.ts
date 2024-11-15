import { Element } from 'stylis'

type beforeBuildCallback = (element: Element, index: number, children: Element[]) => string | void
type afterBuildCallback = (compiledCss: string) => string | void

interface PluginHooks {
  beforeBuild?: beforeBuildCallback | beforeBuildCallback[]
  afterBuild?: afterBuildCallback | afterBuildCallback[]
}

class Plugin {
  private beforeBuildHooks: beforeBuildCallback[] = []
  private afterBuildHooks: afterBuildCallback[] = []

  register(plugin: PluginHooks) {
    if (plugin.beforeBuild) {
      if (Array.isArray(plugin.beforeBuild)) {
        this.beforeBuildHooks.push(...plugin.beforeBuild)
      } else {
        this.beforeBuildHooks.push(plugin.beforeBuild)
      }
    }
    if (plugin.afterBuild) {
      if (Array.isArray(plugin.afterBuild)) {
        this.afterBuildHooks.push(...plugin.afterBuild)
      } else {
        this.afterBuildHooks.push(plugin.afterBuild)
      }
    }
  }

  runBeforeBuild(element: Element, index: number, children: Element[]) {
    for (const hook of this.beforeBuildHooks) {
      hook(element, index, children)
    }
  }

  runAfterBuild(compiledCss: string) {
    for (const hook of this.afterBuildHooks) {
      const result = hook(compiledCss)
      if (result) {
        compiledCss = result
      }
    }
    return compiledCss
  }
}

export type { Element }
export const plugin = new Plugin()
