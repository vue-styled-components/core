export interface TypeInfo {
  type: string
  name?: string
  types?: TypeInfo[]
  properties?: Record<string, any>
  typeParameters?: any[]
  optional?: boolean
  literal?: any
}

export interface ImportedType {
  source: string
  originalName?: string
}

export interface TransformResult {
  code: string
  map: any
  props?: string[]
}

export interface TypeParameterInfo {
  isReference: boolean
  name: string
  typeParameters?: any[]
}
