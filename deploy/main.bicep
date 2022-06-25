param location string = resourceGroup().location
param environmentName string = 'api-crystallography-io-env'
param graphQLImage string
param graphQLPort int
param dotnetImage string
param dotnetPort int
param registry string
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

// Container-2-Dotnet (container-app.bicep)
// We deploy it first so we can call it from the node-app
module dotnetApp 'container-app.bicep' = {
    name: 'dotnetApp'
    params: {
        containerAppName: 'dotnet-app'
        location: location
        environmentId: environment.outputs.environmentId
        containerImage: dotnetImage
        containerPort: dotnetPort
        containerRegistry: registry
        containerRegistryUsername: registryUsername
        containerRegistryPassword: registryPassword
        isExternalIngress: false
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
                name: 'DOTNET_FQDN'
                value: dotnetApp.outputs.fqdn
            }
        ]
    }
}
