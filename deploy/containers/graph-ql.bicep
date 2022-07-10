param location string
param baseName string
param environmentId string
param containerImage string
param containerRegistry string
param containerRegistryUsername string

param environmentVars array = []

@secure()
param containerRegistryPassword string
var containerAppName = 'graphql-app'

resource containerApp 'Microsoft.App/containerApps@2022-03-01' = {
    name: '${baseName}-${containerAppName}'
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
                targetPort: 80
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
                minReplicas: 0
                maxReplicas: 5
            }
        }
    }
}

output fqdn string = containerApp.properties.configuration.ingress.fqdn
