(() => {
    'use strict';

    const byId = id => document.getElementById(id);
    const dateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const fromKey = key => new Date(`${key}T12:00:00`);
    const today = new Date();
    const todayKey = dateKey(today);
    let month = new Date(today.getFullYear(), today.getMonth(), 1, 12);
    let selected = todayKey;
    let entries = {};
    let storageAvailable = true;
    let dirty = false;
    let toastTimer;
    const nutritionNames = { healthy: 'zdrowo', mixed: 'różnie', unhealthy: 'niezdrowo' };
    const activityNames = { strength: 'Trening siłowy', running: 'Bieganie', cycling: 'Rower', walking: 'Spacer', yoga: 'Joga', other: 'Inna aktywność' };
    const capitalize = text => text.charAt(0).toUpperCase() + text.slice(1);
    const icons = () => globalThis.lucide?.createIcons({ attrs: { 'aria-hidden': 'true', 'stroke-width': 1.7 } });
    const text = (id, value) => { byId(id).textContent = value; };

    function notify(message, error = false) {
        clearTimeout(toastTimer);
        const toast = byId('toast');
        toast.textContent = message;
        toast.classList.toggle('error', error);
        toast.hidden = false;
        toastTimer = setTimeout(() => { toast.hidden = true; }, error ? 10000 : 4000);
    }

    function canLeave() {
        return !dirty || confirm('Masz niezapisane zmiany. Opuścić ten dzień bez zapisywania?');
    }

    function persist(next) {
        if (!storageAvailable) {
            notify('Nie można odczytać pamięci. Wyeksportuj kopię danych i sprawdź ustawienia przeglądarki.', true);
            return false;
        }
        try {
            entries = FitnessStorage.save(next);
            dirty = false;
            return true;
        } catch {
            notify('Nie udało się zapisać. Pamięć przeglądarki jest zablokowana lub pełna.', true);
            return false;
        }
    }

    function renderCalendar() {
        text('month-label', capitalize(month.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })));
        byId('next-month').disabled = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();
        byId('prev-month').disabled = month.getFullYear() <= 1900 && month.getMonth() === 0;
        const start = (month.getDay() + 6) % 7;
        const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
        const cells = Math.ceil((start + days) / 7) * 7;
        let html = '';
        for (let index = 0; index < cells; index++) {
            const date = new Date(month.getFullYear(), month.getMonth(), index - start + 1, 12);
            const key = dateKey(date);
            const outside = date.getMonth() !== month.getMonth();
            if (outside) {
                html += `<div class="calendar-day outside" aria-hidden="true"><span class="day-number">${date.getDate()}</span></div>`;
                continue;
            }
            const entry = entries[key];
            const future = key > todayKey;
            const description = entry ? `${entry.workout ? 'trening' : 'odpoczynek'}, jedzenie: ${nutritionNames[entry.nutrition]}` : 'brak wpisu';
            const label = `${date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}, ${description}`;
            html += `<button type="button" class="calendar-day${key === selected ? ' selected' : ''}${key === todayKey ? ' today' : ''}${entry ? ' has-entry' : ''}" data-date="${key}" aria-label="${label}" aria-pressed="${key === selected}"${key === todayKey ? ' aria-current="date"' : ''}${future ? ' disabled' : ''}><span class="day-number">${date.getDate()}</span><span class="day-marks">${entry?.workout ? '<span class="day-mark workout-mark"><i data-lucide="dumbbell"></i></span>' : ''}${entry ? `<span class="day-mark nutrition-${entry.nutrition}"><i data-lucide="${entry.nutrition === 'healthy' ? 'leaf' : entry.nutrition === 'mixed' ? 'scale' : 'pizza'}"></i></span>` : ''}</span>${entry ? '<span class="entry-tick"></span>' : ''}</button>`;
        }
        byId('calendar-grid').innerHTML = html;
        icons();
    }

    function renderEditor() {
        const date = fromKey(selected);
        const entry = entries[selected];
        byId('entry-form').reset();
        text('selected-weekday', date.toLocaleDateString('pl-PL', { weekday: 'long' }).toUpperCase());
        text('day-title', date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' }));
        text('entry-badge', entry ? 'Zapisano' : selected === todayKey ? 'Dzisiaj' : 'Brak wpisu');
        byId('entry-badge').classList.toggle('saved', Boolean(entry));
        if (entry) {
            document.querySelector(`input[name="workout"][value="${entry.workout ? 'yes' : 'no'}"]`).checked = true;
            document.querySelector(`input[name="nutrition"][value="${entry.nutrition}"]`).checked = true;
            byId('workout-type').value = Object.hasOwn(activityNames, entry.type) ? entry.type : 'other';
            byId('duration').value = entry.duration || '';
            byId('note').value = entry.note;
        }
        byId('workout-details').hidden = !entry?.workout;
        byId('duration').disabled = !entry?.workout;
        byId('delete-entry').disabled = !entry;
        dirty = false;
    }

    function getMonthSummary() {
        const prefix = dateKey(month).slice(0, 7);
        const records = Object.entries(entries).filter(([date]) => date.startsWith(prefix) && date <= todayKey).sort(([first], [second]) => first.localeCompare(second));
        const counts = { healthy: 0, mixed: 0, unhealthy: 0 };
        let workouts = 0;
        let minutes = 0;
        let longest = 0;
        let streak = 0;
        let previous = null;
        for (const [date, entry] of records) {
            counts[entry.nutrition]++;
            if (entry.workout) { workouts++; minutes += entry.duration; }
            const priorDay = fromKey(date);
            priorDay.setDate(priorDay.getDate() - 1);
            if (entry.workout || entry.nutrition === 'healthy') {
                streak = previous === dateKey(priorDay) ? streak + 1 : 1;
                longest = Math.max(longest, streak);
                previous = date;
            } else { streak = 0; previous = null; }
        }
        const totalDays = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
        const elapsed = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth() ? today.getDate() : totalDays;
        return { records, counts, workouts, minutes, longest, elapsed, totalDays };
    }

    function renderSummary() {
        const summary = getMonthSummary();
        const { records, counts, workouts, minutes, longest, elapsed } = summary;
        const percent = records.length ? Math.round(counts.healthy / records.length * 100) : 0;
        const logging = Math.round(records.length / elapsed * 100);
        text('stat-workouts', workouts);
        text('stat-minutes', `${minutes} min aktywności`);
        text('stat-healthy', counts.healthy);
        text('stat-nutrition-detail', records.length ? `${percent}% uzupełnionych dni` : 'Brak wpisów');
        text('stat-streak', longest);
        text('stat-logged', records.length);
        text('stat-elapsed', `/ ${elapsed} dni`);
        text('logging-percent', `${logging}%`);
        byId('logging-progress').style.width = `${logging}%`;
        text('calendar-records', `Zapisane dni: ${records.length}`);
        text('progress-period', capitalize(month.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })));
        byId('healthy-percent').innerHTML = `${percent}<span>%</span>`;
        for (const name of Object.keys(counts)) text(`count-${name}`, counts[name]);
        const healthyAngle = records.length ? counts.healthy / records.length * 360 : 0;
        const mixedAngle = records.length ? (counts.healthy + counts.mixed) / records.length * 360 : 0;
        byId('nutrition-donut').style.background = records.length ? `conic-gradient(var(--mint) 0deg ${healthyAngle}deg, var(--peach) ${healthyAngle}deg ${mixedAngle}deg, var(--rose) ${mixedAngle}deg 360deg)` : 'var(--border)';
        text('nutrition-caption', records.length ? `Ocenione dni: ${records.length} z ${elapsed}. Pozostałe nie są wliczane.` : 'Brak ocen jedzenia w tym miesiącu.');
        renderChart(summary);
    }

    function renderChart({ records, totalDays }) {
        const offset = (month.getDay() + 6) % 7;
        const weeks = Array.from({ length: Math.ceil((totalDays + offset) / 7) }, () => ({ workouts: 0, healthy: 0 }));
        for (const [key, entry] of records) {
            const week = Math.floor((fromKey(key).getDate() - 1 + offset) / 7);
            if (entry.workout) weeks[week].workouts++;
            if (entry.nutrition === 'healthy') weeks[week].healthy++;
        }
        byId('weekly-chart').innerHTML = `<div class="chart-y-axis"><span>7</span><span>5</span><span>3</span><span>0</span></div><div class="chart-plot">${weeks.map((week, index) => {
            const first = Math.max(1, index * 7 - offset + 1);
            const last = Math.min(totalDays, (index + 1) * 7 - offset);
            return `<div class="chart-week"><div class="bar-pair"><div class="chart-bar workout-bar" style="--height:${week.workouts / 7 * 100}%" title="Treningi: ${week.workouts}"><span>${week.workouts}</span></div><div class="chart-bar healthy-bar" style="--height:${week.healthy / 7 * 100}%" title="Zdrowe dni: ${week.healthy}"><span>${week.healthy}</span></div></div><span class="week-label">${first}–${last}</span></div>`;
        }).join('')}</div>`;
        byId('weekly-chart').setAttribute('aria-label', weeks.map((week, index) => `Tydzień ${index + 1}: ${week.workouts} treningów, ${week.healthy} zdrowych dni`).join('. '));
        text('chart-caption', records.length ? 'Liczba treningów i zdrowych dni w kolejnych tygodniach miesiąca.' : 'Twój pierwszy wpis będzie początkiem historii.');
        document.querySelectorAll('.stat-spark').forEach((spark, sparkIndex) => {
            spark.querySelectorAll('span').forEach((bar, index) => {
                const week = weeks[Math.floor(index / 12 * weeks.length)];
                bar.style.height = `${Math.max(3, (sparkIndex ? week.healthy : week.workouts) * 4)}px`;
            });
        });
    }

    function render() {
        renderCalendar();
        renderEditor();
        renderSummary();
    }

    function selectDate(key, focus = false) {
        if (!canLeave()) return;
        selected = key;
        month = new Date(fromKey(key).getFullYear(), fromKey(key).getMonth(), 1, 12);
        render();
        if (focus) {
            byId('day-panel').scrollIntoView({ behavior: 'smooth', block: 'center' });
            document.querySelector('input[name="workout"]').focus({ preventScroll: true });
        }
    }

    function changeMonth(direction) {
        if (!canLeave()) return;
        month = new Date(month.getFullYear(), month.getMonth() + direction, 1, 12);
        selected = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth() ? todayKey : dateKey(month);
        render();
    }

    byId('calendar-grid').addEventListener('click', event => {
        const day = event.target.closest('[data-date]');
        if (day && !day.disabled) selectDate(day.dataset.date, matchMedia('(max-width: 760px)').matches);
    });
    byId('prev-month').addEventListener('click', () => changeMonth(-1));
    byId('next-month').addEventListener('click', () => changeMonth(1));
    byId('this-month').addEventListener('click', () => selectDate(todayKey));
    byId('log-today').addEventListener('click', () => selectDate(todayKey, true));
    byId('entry-form').addEventListener('input', () => { dirty = true; });
    document.querySelectorAll('input[name="workout"]').forEach(input => input.addEventListener('change', () => {
        const active = input.value === 'yes';
        byId('workout-details').hidden = !active;
        byId('duration').disabled = !active;
    }));
    byId('entry-form').addEventListener('submit', event => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const workout = form.get('workout') === 'yes';
        const next = { ...entries, [selected]: { workout, nutrition: form.get('nutrition'), type: workout ? byId('workout-type').value : '', duration: workout ? Number(byId('duration').value || 0) : 0, note: byId('note').value.trim() } };
        if (persist(next)) { render(); notify('Dzień zapisany. Dobra robota!'); }
    });
    byId('delete-entry').addEventListener('click', () => {
        if (!entries[selected] || !confirm('Usunąć wpis z tego dnia?')) return;
        const next = { ...entries };
        delete next[selected];
        if (persist(next)) { render(); notify('Wpis został usunięty.'); }
    });
    byId('export-button').addEventListener('click', () => {
        try {
            const payload = storageAvailable ? entries : JSON.parse(localStorage.getItem('fitnessEntries') || '{}');
            const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), entries: payload }, null, 2)], { type: 'application/json' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `forma-${dateKey(new Date())}.json`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            notify('Kopia danych została pobrana.');
        } catch { notify('Nie można pobrać danych. Sprawdź dostęp do pamięci przeglądarki.', true); }
    });
    byId('import-button').addEventListener('click', () => byId('import-file').click());
    byId('import-file').addEventListener('change', async event => {
        const file = event.target.files[0];
        if (!file) return;
        try {
            if (file.size > 2000000) throw new Error('Plik jest za duży. Limit to 2 MB.');
            const payload = JSON.parse(await file.text());
            const incoming = FitnessStorage.validate(payload.entries ?? payload);
            const dates = Object.keys(incoming);
            if (!dates.length) throw new Error('Plik nie zawiera żadnych wpisów.');
            if (dates.some(key => key > todayKey || key < '1900-01-01')) throw new Error('Plik zawiera daty z przyszłości lub sprzed 1900 roku.');
            if (!canLeave() || !confirm(`Wczytać ${dates.length} wpisów? Wpisy z tych samych dni zostaną zastąpione. Pozostałe zostaną zachowane.`)) return;
            if (persist({ ...entries, ...incoming })) { render(); notify(`Zaimportowano wpisy: ${dates.length}.`); }
        } catch (error) { notify(`Nie udało się wczytać pliku. ${error instanceof SyntaxError ? 'To nie jest poprawny plik JSON.' : error.message}`, true); }
        finally { event.target.value = ''; }
    });
    byId('privacy-button').addEventListener('click', () => byId('privacy-dialog').showModal());
    byId('close-privacy').addEventListener('click', () => byId('privacy-dialog').close());
    byId('privacy-dialog').addEventListener('click', event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.currentTarget.close(); } });
    document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', () => {
        document.querySelectorAll('.nav-link').forEach(item => item.classList.toggle('active', item === link));
    }));
    addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
    addEventListener('storage', event => {
        if (event.key !== 'fitnessEntries' && event.key !== null) return;
        if (dirty) { storageAvailable = false; notify('Dane zmieniono w innej karcie. Pobierz kopię zmian i odśwież stronę przed zapisem.', true); return; }
        try { entries = FitnessStorage.load(); render(); } catch { storageAvailable = false; notify('Nie można odczytać zmienionych danych. Odśwież stronę.', true); }
    });

    try { entries = FitnessStorage.load(); }
    catch { storageAvailable = false; notify('Nie można odczytać danych. Niczego nie nadpisano. Sprawdź pamięć przeglądarki i pobierz kopię.', true); }
    text('current-date', today.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }));
    render();
})();