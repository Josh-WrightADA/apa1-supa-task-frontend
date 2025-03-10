function initializeCharts() {
    const ctx = document.getElementById('statsChart').getContext('2d');
    
    const chart = new Chart(ctx, {
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
}
