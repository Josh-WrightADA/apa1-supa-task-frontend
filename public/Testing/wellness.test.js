function updateWellnessChart(wellnessData) {
  const ctx = document.getElementById('statsChart').getContext('2d');
    
  // Prepare dates and data points
  const dates = wellnessData.map(entry => {
    const date = new Date(entry.created_at);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  });
    
  const energyData = wellnessData.map(entry => entry.energy_level);
  const moodData = wellnessData.map(entry => entry.mood);
  const cravingData = wellnessData.map(entry => entry.caffeine_craving);
    
  // If no data, use placeholders
  if (wellnessData.length === 0) {
    // Use sample data
    dates.push('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun');
    energyData.push(3, 3, 3, 3, 3, 3, 3);
    moodData.push(3, 3, 3, 3, 3, 3, 3);
    cravingData.push(3, 3, 3, 3, 3, 3, 3);
  }
    
  // Check if chart already exists and destroy it
  if (window.wellnessChart) {
    window.wellnessChart.destroy();
  }
    
  // Create new chart
  window.wellnessChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'Energy Level',
          data: energyData,
          borderColor: '#8b5e3c',
          fill: false,
          tension: 0.4
        },
        {
          label: 'Mood',
          data: moodData,
          borderColor: '#6d4c41',
          fill: false,
          tension: 0.4
        },
        {
          label: 'Caffeine Cravings',
          data: cravingData,
          borderColor: '#4b2e1a',
          fill: false,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#4b2e1a'
          }
        },
        tooltip: {
          backgroundColor: '#4b2e1a',
          titleColor: '#f5e1c5',
          bodyColor: '#f5e1c5'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 5,
          ticks: {
            color: '#4b2e1a'
          },
          grid: {
            color: 'rgba(75, 46, 26, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#4b2e1a'
          },
          grid: {
            color: 'rgba(75, 46, 26, 0.1)'
          }
        }
      }
    }
  });
  
  return window.wellnessChart; // Return for testing purposes
}

// Mock the WellnessTracker object
global.WellnessTracker = {
  hideWellnessForm: jest.fn(),
  loadWellnessData: jest.fn(),
  
  handleFormSubmit: async function(event) {
    event.preventDefault();
      
    // Get form values
    const energyLevel = parseInt(document.getElementById('energyLevel').value);
    const mood = parseInt(document.getElementById('moodLevel').value);
    const caffeineCraving = parseInt(document.getElementById('cravingLevel').value);
    const notes = document.getElementById('wellnessNotes').value;
      
    try {
      // Get current user
      const { data: { user } } = await global.supabaseClient.auth.getUser();
        
      if (!user) {
        global.showToast("Please sign in to save entries", "error");
        return;
      }
        
      // Save to Supabase
      const { data, error } = await global.supabaseClient
        .from('wellness_checkins')
        .insert([
          { 
            user_id: user.id,
            energy_level: energyLevel,
            mood: mood,
            caffeine_craving: caffeineCraving,
            notes: notes
          }
        ])
        .select();
        
      if (error) throw error;
        
      global.showToast("Wellness check-in saved!", "success");
      this.hideWellnessForm();
        
      // Reload chart data
      this.loadWellnessData();
        
    } catch (err) {
      global.showToast("Failed to save entry: " + err.message, "error");
    }
  }
};

// Mock global functions
global.showToast = jest.fn();
global.Chart = class Chart {
  constructor(ctx, config) {
    this.ctx = ctx;
    this.config = config;
    this.type = config.type;
    this.data = config.data;
    this.options = config.options;
  }
  destroy() {}
};

describe('Wellness Tracking Functions', () => {
  beforeEach(() => {
    // Create canvas element for chart
    document.body.innerHTML = `<canvas id="statsChart"></canvas>`;
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock getContext
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      // Mock canvas context methods needed by Chart.js
      measureText: jest.fn(() => ({ width: 100 })),
      fillText: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn(),
      arc: jest.fn(),
      clearRect: jest.fn()
    }));
    
    // Reset window.wellnessChart
    window.wellnessChart = undefined;
  });
  
  test('updateWellnessChart creates a chart with sample data when no entries', () => {
    // Call the function with empty data
    const chart = updateWellnessChart([]);
    
    // Check that chart was created
    expect(window.wellnessChart).toBeDefined();
    expect(chart.data.datasets.length).toBe(3);
    
    // Check that default data was used
    expect(chart.data.labels).toContain('Mon');
    expect(chart.data.datasets[0].data).toEqual([3, 3, 3, 3, 3, 3, 3]);
  });
  
  test('updateWellnessChart creates a chart with provided data', () => {
    // Sample wellness data
    const wellnessData = [
      {
        created_at: '2023-05-01T10:00:00',
        energy_level: 4,
        mood: 5,
        caffeine_craving: 2
      },
      {
        created_at: '2023-05-02T10:00:00',
        energy_level: 3,
        mood: 4,
        caffeine_craving: 3
      }
    ];
    
    // Call the function
    const chart = updateWellnessChart(wellnessData);
    
    // Check chart was created with correct data
    expect(chart.data.datasets[0].data).toEqual([4, 3]); // energy levels
    expect(chart.data.datasets[1].data).toEqual([5, 4]); // mood levels
    expect(chart.data.datasets[2].data).toEqual([2, 3]); // caffeine cravings
  });
  
  test('WellnessTracker.handleFormSubmit correctly saves wellness entry', async () => {
    // Setup document body
    document.body.innerHTML = `
      <form id="wellnessForm">
        <input id="energyLevel" value="4" />
        <input id="moodLevel" value="5" />
        <input id="cravingLevel" value="2" />
        <textarea id="wellnessNotes">Feeling good today</textarea>
      </form>
      <div id="wellnessFormContainer"></div>
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
            data: [{ id: 'entry123' }],
            error: null
          })
        })
      })
    };
    
    // Call the function
    await WellnessTracker.handleFormSubmit(mockEvent);
    
    // Check event was prevented
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    
    // Check Supabase was called correctly
    expect(supabaseClient.from).toHaveBeenCalledWith('wellness_checkins');
    expect(supabaseClient.from().insert).toHaveBeenCalledWith([
      expect.objectContaining({
        user_id: 'user123',
        energy_level: 4,
        mood: 5,
        caffeine_craving: 2,
        notes: 'Feeling good today'
      })
    ]);
    
    // Check UI was updated
    expect(global.showToast).toHaveBeenCalledWith(
      "Wellness check-in saved!", 
      "success"
    );
    expect(WellnessTracker.hideWellnessForm).toHaveBeenCalled();
    expect(WellnessTracker.loadWellnessData).toHaveBeenCalled();
  });
});