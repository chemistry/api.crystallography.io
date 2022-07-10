param location string
param baseName string
param storageAccountName string
param storageAccountKey string
param storageShareName string
param sharedStorageName string

var logAnalyticsWorkspaceName = '${baseName}--logs'
var enviromentName = '${baseName}--env'

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2020-03-01-preview' = {
    name: logAnalyticsWorkspaceName
    location: location
    properties: any({
        retentionInDays: 30
        features: {
            searchVersion: 1
        }
        sku: {
            name: 'PerGB2018'
        }
    })
}

resource environment 'Microsoft.App/managedEnvironments@2022-03-01' = {
    name: enviromentName
    location: location
    properties: {
        appLogsConfiguration: {
            destination: 'log-analytics'
            logAnalyticsConfiguration: {
                customerId: logAnalyticsWorkspace.properties.customerId
                sharedKey: logAnalyticsWorkspace.listKeys().primarySharedKey
            }
        }
    }
}

resource environment_storage 'Microsoft.App/managedEnvironments/storages@2022-03-01' = {
    name: sharedStorageName
    parent: environment
    properties: {
        azureFile: {
            accountKey: storageAccountKey
            accountName: storageAccountName
            shareName: storageShareName
            accessMode: 'ReadWrite'
        }
    }
}

output environmentId string = environment.id
output defaultDomain string = environment.properties.defaultDomain
