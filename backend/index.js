const app = require('./app');

const port = process.env.PORT || 3004;

async function startServer() {
    try {
        app.listen(port, () => {
            console.log(`Server started on port ${port}...`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

startServer();