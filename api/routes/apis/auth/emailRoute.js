const express = require('express');
const router = express.Router();
const cron = require('node-cron');
const pool = require('../../../database/sqlConnection');
const isAdmin = require('../../../middlewares/isAdmin');

class EmailSenderManager {
    constructor(pool) {
        this.pool = pool;
    }

    async withConnection(callback) {
        const connection = await this.pool.getConnection();
        try {
            return await callback(connection);
        } finally {
            connection.release();
        }
    }

    async addEmailSender({ email, password, host = 'relay.dnsexit.com', port = 587, daily_limit = 150 }) {
        return this.withConnection(async (conn) => {
            const [result] = await conn.query(
                `INSERT INTO email_senders (email, password, host, port, daily_limit)
                 VALUES (?, ?, ?, ?, ?)`,
                [email, password, host, port, daily_limit]
            );
            return result.insertId;
        });
    }

    async getAvailableSender() {
        return this.withConnection(async (conn) => {
            const [senders] = await conn.query(`
                SELECT * FROM email_senders
                WHERE is_active = 1
                AND current_daily_count < daily_limit
                AND (last_reset_date IS NULL OR last_reset_date != CURRENT_DATE)
                ORDER BY current_daily_count ASC
                LIMIT 1
            `);
            return senders[0] || null;
        });
    }

    async updateEmailSender(id, updateData) {
        if (!id || typeof id !== 'string' && typeof id !== 'number') {
            throw new Error('Invalid sender ID');
        }

        if (!updateData || Object.keys(updateData).length === 0) {
            throw new Error('No update data provided');
        }

        const updateFields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(updateData), id];

        return this.withConnection(conn =>
            conn.query(`UPDATE email_senders SET ${updateFields} WHERE id = ?`, values)
        );
    }

    async resetDailyCounts() {
        return this.withConnection(conn =>
            conn.query(`
                UPDATE email_senders
                SET current_daily_count = 0, is_active = 1, last_reset_date = CURRENT_DATE
            `)
        );
    }

    async resetHourlyMsgEmail() {
        return this.withConnection(async (conn) => {
            try {
                await conn.query(`
                    UPDATE email_senders
                    SET current_daily_count = 0, is_active = 1, last_reset_date = CURRENT_DATE
                    WHERE email = 'msg@talkdrove.com'
                `);
                console.log('[Hourly Reset] msg@talkdrove.com reset successfully.');
            } catch (err) {
                console.error('[Hourly Reset Error]', err.message);
                throw err;
            }
        });
    }

    async trackEmailSent(senderId) {
        return this.withConnection(conn =>
            conn.query(`
                UPDATE email_senders
                SET current_daily_count = current_daily_count + 1,
                    total_emails_sent = total_emails_sent + 1,
                    last_used_timestamp = NOW()
                WHERE id = ?
            `, [senderId])
        );
    }

    async getAllEmailSenders() {
        return this.withConnection(async (conn) => {
            const [senders] = await conn.query(`
                SELECT 
                    id, email, host, port, is_active, 
                    daily_limit, current_daily_count, 
                    total_emails_sent, last_used_timestamp,
                    CASE 
                        WHEN last_reset_date != CURRENT_DATE THEN 'Ready'
                        WHEN current_daily_count >= daily_limit THEN 'Limit Reached'
                        ELSE 'Active' 
                    END as status
                FROM email_senders
                ORDER BY last_used_timestamp DESC
            `);
            return senders;
        });
    }
}

// Routes

router.post('/api/admin/add-email', isAdmin, async (req, res) => {
    try {
        const manager = new EmailSenderManager(pool);
        const senderId = await manager.addEmailSender(req.body);
        res.json({ success: true, message: 'Email sender added successfully', senderId });
    } catch (err) {
        console.error('Add Sender Error:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to add email sender' });
    }
});

router.put('/api/admin/update-email/:id', isAdmin, async (req, res) => {
    try {
        const manager = new EmailSenderManager(pool);
        await manager.updateEmailSender(req.params.id, req.body);
        res.json({ success: true, message: 'Email sender updated successfully' });
    } catch (err) {
        console.error('Update Sender Error:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to update email sender' });
    }
});

router.get('/api/admin/all-emails', isAdmin, async (req, res) => {
    try {
        const manager = new EmailSenderManager(pool);
        const senders = await manager.getAllEmailSenders();
        res.json({ success: true, senders });
    } catch (err) {
        console.error('Fetch Senders Error:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch email senders' });
    }
});

// Cron Jobs

function setupEmailResetJobs(pool) {
    const manager = new EmailSenderManager(pool);

    // Daily Reset at Midnight
    cron.schedule('0 0 * * *', async () => {
        try {
            await manager.resetDailyCounts();
            console.log('✅ Daily email counts reset.');
        } catch (err) {
            console.error('❌ Daily reset error:', err.stack);
        }
    });

    // Hourly Reset for Specific Email
    cron.schedule('1 * * * *', async () => {
        try {
            await manager.resetHourlyMsgEmail();
        } catch (err) {
            console.error('❌ Hourly reset error:', err.stack);
        }
    });
}

module.exports = {
    EmailSenderManager,
    router,
    setupEmailResetJobs
};
