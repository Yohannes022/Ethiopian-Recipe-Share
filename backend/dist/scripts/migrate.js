"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("@/config/config");
const migrations = [
    {
        version: 1,
        up: async () => {
            // Add migration steps for version 1
            await mongoose_1.default.connection.db?.collection('migrations').insertOne({
                version: 1,
                appliedAt: new Date(),
            });
        },
        down: async () => {
            // Add rollback steps for version 1
            await mongoose_1.default.connection.db?.collection('migrations').deleteOne({
                version: 1,
            });
        },
    },
];
const migrate = async (direction) => {
    try {
        await mongoose_1.default.connect(config_1.env.MONGODB_URI);
        const currentVersion = await mongoose_1.default.connection.db?.collection('migrations').findOne({}, { sort: { version: -1 } });
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
    }
    catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    }
};
const args = process.argv.slice(2);
if (args.length !== 1 || !['up', 'down'].includes(args[0])) {
    console.error('Usage: node migrate.ts [up|down]');
    process.exit(1);
}
migrate(args[0]);
