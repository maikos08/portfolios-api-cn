import { Request, Response, NextFunction } from 'express';
import { ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { dynamoDb } from '../config/data-source';
import { config } from '../config';
import { Portfolio } from '../models/portfolio.model';
import { CreatePortfolioDTO, UpdatePortfolioDTO } from '../types/portfolio.d';

const TABLE_NAME = config.dynamodb.tableName;

export const getAllPortfolios = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });
    const result = await dynamoDb.send(command);
    res.json(result.Items || []);
  } catch (err) {
    next(err);
  }
};

export const getPortfolioById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    });
    const result = await dynamoDb.send(command);
    if (!result.Item) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }
    res.json(result.Item);
  } catch (err) {
    next(err);
  }
};

export const getAllSkills = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });
    const result = await dynamoDb.send(command);
    const items = (result.Items || []) as Portfolio[];
    const skillsSet = new Set<string>();
    items.forEach((item: Portfolio) => {
      (item.skills || []).forEach((skill: string) => skillsSet.add(skill));
    });
    res.json(Array.from(skillsSet));
  } catch (err) {
    next(err);
  }
};

export const createPortfolio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body as CreatePortfolioDTO;
    const portfolio: Portfolio = {
      id: uuidv4(),
      name: payload.name,
      description: payload.description,
      skills: payload.skills,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: portfolio,
    });
    await dynamoDb.send(command);
    res.status(201).json(portfolio);
  } catch (err) {
    next(err);
  }
};

export const updatePortfolio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const payload = req.body as UpdatePortfolioDTO;

    // Check if portfolio exists first
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    });
    const existingItem = await dynamoDb.send(getCommand);
    if (!existingItem.Item) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    // Build update expression
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (payload.name !== undefined) {
      updateExpressions.push('#name = :name');
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':name'] = payload.name;
    }
    if (payload.description !== undefined) {
      updateExpressions.push('#description = :description');
      expressionAttributeNames['#description'] = 'description';
      expressionAttributeValues[':description'] = payload.description;
    }
    if (payload.skills !== undefined) {
      updateExpressions.push('#skills = :skills');
      expressionAttributeNames['#skills'] = 'skills';
      expressionAttributeValues[':skills'] = payload.skills;
    }

    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const result = await dynamoDb.send(command);
    res.json(result.Attributes);
  } catch (err) {
    next(err);
  }
};

export const deletePortfolio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if portfolio exists first
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    });
    const existingItem = await dynamoDb.send(getCommand);
    if (!existingItem.Item) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
    });
    await dynamoDb.send(command);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
