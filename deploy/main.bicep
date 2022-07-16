//---------------------------------------------------------------------------------//
// Required arguments:
param registryUsername string
param environmentName string
@secure()
param registryPassword string
//---------------------------------------------------------------------------------//
// Optional arguments:
param location string = resourceGroup().location
param syncOrchestratorImage string
param graphQLImage string
param codToDiskImage string
param codProcessorImage string
param registry string
param mongoConnection string = ''
var baseName = 'c14io-${environmentName}'
//---------------------------------------------------------------------------------//
// Constants:
var sharedStorageName = '${baseName}-share'
var serviceBusNamespaceName = '${baseName}-service-bus'
var fileShareName = 'data'
//---------------------------------------------------------------------------------//
// Resources:
resource storage 'Microsoft.Storage/storageAccounts@2021-04-01' = {
    name: replace('${baseName}-storage', '-', '')
    location: location
    sku: {
        name: 'Standard_LRS'
    }
    kind: 'StorageV2'
    properties: {
        supportsHttpsTrafficOnly: true
    }
}

// File Shares
resource myStorage 'Microsoft.Storage/storageAccounts/fileServices/shares@2019-06-01' = {
    name: '${storage.name}/default/${fileShareName}'
    dependsOn: []
}

// Table
param tables array = [
    {
        container: 'default'
        name: 'synclogs'
    }
]
resource storageAccountTables 'Microsoft.Storage/storageAccounts/tableServices/tables@2021-02-01' = [for table in tables: {
    name: '${storage.name}/${table.container}/${table.name}'
}]

// Service Buss
resource serviceBus 'Microsoft.ServiceBus/namespaces@2021-06-01-preview' = {
    name: serviceBusNamespaceName
    location: location
    sku: {
        name: 'Basic'
        tier: 'Basic'
    }
}

// Queue
resource codFilesChangedQueue 'Microsoft.ServiceBus/namespaces/queues@2022-01-01-preview' = {
    name: 'COD_FILES_CHANGED'
    parent: serviceBus
    properties: {
        lockDuration: 'PT5M'
        maxDeliveryCount: 10
    }
}

//---------------------------------------------------------------------------------//
//---------------------------------------------------------------------------------//
// Container App:
// Container Apps Environment (environment.bicep)
module environment 'environment.bicep' = {
    name: 'container-app-environment'
    params: {
        baseName: baseName
        location: location
        storageAccountName: storage.name
        storageAccountKey: storage.listKeys().keys[0].value
        storageShareName: fileShareName
        sharedStorageName: sharedStorageName
    }
}
//---------------------------------------------------------------------------------//
// Containers
// sync-orchestrator (sync-orchestrator.bicep)
module syncOrchestrator 'containers/sync-orchestrator.bicep' = {
    name: 'sync-orchestrator'
    dependsOn: [
        environment
        serviceBus
    ]
    params: {
        location: location
        environmentId: environment.outputs.environmentId
        containerImage: syncOrchestratorImage
        containerRegistry: registry
        containerRegistryUsername: registryUsername
        containerRegistryPassword: registryPassword
    }
}

module codToDisk 'containers/cod-to-disk.bicep' = {
    name: 'cod-to-disk'
    dependsOn: [
        environment
        serviceBus
    ]
    params: {
        location: location
        environmentId: environment.outputs.environmentId
        containerImage: codToDiskImage
        containerRegistry: registry
        containerRegistryUsername: registryUsername
        containerRegistryPassword: registryPassword
        sharedStorageName: sharedStorageName
        serviceBusNamespaceName: serviceBusNamespaceName
        codFilesChangedQueueName: codFilesChangedQueue.name
    }
}

// cod-processor (container-app.bicep)
module codProcessor 'containers/cod-processor.bicep' = {
    name: 'cod-processor'
    dependsOn: [
        environment
        serviceBus
    ]
    params: {
        location: location
        environmentId: environment.outputs.environmentId
        containerImage: codProcessorImage
        containerRegistry: registry
        containerRegistryUsername: registryUsername
        containerRegistryPassword: registryPassword
        serviceBusNamespaceName: serviceBusNamespaceName
        codFilesChangedQueueName: codFilesChangedQueue.name
    }
}

// GraphQL API (container-app.bicep)
module graphQLApp 'containers/graph-ql.bicep' = {
    name: 'graph-ql-app'
    dependsOn: [
        environment
        codToDisk
    ]
    params: {
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

output urls string = 'https://${environment.outputs.defaultDomain}'
//---------------------------------------------------------------------------------//
