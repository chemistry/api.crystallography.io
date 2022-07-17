param location string
param environmentId string
param containerImage string
param containerRegistry string
param containerRegistryUsername string
param storageName string

@secure()
param containerRegistryPassword string

var containerAppName = 'sync-orchestrator'

resource storage 'Microsoft.Storage/storageAccounts@2021-04-01' existing = {
    name: storageName
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
