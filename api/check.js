import fetch from 'node-fetch';

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { domains, tlds } = req.body;
    const results = [];
    
    // Use alternative API if whoisfreaks fails
    for (const domain of domains) {
      for (const tld of tlds) {
        const fullDomain = `${domain.trim()}${tld}`;
        let available = false;
        
        try {
          // Try first API
          available = await checkWithWhoisFreaks(fullDomain);
        } catch (error) {
          // Fallback to alternative API
          available = await checkWithAlternative(fullDomain);
        }
        
        results.push({ domain: fullDomain, available });
      }
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};

// 1st option: WhoisFreaks
async function checkWithWhoisFreaks(domain) {
  const response = await fetch(
    `https://api.whoisfreaks.com/v1.0/whois?whois=live&domainName=${domain}`,
    { headers: { 'Authorization': `Bearer ${process.env.WHOIS_API_KEY}` } }
  );
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WhoisFreaks error: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  return data.domain_availability === 'available';
}

// 2nd option: Free alternative API
async function checkWithAlternative(domain) {
  const response = await fetch(
    `https://api.whoapi.com/?apikey=${process.env.WHOAPI_KEY}&r=whois&domain=${domain}`
  );
  
  if (!response.ok) {
    throw new Error(`Alternative API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.status === 0; // 0 = available
}
