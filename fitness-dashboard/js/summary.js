const summaryElement = document.getElementById('summary');
const entries = JSON.parse(localStorage.getItem('entries')) || [];

function calculateSummary() {
    const totalWorkouts = entries.filter(entry => entry.workout).length;
    const healthyDays = entries.filter(entry => entry.healthy).length;
    const totalDays = entries.length;

    return {
        totalWorkouts,
        healthyDays,
        totalDays,
        workoutPercentage: totalDays ? ((totalWorkouts / totalDays) * 100).toFixed(2) : 0,
        healthyPercentage: totalDays ? ((healthyDays / totalDays) * 100).toFixed(2) : 0
    };
}

function displaySummary() {
    const { totalWorkouts, healthyDays, totalDays, workoutPercentage, healthyPercentage } = calculateSummary();

    summaryElement.innerHTML = `
        <h2>Summary</h2>
        <p>Total Workouts: ${totalWorkouts} out of ${totalDays}</p>
        <p>Healthy Days: ${healthyDays} out of ${totalDays}</p>
        <p>Workout Percentage: ${workoutPercentage}%</p>
        <p>Healthy Eating Percentage: ${healthyPercentage}%</p>
    `;
}

document.addEventListener('DOMContentLoaded', displaySummary);