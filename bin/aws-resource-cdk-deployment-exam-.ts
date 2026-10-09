import * as cdk from 'aws-cdk-lib';
import { AwsResourceDeploymentExamStack } from '../lib/aws-resource-cdk-deployment-exam--stack';
const app = new cdk.App();

new AwsResourceDeploymentExamStack(
  app,
  'AwsResourceDeploymentExamStack'
);