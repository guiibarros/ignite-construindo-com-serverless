import { APIGatewayProxyHandler } from "aws-lambda";

import { document } from '@utils/dynamodbClient';

export const handler: APIGatewayProxyHandler = async (event) => {
  const { id: user_id } = event.pathParameters;

  const response = await document.scan({
    TableName: 'users_todos',
    FilterExpression: 'user_id = :user_id',
    ExpressionAttributeValues: {
      ':user_id': user_id,
    }
  }).promise();

  const userTodos = response.Items;

  return {
    statusCode: 200,
    body: JSON.stringify(userTodos),
  }
};