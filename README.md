# Download Service
We are building a serverless service that:

- Fetches the assets form static urls (DNS)
- Zips them
- Stores them in S3
- Returns the download link
- 
You can check the [Download REST API](https://github.com/jonacruz948/aws-simple105/blob/main/download-service/API.md) first to understand how the client can interact with the download service

 The main architecture looks like that:
 The API gateway which represent the REST API Layer interact with a Lambda function writen as Nodejs code which is responsible about Fetching the assets from the urls and archiving them and uploading them to S3 and returns the url of the newly created zip file to the API Gateway.

### Installation
```
# cd into project and set it up
cd download-service

# Install dependencies
yarn install

```
### Running it On local machine
```
sls offline

#or 

yarn serve

```
#### Environment Variables
The environment variables are stored in a `.env` file in the service directory, you can review it before deployment 
Sample of `.env` variables
```
REGION=us-east-2
CACHE_BUCKET=amplience.assets.zip
ASSETS_URL= https://assets.simple105.com/
STAGE=dev

```
#### Deploying
You can deploy to the dev stage using
```
yarn deploy:dev

```
and to deploy to the `prod` stage, you can run 
```
yarn deploy:production
```
