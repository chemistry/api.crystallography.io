# Deployment script for the project
export RESOURCE_GROUP="c14.test"
export LOCATION="westeurope"
export SUB_ID="95392ad1-c650-47f4-a85c-7d0df4e791e0"

export DEPLOYMENT_NAME = "c14-test"

# az login
# az account set --subscription $SUB_ID

echo "------------------------------------------------------------------------"
echo "Create resource group..."
az group create -n $RESOURCE_GROUP -l $LOCATION

echo "------------------------------------------------------------------------"
echo "Deploy all infrastructure..."
az deployment group create -g $RESOURCE_GROUP -f ./deploy/main.bicep -p environmentName='test' registryUsername='chemistry' registryPassword=$PACKAGES_TOKEN

echo "------------------------------------------------------------------------"
echo "Show outputs for bicep deployment..."
# az deployment group show -n $DEPLOYMENT_NAME -g $RESOURCE_GROUP -o json --query properties.outputs.urls.value
