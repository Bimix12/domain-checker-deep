document.addEventListener('DOMContentLoaded', () => {
    const tlds = ['.net', '.co', '.co.in', '.in', '.us'];
    const tldContainer = document.getElementById('tld-container');
    const domainsInput = document.getElementById('domains');
    const checkBtn = document.getElementById('check-btn');
    const resultsDiv = document.getElementById('results');

    // Generate TLD checkboxes
    tlds.forEach(tld => {
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" checked value="${tld}"> 
            ${tld}
        `;
        tldContainer.appendChild(label);
    });

    // Check button handler
    checkBtn.addEventListener('click', async () => {
        const domains = domainsInput.value.split('\n').filter(d => d.trim());
        const selectedTlds = [...document.querySelectorAll('#tld-container input:checked')]
            .map(el => el.value);

        if (!domains.length || !selectedTlds.length) {
            alert('Please enter domains and select at least one TLD');
            return;
        }

        resultsDiv.innerHTML = '<p>Checking... ⏳</p>';
        
        try {
            const response = await fetch('/api/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domains, tlds: selectedTlds })
            });
            
            const results = await response.json();
            displayResults(results);
        } catch (error) {
            resultsDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        }
    });

    function displayResults(data) {
        let html = '<table><tr><th>Domain</th><th>Status</th></tr>';
        
        data.forEach(result => {
            const statusClass = result.available ? 'available' : 'taken';
            const statusText = result.available ? 'Available ✅' : 'Taken ❌';
            
            html += `
                <tr>
                    <td>${result.domain}</td>
                    <td class="${statusClass}">${statusText}</td>
                </tr>
            `;
        });
        
        html += '</table>';
        resultsDiv.innerHTML = html;
    }
});
