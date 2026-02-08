const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://vivekrawat7723_db_user:n5oT4E938Z8TuNgO@cluster0.x2pwv6f.mongodb.net/?appName=Cluster0';

console.log('Testing MongoDB Connection...');
console.log(`URI: ${MONGO_URI.replace(/:([^:@]+)@/, ':****@')}`); // Hide password in logs

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('SUCCESS: MongoDB Connected!');
        process.exit(0);
    })
    .catch(err => {
        console.error('ERROR: Connection Failed');
        console.error(err);
        process.exit(1);
    });
