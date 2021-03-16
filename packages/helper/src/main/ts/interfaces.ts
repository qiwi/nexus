import { AssetXO, ComponentXO, PageAssetXO, PageComponentXO } from '@qiwi/nexus-client'

export type TComponent = ComponentXO

export type TAsset = AssetXO

export type TPaginatedComponent = PageComponentXO

export type TPaginatedAsset = PageAssetXO

export type TAssetInfo = {
  name: string
  version: string
  filePath: string
}

export interface IComponentInfo {
  id: string
  version: string
}
