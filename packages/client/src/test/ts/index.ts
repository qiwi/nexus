import {
  SearchApi,
  ComponentsApi,
  AssetsApi,
  BlobStoreApi,
  ContentSelectorsApi,
  EmailApi,
  FormatsApi,
  LifecycleApi,
  ManageIQServerConfigurationApi,
  ProductLicensingApi,
  ReadOnlyApi,
  RepositoriesApi,
  RepositoryManagementApi,
  RoutingRulesApi,
  ScriptApi,
  SecurityCertificatesApi,
  SecurityManagementApi,
  SecurityManagementAnonymousAccessApi,
  SecurityManagementLDAPApi,
  SecurityManagementPrivilegesApi,
  SecurityManagementRealmsApi,
  SecurityManagementRolesApi,
  SecurityManagementUsersApi,
  StatusApi,
  SupportApi,
  TasksApi,
  Configuration,
} from '../../main/ts'

describe('exported entities are defined', () => {
  const entities = [
    SearchApi,
    ComponentsApi,
    AssetsApi,
    BlobStoreApi,
    ContentSelectorsApi,
    EmailApi,
    FormatsApi,
    LifecycleApi,
    ManageIQServerConfigurationApi,
    ProductLicensingApi,
    ReadOnlyApi,
    RepositoriesApi,
    RepositoryManagementApi,
    RoutingRulesApi,
    ScriptApi,
    SecurityCertificatesApi,
    SecurityManagementApi,
    SecurityManagementAnonymousAccessApi,
    SecurityManagementLDAPApi,
    SecurityManagementPrivilegesApi,
    SecurityManagementRealmsApi,
    SecurityManagementRolesApi,
    SecurityManagementUsersApi,
    StatusApi,
    SupportApi,
    TasksApi,
    Configuration,
  ]

  entities.forEach((entity) =>
    it(entity.name, () => {
      expect(entity).toBeDefined()
      expect(entity).toBeInstanceOf(Function)
    }),
  )
})
