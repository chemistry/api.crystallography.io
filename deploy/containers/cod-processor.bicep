param location string
param environmentId string
param containerImage string
param containerRegistry string
param containerRegistryUsername string
param environmentVars array = []

@secure()
param containerRegistryPassword string

var containerAppName = 'cod-processor'

resource codProcessor 'Microsoft.App/containerApps@2022-03-01' = {
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
                }
            ]
            scale: {
                minReplicas: 0
                maxReplicas: 1
            }
        }
    }
}

output fqdn string = codProcessor.properties.configuration.ingress.fqdn
