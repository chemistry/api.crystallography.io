param location string = resourceGroup().location
param environmentName string = 'api-crystallography-io-env'
param graphQLImage string
param codToDiskImage string
param registry string
param mongoConnection string
param registryUsername string
@secure()
param registryPassword string

var sharedStorageName = '${environmentName}-share'
var fileShareName = 'data'

resource storage 'Microsoft.Storage/storageAccounts@2021-04-01' = {
    name: replace('${environmentName}', '-', '')
    location: location
    sku: {
        name: 'Standard_LRS'
    }
    kind: 'StorageV2'
    properties: {
        supportsHttpsTrafficOnly: true
    }
}

resource myStorage 'Microsoft.Storage/storageAccounts/fileServices/shares@2019-06-01' = {
    name: '${storage.name}/default/${fileShareName}'
    dependsOn: []
}

// Container Apps Environment (environment.bicep)
module environment 'environment.bicep' = {
    name: 'container-app-environment'
    params: {
        environmentName: environmentName
        location: location
        storageAccountName: storage.name
        storageAccountKey: storage.listKeys().keys[0].value
        storageShareName: fileShareName
        sharedStorageName: sharedStorageName
    }
}

// cod-to-disk (container-app.bicep)
module codToDisk 'container-cod-to-disk.bicep' = {
    name: 'codToDisk'
    dependsOn: [
        environment
    ]
    params: {
        location: location
        environmentId: environment.outputs.environmentId
        containerImage: codToDiskImage
        containerRegistry: registry
        containerRegistryUsername: registryUsername
        containerRegistryPassword: registryPassword
        sharedStorageName: sharedStorageName
        environmentVars: [
            {
                name: 'DATA_PATH'
                value: '/data'
            }
        ]
    }
}

// GraphQL API (container-app.bicep)
module graphQLApp 'container-graph-ql.bicep' = {
    name: 'graphQLApp'
    params: {
        containerAppName: 'graphql-app'
        location: location
        environmentId: environment.outputs.environmentId
        containerImage: graphQLImage
        containerRegistry: registry
        containerRegistryUsername: registryUsername
        containerRegistryPassword: registryPassword
        environmentVars: [
            {
                name: 'COD_TO_DISK_FQDN'
                value: codToDisk.outputs.fqdn
            }
            {
                name: 'MONGO_CONNECTION'
                value: mongoConnection
            }
        ]
    }
}
