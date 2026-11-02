const ctx = document.getElementById('progressChart').getContext('2d');

const generateChart = (labels, data) => {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Postępy treningowe',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Liczba treningów'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Dni'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return `Dzień: ${tooltipItem.label}, Treningi: ${tooltipItem.raw}`;
                        }
                    }
                }
            }
        }
    });
};

const updateChart = (chart, labels, data) => {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
};

const fetchDataAndRenderChart = () => {
    fetch('../data/entries.json')
        .then(response => response.json())
        .then(data => {
            const labels = data.map(entry => entry.date);
            const workoutData = data.map(entry => entry.workouts);
            generateChart(labels, workoutData);
        })
        .catch(error => console.error('Error fetching data:', error));
};

document.addEventListener('DOMContentLoaded', () => {
    fetchDataAndRenderChart();
});