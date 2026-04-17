const fs = require('fs');
const path = 'c:/Users/joaov/OneDrive/Área de Trabalho/Codigo app/aplicativo-slimday/aplicativo-slimday/src/components/SlimDayApp.tsx';

if (!fs.existsSync(path)) {
    console.error("File not found");
    process.exit(1);
}

let content = fs.readFileSync(path, 'utf8');

// Standardize encodings first to make finding blocks easier
content = content.replace(/menstruação/g, 'menstruacao')
                 .replace(/menstruação_final/g, 'menstruacao_final')
                 .replace(/ovulação/g, 'ovulacao')
                 .replace(/fértil/g, 'fertil')
                 .replace(/menstruaÃ§Ã£o/g, 'menstruacao')
                 .replace(/menstruaÃ§Ã£o_final/g, 'menstruacao_final');

let lines = content.split('\n');

// Identify blocks
const mealPlanStart = lines.findIndex(l => l.includes('const mealPlan = useMemo'));
const todayKeyStart = lines.findIndex(l => l.includes('const todayKey = useMemo'));
const todayCycleCalendarStart = lines.findIndex(l => l.includes('const todayCycleCalendar = useMemo'));
const currentCycleDayStart = lines.findIndex(l => l.includes('const currentCycleDay ='));

if (mealPlanStart === -1 || currentCycleDayStart === -1) {
    console.error("Could not find blocks", { mealPlanStart, currentCycleDayStart });
    process.exit(1);
}

// Ensure the variables it depends on (currentDate) are also before
// currentDate is at line 88

// The block to move should be everything that currentCycleDay depends on
// specifically todayCycleCalendar and todayKey
const blockToMove = lines.slice(Math.min(todayKeyStart, todayCycleCalendarStart), currentCycleDayStart + 1);

// Remove the block from its current (late) position
// We must do this carefully. Since we are moving it UP, we index from top.
const firstIndex = Math.min(todayKeyStart, todayCycleCalendarStart);
const lastIndex = currentCycleDayStart;
lines.splice(firstIndex, lastIndex - firstIndex + 1);

// Insert it BEFORE mealPlan
lines.splice(mealPlanStart, 0, ...blockToMove);

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log("Successfully reordered hooks and sanitized encodings.");
