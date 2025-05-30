import mongoose from 'mongoose';
import { seedDatabase } from './seed';

interface IMigration {
  version: number;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

const migrations: IMigration[] = [
  {
    version: 1,
    up: async () => {
      // Add migration steps for version 1
      await mongoose.connection.db.collection('migrations').insertOne({
        version: 1,
        appliedAt: new Date(),
      });
    },
    down: async () => {
      // Add rollback steps for version 1
      await mongoose.connection.db.collection('migrations').deleteOne({
        version: 1,
      });
    },
  },
];

const migrate = async (direction: 'up' | 'down') => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    const currentVersion = await mongoose.connection.db
      .collection('migrations')
      .findOne({}, { sort: { version: -1 } });

    const targetVersion = direction === 'up' ? migrations.length : 0;

    for (let i = currentVersion?.version || 0; i !== targetVersion; i += direction === 'up' ? 1 : -1) {
      const migration = migrations.find(m => m.version === i);
      if (!migration) {
        throw new Error(`Migration ${i} not found`);
      }

      await (direction === 'up' ? migration.up() : migration.down());
    }

    console.log(`Migration ${direction} completed successfully`);
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
};

const args = process.argv.slice(2);
if (args.length !== 1 || !['up', 'down'].includes(args[0])) {
  console.error('Usage: node migrate.ts [up|down]');
  process.exit(1);
}

migrate(args[0] as 'up' | 'down');
