import dotenv from 'dotenv';
import { Groq } from 'groq-sdk';

dotenv.config();

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const models = await client.models.list();
console.log('Available Groq Models:');
models.data.forEach(m => console.log('  -', m.id));
