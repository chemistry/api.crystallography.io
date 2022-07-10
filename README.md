# api.crystallography.io

## API for crystallography Website

Contains following packages:
    - graphql-api - major GraphQL API for crystallography website

CI/CD configuration:

 | Name | Value |
  | ---- | ----- |
  | AZURE_CREDENTIALS | The JSON credentials for an Azure subscription. [Learn more](https://docs.microsoft.com/azure/developer/github/connect-from-azure?tabs=azure-portal%2Cwindows#create-a-service-principal-and-add-it-as-a-github-secret) |
  | RESOURCE_GROUP | The name of the resource group to create |
  | PACKAGES_TOKEN | A GitHub personal access token with the `packages:read` scope. [Learn more](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) |

## Local development

### Build application

```bash
docker-compose build
```

### Start application

```bash
docker-compose down -v && docker-compose up --build -d && docker-compose logs -f
```

### View application logs

```bash
docker-compose logs -f
```

### Deploy the website to Azure

* Create github token with `packages:read` scope, and set as environment variable PACKAGES_TOKEN. [Learn more](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
* Add Azure subscription ID variable based of your account: AZURE_SUBSCRIPTION.

```bash
./deploy.sh
```
