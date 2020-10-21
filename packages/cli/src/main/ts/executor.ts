import { IComponentInfo, INexusHelper, NexusComponentsHelper, TComponent } from '@qiwi/nexus-helper'

import { IPackageOpts } from './interfaces'
import { question } from './utils'

export const execute = async (
  packageOpts: IPackageOpts,
  helper: INexusHelper,
  yes?: boolean
): Promise<void> => {
  const components = await helper.getPackageComponents({
    repository: packageOpts.repo,
    group: packageOpts.group,
    name: packageOpts.name,
  })

  const componentsToBeDeleted = NexusComponentsHelper.filterComponentsByRange(
    components,
    packageOpts.range
  )

  if(componentsToBeDeleted.length === 0) {
    console.log('Components with such parameters are not found')
    return
  }

  if (!yes) {
    const componentInfos = componentsToBeDeleted
      .map((item: TComponent) => `${item.repository} ${item.group} ${item.name} ${item.id} ${item.version}`)
      .join('\n\t')

    const answer = await question(`Following components (repo, group, name, id, version):\n\t${componentInfos}\nare going to be deleted. Proceed? (yes/no) `)
    if (answer !== 'yes') {
      return
    }
  }

  await helper.deleteComponentsByIds(componentsToBeDeleted.map((item: IComponentInfo) => item.id))
  console.log('Done.')
}
