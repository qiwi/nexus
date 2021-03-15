import { IComponentInfo, INexusHelper, NexusComponentsHelper, TComponent } from '@qiwi/nexus-helper'

import { IPackageOpts } from './interfaces'
import { question } from './utils'

export const execute = async (
  packageOpts: IPackageOpts,
  helper: INexusHelper,
  prompt = true,
  skipErrors = false
): Promise<void> => {
  const components = await getAllComponents(
    helper,
    {
      repository: packageOpts.repo,
      group: packageOpts.group,
      name: packageOpts.name,
    }
  )
  const componentsToBeDeleted = getComponentsToBeDeleted(components, packageOpts)

  if (componentsToBeDeleted.length === 0) {
    console.log('Components with such parameters are not found')
    return
  }

  if (prompt) {
    console.table(componentsToBeDeleted, ['repository', 'group', 'name', 'version', 'id'])
    const answer = await question(`These components are going to be deleted. Proceed? (yes/no) `)
    if (answer !== 'yes') {
      return
    }
  }

  const ids = componentsToBeDeleted.map((item: IComponentInfo) => item.id)

  if (skipErrors) {
    const responses = await helper.deleteComponentsByIdsSettled(ids)
    processDeletionResults(responses, ids)
    return
  }

  await helper.deleteComponentsByIds(ids)
  console.log('Done.')
}

export const processDeletionResults = (responses: any[], ids: string[]): void => {
  const rejectedResults = responses
    .map((response: any, i: number) => ({ response, id: ids[i] }))
    .filter(result => result.response.status === 'rejected')

  if (rejectedResults.length < responses.length) {
    console.log('Done.')
  }

  if (rejectedResults.length > 0) {
    console.log('Following components have not been deleted due to errors')
    rejectedResults.forEach(({ id, response }: any) => console.log(id, response.reason?.message || response.reason))
  }
}

export const getComponentsToBeDeleted = (components: TComponent[], packageOpts: IPackageOpts): IComponentInfo[] => {
  return NexusComponentsHelper.filterComponentsByRange(
    packageOpts.group === null
      ? components.filter(value => value.group === null)
      : components,
    packageOpts.range
  )
}

export const getAllComponents = async (
  helper: INexusHelper,
  opts: Parameters<INexusHelper['getPackageComponents']>[0]
): Promise<TComponent[]> => {
  const data = await helper.getPackageComponents(opts)
  let token = data.continuationToken
  const components = [...(data.items || [])]

  while (token) {
    const { items, continuationToken } = await helper.getPackageComponents(opts, token)
    token = continuationToken
    components.push(...(items || []))
  }

  return components
}
