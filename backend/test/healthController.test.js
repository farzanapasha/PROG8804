const { healthCheck } = require('../controllers/healthController');

describe('Health Controller', () => {
    let ctx;

    beforeEach(() => {
        ctx = {
            status: null,
            body: null
        };
    });

    it('should return 200 status and OK message', async () => {
        // Act
        await healthCheck(ctx);

        // Assert
        expect(ctx.status).toBe(200);
        expect(ctx.body).toBe('OK');
    });
});
