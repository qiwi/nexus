import { ComponentXO, PageComponentXO } from '@qiwi/nexus-client'

export type TComponent = ComponentXO

export type TPaginatedResult = PageComponentXO

export interface IComponentInfo {
  id: string
  version: string
}
