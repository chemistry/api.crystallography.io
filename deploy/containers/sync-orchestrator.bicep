param location string
param environmentId string
param containerImage string
param containerRegistry string
param containerRegistryUsername string
param serviceBusNamespaceName string
param storageName string

@secure()
param containerRegistryPassword string

var containerAppName = 'sync-orchestrator'

resource storage 'Microsoft.Storage/storageAccounts@2021-04-01' existing = {
    name: storageName
}
resource serviceBus 'Microsoft.ServiceBus/namespaces@2021-06-01-preview' existing = {
    name: serviceBusNamespaceName
}

resource syncOrchestrator 'Microsoft.App/containerApps@2022-03-01' = {
    name: containerAppName
    location: location
    properties: {
        managedEnvironmentId: environmentId
        configuration: {
            secrets: [
                {
                    name: 'registry-password'
                    value: containerRegistryPassword
                }
                {
                    name: 'sb-root-connectionstring'
                    value: listKeys('${serviceBus.id}/AuthorizationRules/RootManageSharedAccessKey', serviceBus.apiVersion).primaryConnectionString
                }
            ]
            registries: [
                {
                    server: containerRegistry
                    username: containerRegistryUsername
                    passwordSecretRef: 'registry-password'
                }
            ]
            ingress: {
                external: true
                targetPort: 8080
            }
        }
        template: {
            containers: [
                {
                    image: containerImage
                    name: containerAppName
                    env: [
                        {
                            name: 'TABLE_CONNECTION_STRING'
                            value: 'DefaultEndpointsProtocol=https;AccountName=${storage.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${listKeys(storage.id, storage.apiVersion).keys[0].value}'
                        }
                        {
                            name: 'SERVICEBUS_CONNECTION_STRING'
                            secretRef: 'sb-root-connectionstring'
                        }
                    ]
                }
            ]
            scale: {
                minReplicas: 1
                maxReplicas: 1
            }
        }
    }
}

output fqdn string = syncOrchestrator.properties.configuration.ingress.fqdn
