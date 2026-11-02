const calendarElement = document.getElementById('calendar');
const monthYearElement = document.getElementById('month-year');
const daysContainer = document.getElementById('days-container');

let currentDate = new Date();

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    monthYearElement.innerText = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;
    
    daysContainer.innerHTML = '';
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const totalDays = lastDayOfMonth.getDate();
    const firstDayIndex = firstDayOfMonth.getDay();
    
    for (let i = 0; i < firstDayIndex; i++) {
        daysContainer.innerHTML += '<div class="day empty"></div>';
    }
    
    for (let day = 1; day <= totalDays; day++) {
        daysContainer.innerHTML += `<div class="day" onclick="selectDate(${day})">${day}</div>`;
    }
}

function selectDate(day) {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    // Logic to handle workout and health entry for the selected date
    console.log(`Selected date: ${selectedDate.toDateString()}`);
}

function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    renderCalendar();
}

document.getElementById('prev-month').addEventListener('click', () => changeMonth(-1));
document.getElementById('next-month').addEventListener('click', () => changeMonth(1));

renderCalendar();