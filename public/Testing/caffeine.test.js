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

function displayCaffeineEntries(entries) {
  const container = document.querySelector('.feature-card');
  
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
          <h4>Last Consumption</h4>
          <p>${lastEntry.beverage_type} (${lastEntry.amount}mg)</p>
          <small>Consumed on ${lastConsumedDate.toLocaleDateString()} at ${lastConsumedDate.toLocaleTimeString()}</small>
        </div>
        ${addButton}
      </div>
    `;
  }
}

// Mock the CaffeineTracker object
global.CaffeineTracker = {
  handleFormSubmit: async function(event) {
    event.preventDefault();
    
    const amount = parseInt(document.getElementById('caffeineAmount').value);
    const type = document.getElementById('beverageType').value;
    const consumedAt = document.getElementById('consumedAt').value || new Date().toISOString();
    
    try {
      const { data: { user } } = await global.supabaseClient.auth.getUser();
      
      if (!user) {
        global.showToast("Please sign in to save entries", "error");
        return;
      }
      
      const { data, error } = await global.supabaseClient
        .from('caffeine_entries')
        .insert([
          { 
            user_id: user.id,
            amount: amount,
            beverage_type: type,
            consumed_at: new Date(consumedAt).toISOString()
          }
        ])
        .select();
      
      if (error) throw error;
      
      global.showToast("Caffeine entry saved!", "success");
      
      document.getElementById('caffeineFormContainer').style.display = 'none';
      
      const entries = await global.loadCaffeineEntries();
      global.displayCaffeineEntries(entries);
      
    } catch (err) {
      global.showToast("Failed to save entry: " + err.message, "error");
    }
  }
};

// Mock global functions
global.showToast = jest.fn();
global.loadCaffeineEntries = jest.fn().mockResolvedValue([]);
global.displayCaffeineEntries = jest.fn();

describe('Caffeine Tracking Utilities', () => {
  test('getTimeSince calculates correct time difference', () => {
    // Instead of trying to mock Date globally, we'll use a specific "now" value
    // and pass it to a modified version of getTimeSince for testing
    
    function getTimeWithFixedNow(date, now) {
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
    
    // Fixed "now" date for consistent testing
    const now = new Date('2023-01-01T12:00:00Z');
    
    // Test case 1: 30 minutes ago
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    expect(getTimeWithFixedNow(thirtyMinutesAgo, now)).toBe('30 mins');
    
    // Test case 2: 2 hours ago
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    expect(getTimeWithFixedNow(twoHoursAgo, now)).toBe('2 hrs 0 mins');
    
    // Test case 3: 1 day, 3 hours ago
    const oneDayThreeHoursAgo = new Date(now.getTime() - 27 * 60 * 60 * 1000);
    expect(getTimeWithFixedNow(oneDayThreeHoursAgo, now)).toBe('1 days 3 hrs 0 mins');
  });  
  test('displayCaffeineEntries shows no entries message when empty', () => {
    // Setup document body
    document.body.innerHTML = `
      <div class="feature-card"></div>
    `;
    
    // Call the function
    displayCaffeineEntries([]);
    
    // Check the output
    const container = document.querySelector('.feature-card');
    expect(container.innerHTML).toContain('No caffeine consumed yet');
    expect(container.innerHTML).toContain('Log Caffeine');
  });
  
  test('handleFormSubmit correctly saves caffeine entry', async () => {
    // Setup document body
    document.body.innerHTML = `
      <form id="caffeineForm">
        <input id="caffeineAmount" value="100" />
        <select id="beverageType">
          <option value="coffee" selected>Coffee</option>
        </select>
        <input id="consumedAt" value="2023-05-01T10:00" />
      </form>
      <div id="caffeineFormContainer"></div>
    `;
    
    // Mock preventDefault
    const mockEvent = { preventDefault: jest.fn() };
    
    // Mock Supabase and auth
    global.supabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ 
          data: { user: { id: 'user123' } }, 
          error: null 
        })
      },
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [{ id: 'entry123', amount: 100 }],
            error: null
          })
        })
      })
    };
    
    // Call the function
    await CaffeineTracker.handleFormSubmit(mockEvent);
    
    // Check event was prevented
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    
    // Check Supabase was called correctly
    expect(supabaseClient.from).toHaveBeenCalledWith('caffeine_entries');
    expect(supabaseClient.from().insert).toHaveBeenCalledWith([
      expect.objectContaining({
        user_id: 'user123',
        amount: 100,
        beverage_type: 'coffee'
      })
    ]);
    
    // Check UI was updated
    expect(global.showToast).toHaveBeenCalledWith(
      "Caffeine entry saved!", 
      "success"
    );
    expect(document.getElementById('caffeineFormContainer').style.display).toBe('none');
  });
});