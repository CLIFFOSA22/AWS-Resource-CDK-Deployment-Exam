
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import {
  Role,
  ServicePrincipal,
  ManagedPolicy
} from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export class AwsResourceDeploymentExamStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

  
    // API GATEWAY
    

    const api = new apigateway.RestApi(this, 'items-api');

    const items = api.root.addResource('items');

    const item = items.addResource('{id}');

    
    //DYNAMODB TABLE
   

    const table = new dynamodb.TableV2(this, 'Table', {
      tableName: 'StudentItems',

      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },

      billing: dynamodb.Billing.onDemand(),

      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // IAM EXECUTION ROLE FOR LAMBDA


    const role = new Role(this, 'IAM-role-lambda', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),

      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaBasicExecutionRole'
        ),

        ManagedPolicy.fromAwsManagedPolicyName(
          'AmazonDynamoDBFullAccess'
        ),
      ],
    });

    //  LAMBDA FUNCTION
   

    const itemsLambda = new lambdaNodejs.NodejsFunction(
      this,
      'ItemsLambda',
      {
        runtime: lambda.Runtime.NODEJS_24_X,

        architecture: lambda.Architecture.X86_64,

        memorySize: 256,

        timeout: cdk.Duration.seconds(10),

        entry: path.join(__dirname, '../lambda/items.ts'),

        handler: 'handler',

        role: role,

        environment: {
          TABLE_NAME: table.tableName,
        },
      }
    );

  // API GATEWAY LAMBDA INTEGRATION
  

    const integration = new apigateway.LambdaIntegration(
      itemsLambda
    );

    // GET /items
    items.addMethod('GET', integration);

    // POST /items
    items.addMethod('POST', integration);

    // GET /items/{id}
    item.addMethod('GET', integration);

    // PUT /items/{id}
    item.addMethod('PUT', integration);

    // DELETE /items/{id}
    item.addMethod('DELETE', integration);

    // CLOUDFORMATION OUTPUTS
  

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway REST API URL',
    });

    new cdk.CfnOutput(this, 'DynamoDBTableName', {
      value: table.tableName,
      description: 'DynamoDB table name',
    });

    new cdk.CfnOutput(this, 'LambdaFunctionName', {
      value: itemsLambda.functionName,
      description: 'Lambda function name',
    });

  }
}
