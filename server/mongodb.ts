import { MongoClient, Db, Collection } from 'mongodb';
import mongoose from 'mongoose';

// MongoDB connection string - can use MongoDB Atlas or local MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/temple-donations';

let db: Db;
let client: MongoClient;

export async function connectMongoDB(): Promise<Db> {
  try {
    if (db) {
      return db;
    }

    // Connect using mongoose for easier schema management
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Also create native MongoDB client for direct operations if needed
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db();

    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectMongoDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    if (client) {
      await client.close();
    }
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('MongoDB disconnect error:', error);
  }
}

export function getDB(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectMongoDB() first.');
  }
  return db;
}