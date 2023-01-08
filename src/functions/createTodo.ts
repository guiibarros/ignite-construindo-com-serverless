import { randomUUID } from "node:crypto";
import { APIGatewayProxyHandler } from "aws-lambda";

import { document } from '@utils/dynamodbClient';

interface ICreateTodo {
  title: string;
  deadline: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const { id: user_id } = event.pathParameters;

  const { title, deadline } = JSON.parse(event.body) as ICreateTodo;

  const response = await document.scan({
    TableName: 'users_todos',
    FilterExpression: 'user_id = :user_id and title = :title',
    ExpressionAttributeValues: {
      ':user_id': user_id,
      ':title': title,
    }
  }).promise();

  const todoAlreadyExists = response.Items[0];

  if (todoAlreadyExists) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Todo already exists.'
      }),
    }
  }

  await document.put({
    TableName: 'users_todos',
    Item: {
      id: randomUUID(),
      user_id,
      title,
      deadline: new Date(deadline).toLocaleDateString(),
      done: false,
    },
  }).promise();

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: 'Todo created successfully.',
    }),
  };
};