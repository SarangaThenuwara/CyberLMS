const mongodb = require('mongodb');
const { MongoClient } = mongodb;

const uri = 'mongodb+srv://smsdb:2Ysls2YSCCYrCKTn@cluster0.kkbbr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Replace with your MongoDB connection string
const client = new MongoClient(uri);

async function handleRequest(request) {
  try {
    await client.connect();
    const collection = client.db('test').collection('formdatas'); // Using 'test' DB and 'formdatas' collection
    const documentCount = await collection.countDocuments();
    
    return new Response(
      JSON.stringify({ documentCount, lastUpdated: new Date() }),
      { 
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response('Error fetching document count', { status: 500 });
  } finally {
    await client.close();
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
