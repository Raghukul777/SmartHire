const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smarthire').then(async () => {
    const db = mongoose.connection.db;

    // Show all candidates
    const candidates = await db.collection('users').find({ role: 'candidate' }).toArray();
    for (const u of candidates) {
        console.log(`Name: ${u.name} | Email: ${u.email} | Skills: ${JSON.stringify(u.profile?.skills || [])}`);

        // If user has no skills, seed them. If they have skills (added via UI), keep them.
        const skills = u.profile?.skills || [];
        if (skills.length === 0) {
            const defaultSkills = ['Java', 'Java Spring Boot', 'JavaScript', 'React'];
            const res = await db.collection('users').updateOne(
                { _id: u._id },
                { $set: { 'profile.skills': defaultSkills } }
            );
            console.log(`  Seeded ${u.name} with default skills. Modified: ${res.modifiedCount}`);
        }
    }

    // Show all jobs and their requiredSkills
    const jobs = await db.collection('jobs').find({}).toArray();
    for (const j of jobs) {
        const req = j.requiredSkills || [];
        console.log(`\nJob: "${j.title}" | requiredSkills: ${JSON.stringify(req)}`);
        if (req.length === 0) {
            // Auto-tag from title
            const tags = j.title.split(/[\s,]+/).filter(w => w.length > 1);
            await db.collection('jobs').updateOne({ _id: j._id }, { $set: { requiredSkills: tags } });
            console.log(`  -> Auto-tagged with: ${JSON.stringify(tags)}`);
        }
    }

    console.log('\nDone!');
    process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
