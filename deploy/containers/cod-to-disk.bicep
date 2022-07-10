param location string
param environmentId string
param containerImage string
param containerRegistry string
param containerRegistryUsername string
param sharedStorageName string
param environmentVars array = []

@secure()
param containerRegistryPassword string

var containerAppName = 'cod-to-disk'

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
                    env: environmentVars
                    volumeMounts: [
                        {
                            mountPath: '/data'
                            volumeName: 'azure-files-volume'
                        }
                    ]
                }
            ]
            scale: {
                minReplicas: 1
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
