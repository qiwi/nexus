import { INexusHelper } from '@qiwi/nexus-helper'
import { satisfies } from 'semver'

import { IComponentInfo, IPackageOpts } from './interfaces'
import { nullCheckerFactory,question } from './utils'

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

  const componentsToBeDeleted = components
    .filter(nullCheckerFactory<IComponentInfo>(v => v && v.version && v.id))
    .filter(item => satisfies(item.version, packageOpts.range))

  if(componentsToBeDeleted.length === 0) {
    console.log('Components with such parameters are not found')
    return
  }

  if (!yes) {
    const componentInfos = componentsToBeDeleted
      .map(item => `${item.id} ${item.version}`)
      .join('\n\t')

    const answer = await question(`Following components (id, version):\n\t${componentInfos}\nare going to be deleted. Proceed? (yes/no) `)
    if (answer !== 'yes') {
      return
    }
  }

  return helper.deleteComponentsByIds(componentsToBeDeleted.map(item => item.id))
}
