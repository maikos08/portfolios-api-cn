import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { config } from './index';

const credentials = (config.aws.accessKeyId && config.aws.secretAccessKey)
  ? {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    }
  : undefined;

const client = new DynamoDBClient({
  region: config.aws.region,
  credentials: credentials,
});

export const dynamoDb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export default dynamoDb;
