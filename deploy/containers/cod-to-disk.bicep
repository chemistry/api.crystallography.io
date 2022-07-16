param location string
param environmentId string
param containerImage string
param containerRegistry string
param containerRegistryUsername string
param sharedStorageName string
param serviceBusNamespaceName string
param codFilesChangedQueueName string

@secure()
param containerRegistryPassword string

var containerAppName = 'cod-to-disk'

resource serviceBus 'Microsoft.ServiceBus/namespaces@2021-06-01-preview' existing = {
    name: serviceBusNamespaceName
}

resource codToDiskApp 'Microsoft.App/containerApps@2022-03-01' = {
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
                            name: 'DATA_PATH'
                            value: '/data'
                        }
                        {
                            name: 'SERVICEBUS_CONNECTION_STRING'
                            secretRef: 'sb-root-connectionstring'
                        }
                        {
                            name: 'QUEUE_NAME'
                            value: codFilesChangedQueueName
                        }
                    ]
                    volumeMounts: [
                        {
                            mountPath: '/data'
                            volumeName: 'azure-files-volume'
                        }
                    ]
                }
            ]
            scale: {
                minReplicas: 0
                maxReplicas: 1
            }
            volumes: [
                {
                    name: 'azure-files-volume'
                    storageType: 'AzureFile'
                    storageName: sharedStorageName
                }
            ]
        }
    }
}

output fqdn string = codToDiskApp.properties.configuration.ingress.fqdn
