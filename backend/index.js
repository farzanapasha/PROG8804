const app = require('./app');
const { initializeDatabase } = require('./config/database');
const port = process.env.PORT || 3004;

async function startServer() {
    try {
        app.listen(port, '0.0.0.0', () => {
            console.log(`Server started on port ${port}...`);
        });
        await initializeDatabase();
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);  // Exit if server fails to start
    }
}

startServer();