const mongoose = require('mongoose');
require('dotenv').config();

const fixIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('applications');

        // Get all indexes
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes);

        // Drop the old problematic index if it exists
        try {
            await collection.dropIndex('candidateId_1_jobId_1');
            console.log('✓ Dropped old index: candidateId_1_jobId_1');
        } catch (err) {
            console.log('Index candidateId_1_jobId_1 does not exist or already dropped');
        }

        // The new index will be created automatically when the server starts
        console.log('✓ Index fix complete. Restart your server to apply the new index.');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error fixing indexes:', error);
        process.exit(1);
    }
};

fixIndexes();
