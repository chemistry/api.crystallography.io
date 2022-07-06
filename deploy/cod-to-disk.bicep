param location string
param environmentId string
param containerImage string
param containerRegistry string
param containerRegistryUsername string
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
                external: false
            }
        }
        template: {
            containers: [
                {
                    image: containerImage
                    name: containerAppName
                    env: environmentVars
                }
            ]
            scale: {
                minReplicas: 1
                maxReplicas: 1
            }

        }
    }
}
