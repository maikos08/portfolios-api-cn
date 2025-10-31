import app from './app';
import { config } from './config';

const start = async () => {
  try {
    console.log('Starting server...');
    console.log(`DynamoDB Table: ${config.dynamodb.tableName}`);
    console.log(`AWS Region: ${config.aws.region}`);
    
    app.listen(config.port, () => {
      console.log(`Server listening on port ${config.port}`);
      console.log(`Environment: ${config.env}`);
    });
  } catch (err) {
    console.error('Failed to start application', err);
    process.exit(1);
  }
};

start();
