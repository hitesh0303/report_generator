const mongoose = require('mongoose');
require('dotenv').config();

async function fixDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Drop the problematic index
    await mongoose.connection.collection('users').dropIndex('username_1');
    console.log('Successfully dropped the username index');

    // Create the correct index on email
    await mongoose.connection.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('Successfully created email index');

  } catch (error) {
    if (error.code === 27) {
      console.log('Index does not exist, skipping drop');
    } else {
      console.error('Error:', error);
    }
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixDatabase(); 