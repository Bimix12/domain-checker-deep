import fetch from 'node-fetch';

export default async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { domains, tlds } = req.body;
    const results = [];

    for (const domain of domains) {
        for (const tld of tlds) {
            const fullDomain = `${domain.trim()}${tld}`;
            const available = await checkDomain(fullDomain);
            results.push({ domain: fullDomain, available });
        }
    }

    res.status(200).json(results);
};

async function checkDomain(domain) {
    try {
        const response = await fetch(
            `https://api.whoisfreaks.com/v1.0/whois?whois=live&domainName=${domain}`,
            { headers: { 'Authorization': `Bearer ${process.env.WHOIS_API_KEY}` } }
        );
        
        const data = await response.json();
        return data.domain_availability === 'available';
    } catch (error) {
        console.error(`Error checking ${domain}:`, error);
        return false;
    }
}
