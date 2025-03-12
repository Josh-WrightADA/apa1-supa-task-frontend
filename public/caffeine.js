const CaffeineTracker = {
    currentEditId: null,
    entries: [],
    
    initialize: async function() {
        console.log("Initializing caffeine tracking...");
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', async function() {
                await loadNavbar();
                
                supabaseClient.auth.onAuthStateChange((event, session) => {
                    const signInBtn = document.querySelector('.signInBtn');
                });
                
                setupModalListeners();
                if (typeof initializeCharts === 'function') {
                    initializeCharts();
                }
                
                CaffeineTracker.setupListeners();
                
                // Load and display entries on startup
                const entries = await loadCaffeineEntries();
                displayCaffeineEntries(entries);
                CaffeineTracker.displayCaffeineInsights(entries);
            });
        } else {
            await loadNavbar();
            
            supabaseClient.auth.onAuthStateChange((event, session) => {
                const signInBtn = document.querySelector('.signInBtn');
            });
            
            setupModalListeners();
            if (typeof initializeCharts === 'function') {
                initializeCharts();
            }
            
            CaffeineTracker.setupListeners();
            
            // Load and display entries on startup
            const entries = await loadCaffeineEntries();
            displayCaffeineEntries(entries);
            CaffeineTracker.displayCaffeineInsights(entries);
        }
    },
    
    setupListeners: function() {
        const addBtn = document.getElementById('addCaffeineBtn') || 
                      document.querySelector('.feature-card button') ||
                      document.querySelector('button:contains("Log Caffeine")');
        
        if (addBtn) {
            console.log("Found caffeine button:", addBtn);
            addBtn.addEventListener('click', CaffeineTracker.showAddForm);
        } else {
            console.error("Could not find caffeine button. Adding retry logic...");
            setTimeout(CaffeineTracker.setupListeners, 500);
        }
    },
    
    showAddForm: function() {
        // Check if wellness form is currently being processed
        if (document.getElementById('wellnessFormContainer').style.display === 'block') {
            console.log("Wellness form is open, not opening caffeine form");
            return;
        }
        
        const container = document.getElementById('caffeineFormContainer');
        if (container) {
            container.innerHTML = `
                <div class="modal-content">
                    <span class="close">×</span>
                    <h2>Log Caffeine Consumption</h2>
                    <form id="caffeineForm">
                        <div class="form-group">
                            <label for="beverageType">Beverage Type</label>
                            <select id="beverageType" required>
                                <option value="">Select a beverage</option>
                                <option value="coffee">Coffee</option>
                                <option value="espresso">Espresso</option>
                                <option value="tea">Tea</option>
                                <option value="energy_drink">Energy Drink</option>
                                <option value="soda">Soda</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="caffeineAmount">Caffeine Amount (mg)</label>
                            <input type="number" id="caffeineAmount" required min="1" max="1000">
                        </div>
                        <div class="form-group">
                            <label for="consumedAt">When Consumed</label>
                            <input type="datetime-local" id="consumedAt">
                        </div>
                        <div class="form-buttons">
                            <button type="submit" class="submit-btn">Save</button>
                            <button type="button" class="cancel-btn">Cancel</button>
                        </div>
                    </form>
                </div>
            `;
            
            container.style.display = 'flex';
            
            const now = new Date();
            const nowLocalISOString = new Date(now - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            document.getElementById('consumedAt').value = nowLocalISOString;
            
            const closeBtn = container.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', CaffeineTracker.hideForm);
            }
            
            document.getElementById('caffeineForm').addEventListener('submit', CaffeineTracker.handleFormSubmit);
            
            const cancelButton = container.querySelector('.cancel-btn');
            if (cancelButton) {
                cancelButton.addEventListener('click', CaffeineTracker.hideForm);
            }
        }
    },    
    hideForm: function() {
        const container = document.getElementById('caffeineFormContainer');
        if (container) container.style.display = 'none';
    },
    
    editEntry: async function(entryId) {
        // Set the current ID being edited
        this.currentEditId = entryId;
        
        try {
            // Get the entry data
            const { data, error } = await supabaseClient
                .from('caffeine_entries') 
                .select('*')
                .eq('id', entryId)
                .single();
                
            if (error) throw error;
            
            // Show form with pre-filled data
            const container = document.getElementById('caffeineFormContainer');
            
            if (!container) {
                console.error("Caffeine form container not found");
                return;
            }
            
            // Populate form with existing values
            container.innerHTML = `
                <div class="modal-content">
                    <span class="close">×</span>
                    <h2>Edit Caffeine Entry</h2>
                    <form id="caffeineForm">
                        <div class="form-group">
                            <label for="beverageType">Beverage Type</label>
                            <select id="beverageType" required>
                                <option value="">Select a beverage</option>
                                <option value="coffee" ${data.beverage_type === 'coffee' ? 'selected' : ''}>Coffee</option>
                                <option value="espresso" ${data.beverage_type === 'espresso' ? 'selected' : ''}>Espresso</option>
                                <option value="tea" ${data.beverage_type === 'tea' ? 'selected' : ''}>Tea</option>
                                <option value="energy_drink" ${data.beverage_type === 'energy_drink' ? 'selected' : ''}>Energy Drink</option>
                                <option value="soda" ${data.beverage_type === 'soda' ? 'selected' : ''}>Soda</option>
                                <option value="other" ${data.beverage_type === 'other' ? 'selected' : ''}>Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="caffeineAmount">Caffeine Amount (mg)</label>
                            <input type="number" id="caffeineAmount" required min="1" max="1000" value="${data.amount}">
                        </div>
                        <div class="form-group">
                            <label for="consumedAt">When Consumed</label>
                            <input type="datetime-local" id="consumedAt" value="${new Date(data.consumed_at).toISOString().slice(0, 16)}">
                        </div>
                        <div class="form-buttons">
                            <button type="submit" class="submit-btn">Update</button>
                            <button type="button" class="cancel-btn">Cancel</button>
                        </div>
                        <div class="delete-button-container">
                            <button type="button" class="delete-btn">Delete Entry</button>
                        </div>
                    </form>
                </div>
            `;
            
            // Show form
            container.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Add event listeners
            container.querySelector('.close').addEventListener('click', CaffeineTracker.hideForm);
            container.querySelector('.cancel-btn').addEventListener('click', CaffeineTracker.hideForm);
            document.getElementById('caffeineForm').addEventListener('submit', CaffeineTracker.handleFormSubmit);
            container.querySelector('.delete-btn').addEventListener('click', () => CaffeineTracker.deleteEntry(entryId));
            
        } catch (err) {
            console.error("Error loading caffeine entry for edit:", err);
            showToast("Failed to load entry: " + err.message, "error");
        }
    },
    
    deleteEntry: async function(entryId) {
        if (!confirm("Are you sure you want to delete this caffeine entry?")) {
            return;
        }
        
        try {
            const { error } = await supabaseClient
                .from('caffeine_entries')
                .delete()
                .eq('id', entryId);
                
            if (error) throw error;
            
            showToast("Caffeine entry deleted successfully!", "success");
            this.hideForm();
            
            // Reload and display entries
            const entries = await loadCaffeineEntries();
            displayCaffeineEntries(entries);
            this.displayCaffeineInsights(entries);
            
        } catch (err) {
            console.error("Error deleting caffeine entry:", err);
            showToast("Failed to delete entry: " + err.message, "error");
        }
    },
    
    handleFormSubmit: async function(event) {
        event.preventDefault();
        
        const amount = parseInt(document.getElementById('caffeineAmount').value);
        const type = document.getElementById('beverageType').value;
        const consumedAt = document.getElementById('consumedAt').value || new Date().toISOString();
        
        try {
            const { data: { user } } = await supabaseClient.auth.getUser();
            
            if (!user) {
                showToast("Please sign in to save entries", "error");
                return;
            }
            
            let data, error;
            
            if (CaffeineTracker.currentEditId) {
                console.log("Updating caffeine entry:", CaffeineTracker.currentEditId);
                
                ({ data, error } = await supabaseClient
                    .from('caffeine_entries')
                    .update({
                        amount: amount,
                        beverage_type: type,
                        consumed_at: new Date(consumedAt).toISOString()
                    })
                    .eq('id', CaffeineTracker.currentEditId)
                    .select());
                    
                if (error) throw error;
                
                showToast("Entry updated successfully!", "success");
            } else {
                console.log("Creating new caffeine entry");
                
                ({ data, error } = await supabaseClient
                    .from('caffeine_entries')
                    .insert([
                        { 
                            user_id: user.id,
                            amount: amount,
                            beverage_type: type,
                            consumed_at: new Date(consumedAt).toISOString()
                        }
                    ])
                    .select());
                    
                if (error) throw error;
                
                showToast("Caffeine entry saved!", "success");
            }
            
            CaffeineTracker.currentEditId = null;
            CaffeineTracker.hideForm();
            
            const entries = await loadCaffeineEntries();
            displayCaffeineEntries(entries);
            CaffeineTracker.displayCaffeineInsights(entries);
            
        } catch (err) {
            console.error("Error saving caffeine entry:", err);
            showToast("Failed to save entry: " + err.message, "error");
        }
    },
    
    //function to display caffeine insights in the insights card
    displayCaffeineInsights: function(entries) {
        if (!entries || entries.length === 0) {
            console.log("No caffeine entries to display insights for");
            return;
        }
        
        // Find the insights card (third feature card)
        const insightsCard = document.querySelector('.feature-card:nth-child(3)');
        if (!insightsCard) {
            console.error("Could not find insights card to display caffeine insights");
            return;
        }
        
        // Calculate insights data
        const totalCaffeine = entries.reduce((sum, entry) => sum + entry.amount, 0);
        const avgCaffeine = Math.round(totalCaffeine / entries.length);
        
        // Find max intake
        const maxEntry = entries.reduce((max, entry) => 
            entry.amount > max.amount ? entry : max, 
            { amount: 0 }
        );
        
        // Calculate days since first entry
        const firstEntryDate = new Date(Math.min(...entries.map(e => new Date(e.consumed_at).getTime())));
        const today = new Date();
        const daysSinceStart = Math.round((today - firstEntryDate) / (1000 * 60 * 60 * 24));
        
        // Get unique dates to count tracking days
        const uniqueDates = new Set();
        entries.forEach(entry => {
            const date = new Date(entry.consumed_at).toLocaleDateString();
            uniqueDates.add(date);
        });
        
        // Create HTML for insights section
        const insightsHTML = `
            <div class="caffeine-insights">
                <h4>Caffeine Insights</h4>
                <div class="insights-grid">
                    <div class="insight-item">
                        <div class="insight-icon">☕</div>
                        <div class="insight-content">
                            <div class="insight-value">${totalCaffeine}mg</div>
                            <div class="insight-label">Total Caffeine</div>
                        </div>
                    </div>
                    <div class="insight-item">
                        <div class="insight-icon">📊</div>
                        <div class="insight-content">
                            <div class="insight-value">${avgCaffeine}mg</div>
                            <div class="insight-label">Daily Average</div>
                        </div>
                    </div>
                    <div class="insight-item">
                        <div class="insight-icon">⚡</div>
                        <div class="insight-content">
                            <div class="insight-value">${maxEntry.amount}mg</div>
                            <div class="insight-label">Highest Intake</div>
                        </div>
                    </div>
                    <div class="insight-item">
                        <div class="insight-icon">📅</div>
                        <div class="insight-content">
                            <div class="insight-value">${uniqueDates.size}</div>
                            <div class="insight-label">Days Tracked</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Check if insights already exist
        let existingInsights = insightsCard.querySelector('.caffeine-insights');
        
        if (existingInsights) {
            // Update existing insights
            existingInsights.outerHTML = insightsHTML;
        } else {
            // Add insights after the chart
            const chartElement = insightsCard.querySelector('#statsChart');
            if (chartElement) {
                chartElement.insertAdjacentHTML('afterend', insightsHTML);
            } else {
                // If no chart, just append to the card
                insightsCard.insertAdjacentHTML('beforeend', insightsHTML);
            }
        }
    },
  
  formatBeverageType: function(type) {
      if (!type) return '';
        
      // Replace underscores with spaces
      let formatted = type.replace(/_/g, ' ');
        
      // Capitalize each word
      formatted = formatted.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
            
      return formatted;
  },
    
  displayEntriesList: function(entries) {
      const container = document.getElementById('caffeineEntries') || 
                       document.querySelector('.feature-card:first-child');
        
      if (!container) return;
        
      // Clear any existing entry controls and container
      let entryControls = container.querySelector('.entry-controls');
      let entriesContainer = container.querySelector('.entries-container');
        
      if (entryControls) entryControls.remove();
      if (entriesContainer) entriesContainer.remove();
        
      // Create fresh controls and container
      entryControls = document.createElement('div');
      entryControls.className = 'entry-controls';
      entryControls.innerHTML = `
          <div class="search-box">
              <input type="text" class="search-input" id="caffeineSearch" placeholder="Search entries...">
          </div>
          <div class="sort-controls">
              <select id="caffeineSort" class="sort-select">
                  <option value="date-desc">Date (newest first)</option>
                  <option value="date-asc">Date (oldest first)</option>
                  <option value="amount-desc">Amount (high to low)</option>
                  <option value="amount-asc">Amount (low to high)</option>
              </select>
          </div>
      `;
        
      entriesContainer = document.createElement('div');
      entriesContainer.className = 'entries-container';
        
      // Append them to the container
      container.appendChild(entryControls);
      container.appendChild(entriesContainer);
        
      // Set up event listeners
      const searchInput = document.getElementById('caffeineSearch');
      if (searchInput) {
          searchInput.addEventListener('input', () => this.filterAndSortEntries(entries));
      }
        
      const sortSelect = document.getElementById('caffeineSort');
      if (sortSelect) {
          sortSelect.addEventListener('change', () => this.filterAndSortEntries(entries));
      }
        
      // Initial display
      this.filterAndSortEntries(entries);
  },
    
  filterAndSortEntries: function(entries) {
      if (!entries || entries.length === 0) return;
        
      const searchTerm = document.getElementById('caffeineSearch')?.value.toLowerCase() || '';
      const sortOption = document.getElementById('caffeineSort')?.value || 'date-desc';
        
      // Filter entries
      let filteredEntries = entries.filter(entry => {
          if (this.formatBeverageType(entry.beverage_type).toLowerCase().includes(searchTerm)) return true;
          if (entry.amount.toString().includes(searchTerm)) return true;
            
          const date = new Date(entry.consumed_at);
          const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
          if (dateStr.toLowerCase().includes(searchTerm)) return true;
            
          return false;
      });
        
      // Sort entries
      filteredEntries.sort((a, b) => {
          switch(sortOption) {
              case 'date-asc': return new Date(a.consumed_at) - new Date(b.consumed_at);
              case 'date-desc': return new Date(b.consumed_at) - new Date(a.consumed_at);
              case 'amount-asc': return a.amount - b.amount;
              case 'amount-desc': return b.amount - a.amount;
              default: return new Date(b.consumed_at) - new Date(a.consumed_at);
          }
      });
        
      this.displayFilteredEntries(filteredEntries);
  },
    
  displayFilteredEntries: function(entries) {
      const container = document.querySelector('.entries-container');
      if (!container) return;
        
      container.innerHTML = '';
        
      if (entries.length === 0) {
          container.innerHTML = '<p class="no-results">No entries match your search</p>';
          return;
      }
        
      entries.forEach(entry => {
          const date = new Date(entry.consumed_at);
          const item = document.createElement('div');
          item.className = 'entry-item';
          item.innerHTML = `
              <div>
                  <span class="entry-type">${this.formatBeverageType(entry.beverage_type)}</span>
                  <span class="entry-amount">${entry.amount}mg</span>
              </div>
              <div class="entry-date">${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
              <button class="edit-entry-btn" onclick="CaffeineTracker.editEntry('${entry.id}')">Edit</button>
          `;
          container.appendChild(item);
      });
  }  
};

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('caffeineForm');
    if (form) {
        console.log("Found caffeine form, attaching submit handler");
        form.addEventListener('submit', CaffeineTracker.handleFormSubmit);
    }
    
    // Add event listener for the cancel button
    const cancelButton = document.querySelector('#caffeineForm .cancel-btn') || 
                          document.querySelector('#caffeineFormContainer .cancel-btn');
    
    if (cancelButton) {
        console.log("Found cancel button, attaching click handler");
        cancelButton.addEventListener('click', CaffeineTracker.hideForm);
    }
});

// Initialize tracker
CaffeineTracker.initialize();

// Expose functions globally if needed for HTML onclick attributes
window.showCaffeineForm = CaffeineTracker.showAddForm;
window.hideCaffeineForm = CaffeineTracker.hideForm;

async function loadCaffeineEntries() {
    try {
        console.log("Loading caffeine entries...");
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (!user) {
            console.log("No authenticated user");
            return [];
        }
        
        const { data, error } = await supabaseClient
            .from('caffeine_entries')
            .select('*')
            .eq('user_id', user.id)
            .order('consumed_at', { ascending: false });
            
        if (error) throw error;
        
        console.log("Retrieved caffeine entries:", data);
        
        
        if (data && data.length > 0) {
            CaffeineTracker.displayCaffeineInsights(data);
        }
        
        return data || [];
        
    } catch (err) {
        console.error("Error loading caffeine entries:", err);
        return [];
    }
}

// Function to display caffeine entries with a Log Caffeine button
function displayCaffeineEntries(entries) {
    const container = document.getElementById('caffeineEntries') || 
                     document.querySelector('.feature-card:first-child');
  
    if (!container) {
      console.error("Could not find container to display caffeine entries");
      return;
    }
  
    // Button to add new caffeine entry
    const addButton = `
      <button id="addCaffeineBtn" class="journal-btn">Log Caffeine</button>
    `;
  
    if (!entries || entries.length === 0) {
      container.innerHTML = `
        <div class="timer-display">
          <h3>Caffeine Tracker</h3>
          <p>No caffeine consumed yet. Good job! ☕</p>
          ${addButton}
        </div>`;
    } else {
      // Sort entries by consumed_at date (newest first)
      entries.sort((a, b) => new Date(b.consumed_at) - new Date(a.consumed_at));
    
      // Get the most recent entry
      const lastEntry = entries[0];
      const lastConsumedDate = new Date(lastEntry.consumed_at);
    
      // Calculate time since last caffeine
      const timeSince = getTimeSince(lastConsumedDate);
    
      // Create the HTML for the timer display
      container.innerHTML = `
        <div class="timer-display">
          <h3>Time Since Last Caffeine</h3>
          <div id="caffeineTimer" class="metric-display">
            <span class="time-counter">${timeSince}</span>
          </div>
          <div class="last-entry">
            <div class="entry-header">
              <h4>Last Consumption</h4>
              <button onclick="CaffeineTracker.editEntry('${lastEntry.id}')" class="edit-btn">Edit</button>
            </div>
            <p>${CaffeineTracker.formatBeverageType(lastEntry.beverage_type)} (${lastEntry.amount}mg)</p>
            <small>Consumed on ${lastConsumedDate.toLocaleDateString()} at ${lastConsumedDate.toLocaleTimeString()}</small>
          </div>
          ${addButton}
        </div>`;
    
      // Set up interval to update the timer
      updateCaffeineTimer(lastConsumedDate);
    
      
      CaffeineTracker.displayEntriesList(entries);
    }
  
    // Add event listener to the add button
    const addCaffeineBtn = document.getElementById('addCaffeineBtn');
    if (addCaffeineBtn) {
      addCaffeineBtn.addEventListener('click', CaffeineTracker.showAddForm);
    }
}
// Add this helper function to format beverage types
function formatBeverageType(type) {
    if (!type) return '';
    
    // Replace underscores with spaces
    let formatted = type.replace(/_/g, ' ');
    
    // Capitalize each word
    formatted = formatted.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
      
    return formatted;
  }
  

// Function to calculate time since last caffeine with clearer labels
function getTimeSince(date) {
    const now = new Date();
    const diffMs = now - date;
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    let result = '';
    if (days > 0) result += `${days} days `;
    if (hours > 0 || days > 0) result += `${hours} hrs `;
    result += `${minutes} mins`;
    
    return result;
}

// Function to update the timer every minute
function updateCaffeineTimer(lastConsumedDate) {
    // Clear any existing timer
    if (window.caffeineTimerInterval) {
        clearInterval(window.caffeineTimerInterval);
    }
    
    // Update the timer immediately
    const timerElement = document.querySelector('.time-counter');
    if (timerElement) {
        timerElement.textContent = getTimeSince(lastConsumedDate);
    }
    
    // Set up interval to update every minute
    window.caffeineTimerInterval = setInterval(() => {
        const timerElement = document.querySelector('.time-counter');
        if (timerElement) {
            timerElement.textContent = getTimeSince(lastConsumedDate);
        } else {
            // If element no longer exists, clear interval
            clearInterval(window.caffeineTimerInterval);
        }
    }, 60000); // Update every minute
}

// Make sure to load entries when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Load and display entries
    loadCaffeineEntries().then(entries => {
      displayCaffeineEntries(entries);
    });
});
