import { deriveFunctionSurfaceMode, type FunctionSurfaceMode, type PluginPostitObject } from "./postitObject"

export type PluginFunctionRole = "contextual" | "primary" | "workspace"

export type PluginFunctionPresentation = {
  label: string
  role: PluginFunctionRole
}

export type PluginFunctionDescriptor = {
  id: string
  label: string
  priority: number
  dependencies?: {
    pluginIds?: string[]
    forbiddenImports?: string[]
  }
  surfaces: Partial<Record<Exclude<FunctionSurfaceMode, "hidden">, PluginFunctionPresentation>>
}

export type DerivedPluginFunction = {
  id: string
  label: string
  role: PluginFunctionRole
  priority: number
}

export type PluginFunctionSurface = {
  instanceId: string
  pluginId: string
  mode: FunctionSurfaceMode
  quiet: boolean
  functions: DerivedPluginFunction[]
}

export function derivePluginFunctionSurface(
  postit: PluginPostitObject,
  descriptors: readonly PluginFunctionDescriptor[],
): PluginFunctionSurface {
  const mode = deriveFunctionSurfaceMode(postit)
  if (mode === "hidden") {
    return {
      instanceId: postit.instanceId,
      pluginId: postit.pluginId,
      mode,
      quiet: true,
      functions: [],
    }
  }

  return {
    instanceId: postit.instanceId,
    pluginId: postit.pluginId,
    mode,
    quiet: false,
    functions: descriptors
      .filter((descriptor) => descriptor.surfaces[mode] !== undefined)
      .sort((left, right) => left.priority - right.priority || left.id.localeCompare(right.id))
      .map((descriptor) => {
        const presentation = descriptor.surfaces[mode]
        if (presentation === undefined) {
          throw new Error(`missing ${mode} presentation for ${descriptor.id}`)
        }
        return {
          id: descriptor.id,
          label: presentation.label,
          role: presentation.role,
          priority: descriptor.priority,
        }
      }),
  }
}
