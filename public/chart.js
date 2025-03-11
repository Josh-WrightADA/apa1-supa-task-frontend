let currentChart = null; // Global variable to track chart instance

// Simple chart initialization function
function initializeCharts() {
    console.log("Initializing charts...");
    const chartCanvas = document.getElementById('statsChart');
    
    if (!chartCanvas) {
        console.error("Stats chart canvas not found");
        return;
    }
    
    // Clean up existing charts
    if (Chart.getChart(chartCanvas)) {
        Chart.getChart(chartCanvas).destroy();
    }
    
    if (window.wellnessChart && typeof window.wellnessChart.destroy === 'function') {
        window.wellnessChart.destroy();
        window.wellnessChart = null;
    }
    
    // Now create the new chart...    
    const ctx = chartCanvas.getContext('2d');
    
    // Create new chart and store reference
    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [
                {
                    label: 'Energy Level',
                    data: [4, 3, 2, 2, 3, 4, 3],
                    borderColor: '#8b5e3c',
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Mood',
                    data: [5, 4, 2, 3, 4, 4, 3],
                    borderColor: '#6d4c41',
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Caffeine Cravings',
                    data: [1, 2, 4, 3, 2, 1, 2],
                    borderColor: '#4b2e1a',
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        ooptions: {
            responsive: true,
            maintainAspectRatio: true, // Change to true
            plugins: {
                // your existing plugin options
            },
            scales: {
                // your existing scales options
            }
        }
    });
    
    console.log("Chart initialized");
}

// Make sure this function is available globally
window.initializeCharts = initializeCharts;