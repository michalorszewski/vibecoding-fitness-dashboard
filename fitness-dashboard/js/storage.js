const FitnessStorage = (() => {
    const key = 'fitnessEntries';
    const validDate = value => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
        const date = new Date(`${value}T12:00:00`);
        return !Number.isNaN(date.getTime()) && date.getFullYear() === Number(value.slice(0, 4)) && date.getMonth() + 1 === Number(value.slice(5, 7)) && date.getDate() === Number(value.slice(8, 10));
    };

    function validate(entries) {
        if (!entries || typeof entries !== 'object' || Array.isArray(entries)) throw new Error('Nieprawidlowy format danych.');
        const result = {};
        for (const [date, entry] of Object.entries(entries)) {
            if (!validDate(date) || !entry || typeof entry !== 'object' || typeof entry.workout !== 'boolean') throw new Error('Nieprawidlowy wpis dnia.');
            const nutrition = entry.nutrition ?? (typeof entry.healthyEating === 'boolean' ? (entry.healthyEating ? 'healthy' : 'unhealthy') : null);
            if (!['healthy', 'mixed', 'unhealthy'].includes(nutrition)) throw new Error('Nieprawidlowa ocena jedzenia.');
            const duration = Number(entry.duration ?? 0);
            if (!Number.isInteger(duration) || duration < 0 || duration > 1440) throw new Error('Nieprawidlowy czas treningu.');
            result[date] = {
                workout: entry.workout,
                nutrition,
                type: typeof entry.type === 'string' ? entry.type.slice(0, 80) : '',
                duration: entry.workout ? duration : 0,
                note: typeof entry.note === 'string' ? entry.note.slice(0, 500) : ''
            };
        }
        return result;
    }

    function load() {
        return validate(JSON.parse(localStorage.getItem(key) || '{}'));
    }

    function save(entries) {
        const validated = validate(entries);
        localStorage.setItem(key, JSON.stringify(validated));
        return validated;
    }

    return { load, save, validate, validDate };
})();