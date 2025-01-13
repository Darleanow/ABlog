import app, { AppDataSource } from './app';

const PORT = process.env.PORT || 3000;

// Initialize database connection and start server
AppDataSource.initialize()
  .then(() => {
    console.log('Database connection initialized');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => console.log('Error during initialization:', error));