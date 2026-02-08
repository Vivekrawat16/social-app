const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://vivekrawat7723_db_user:n5oT4E938Z8TuNgO@cluster0.x2pwv6f.mongodb.net/mini-social-app?appName=Cluster0';

console.log('Connecting to:', MONGO_URI);

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
