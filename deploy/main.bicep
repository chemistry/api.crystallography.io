param location string = resourceGroup().location
param environmentName string = 'api-crystallography-io-env'
param graphQLImage string
param graphQLPort int
param dotnetImage string
param dotnetPort int
param registry string
param mongoConnection string
param registryUsername string
@secure()
param registryPassword string

// Container Apps Environment (environment.bicep)
module environment 'environment.bicep' = {
    name: 'container-app-environment'
    params: {
        environmentName: environmentName
        location: location
    }
}

// cod-to-disk (container-app.bicep)
module codToDisk 'cod-to-disk.bicep' = {
    name: 'codToDisk'
    dependsOn: [
        environment
    ]
    params: {
        location: location
        environmentId: environment.outputs.environmentId
        containerImage: dotnetImage
        containerRegistry: registry
        containerRegistryUsername: registryUsername
        containerRegistryPassword: registryPassword
        environmentVars: [
            {
                name: 'DATA_PATH'
                value: '/data'
            }
        ]
    }
}

// GraphQL API (container-app.bicep)
module nodeApp 'container-app.bicep' = {
    name: 'graphQLApp'
    params: {
        containerAppName: 'graphql-app'
        location: location
        environmentId: environment.outputs.environmentId
        containerImage: graphQLImage
        containerPort: graphQLPort
        containerRegistry: registry
        containerRegistryUsername: registryUsername
        containerRegistryPassword: registryPassword
        isExternalIngress: true
        // set an environment var for the dotnetFQDN to call
        environmentVars: [
            {
                name: 'MONGO_CONNECTION'
                value: mongoConnection
            }
        ]
    }
}
