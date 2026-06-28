import { MongoMemoryServer } from 'mongodb-memory-server';

async function main() {
  console.log('Starting in-memory MongoDB server...');
  try {
    const mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: 'it-tickets',
      },
      binary: {
        version: '6.0.11',
      },
    });

    console.log(`\n==================================================`);
    console.log(`MongoDB Memory Server is running at: ${mongod.getUri()}`);
    console.log(`Port: 27017`);
    console.log(`Database Name: it-tickets`);
    console.log(`==================================================\n`);

    // Keep process alive
    process.on('SIGTERM', async () => {
      console.log('Stopping MongoDB Memory Server...');
      await mongod.stop();
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      console.log('Stopping MongoDB Memory Server...');
      await mongod.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start MongoDB Memory Server:', error);
    process.exit(1);
  }
}

main();
