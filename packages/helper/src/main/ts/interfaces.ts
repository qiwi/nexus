import { AssetXO, ComponentXO, PageAssetXO, PageComponentXO } from '@qiwi/nexus-client'

export type TComponent = ComponentXO

export type TAsset = AssetXO

export type TPaginatedComponent = PageComponentXO

export type TPaginatedAsset = PageAssetXO

export interface IComponentInfo {
  id: string
  version: string
}
