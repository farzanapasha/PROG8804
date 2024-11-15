const app = require('./app');
const { initializeDatabase } = require('./config/database');
const port = process.env.PORT || 8080;

async function startServer() {
    try {
        app.listen(port, () => {
            console.log(`Server started on port ${port}...`);
        });
        await initializeDatabase();
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

startServer();