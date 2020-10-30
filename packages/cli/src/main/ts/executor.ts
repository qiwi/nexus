import { IComponentInfo, INexusHelper, NexusComponentsHelper } from '@qiwi/nexus-helper'

import { IPackageOpts } from './interfaces'
import { question } from './utils'

export const execute = async (
  packageOpts: IPackageOpts,
  helper: INexusHelper,
  prompt = true
): Promise<void> => {
  const components = await helper.getPackageComponents({
    repository: packageOpts.repo,
    group: packageOpts.group,
    name: packageOpts.name,
  })

  const componentsToBeDeleted = NexusComponentsHelper.filterComponentsByRange(
    packageOpts.group === null
      ? components.filter(value => value.group === null)
      : components,
    packageOpts.range
  )

  if(componentsToBeDeleted.length === 0) {
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

  await helper.deleteComponentsByIds(componentsToBeDeleted.map((item: IComponentInfo) => item.id))
  console.log('Done.')
}
