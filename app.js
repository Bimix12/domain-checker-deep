// ... existing code ...

checkBtn.addEventListener('click', async () => {
  // ... validation code ...
  
  try {
    const response = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domains, tlds: selectedTlds })
    });
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Invalid response: ${text.slice(0, 100)}...`);
    }
    
    const results = await response.json();
    
    // Handle API error structure
    if (results.error) {
      throw new Error(`${results.error}: ${results.details || ''}`);
    }
    
    displayResults(results);
  } catch (error) {
    resultsDiv.innerHTML = `
      <div class="error">
        <h3>Error</h3>
        <p>${error.message}</p>
        <p>Check your API keys and try again</p>
      </div>
    `;
  }
});
