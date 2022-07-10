#------------------------------------------------------------------------------#
# Deployment parameters:
export RESOURCE_GROUP="c14.test"
export LOCATION="westeurope"
# Global parameters:
# AZURE_SUBSCRIPTION_ID
# PACKAGES_TOKEN

# Should be unique for each deployment
export DEPLOYMENT_NAME="c14-test"
#------------------------------------------------------------------------------#
export GRAPH_QL_IMAGE='ghcr.io/chemistry/api.crystallography.io/graphql-api:sha-cab41ff'
export COD_TO_DISK_IMAGE='ghcr.io/chemistry/api.crystallography.io/cod-to-disk:sha-cab41ff'
export REGISTRY='ghcr.io'
export REGISTRY_USER_NAME='vreshch'
export ENVOROMENT_NAME='test'
#------------------------------------------------------------------------------#
az login
az account set --subscription $AZURE_SUBSCRIPTION_ID

echo "------------------------------------------------------------------------"
echo "Create resource group..."
az group create -n $RESOURCE_GROUP -l $LOCATION

echo "------------------------------------------------------------------------"
echo "Deploy all infrastructure..."
az deployment group create -n $DEPLOYMENT_NAME -g $RESOURCE_GROUP -f ./deploy/main.bicep \
   -p \
    registry=$REGISTRY \
    graphQLImage=$GRAPH_QL_IMAGE \
    codToDiskImage=$COD_TO_DISK_IMAGE \
    environmentName=$ENVOROMENT_NAME \
    registryUsername=$REGISTRY_USER_NAME \
    registryPassword=$PACKAGES_TOKEN

echo "------------------------------------------------------------------------"
echo "Show outputs for bicep deployment..."
az deployment group show -n $DEPLOYMENT_NAME -g $RESOURCE_GROUP -o json --query properties.outputs.urls.value
