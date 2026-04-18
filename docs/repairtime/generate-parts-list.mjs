import fs from 'node:fs';
import path from 'node:path';

const inputPath = path.resolve(process.cwd(), process.argv[2] ?? 'docs/repairtime/Results.csv');
const outputPath = path.resolve(process.cwd(), process.argv[3] ?? 'docs/repairtime/Parts.csv');

function parseCsv(text) {
  const rows = [];
  let currentRow = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentValue += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === ',' && !insideQuotes) {
      currentRow.push(currentValue);
      currentValue = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1;
      }
      currentRow.push(currentValue);
      currentValue = '';
      if (currentRow.length > 1 || currentRow[0] !== '') {
        rows.push(currentRow);
      }
      currentRow = [];
      continue;
    }

    currentValue += char;
  }

  if (currentValue !== '' || currentRow.length > 0) {
    currentRow.push(currentValue);
    rows.push(currentRow);
  }

  return rows;
}

function toCsv(rows) {
  return rows
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\n');
}

function cleanupPartName(name) {
  return name
    .replace(/\s*-\s*AT$/i, '')
    .replace(/\s*-\s*högerstyrd$/i, '')
    .replace(/\s*-\s*vänsterstyrd$/i, '')
    .replace(/\s*-\s*komplett$/i, '')
    .replace(/\s*\((alla|båda|ett|en)\)/gi, '')
    .replace(/\s*\((drivande|drivet)\)/gi, '')
    .replace(/kompl\./gi, 'komplett')
    .replace(/ - /g, ' ')
    .replace(/\s+(alla|båda|ett|en)$/gi, '')
    .replace(/,/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .replace(/[\s.,-]+$/g, '');
}

function getPartName(labourName) {
  if (!labourName || !labourName.trim()) {
    return null;
  }

  const name = labourName.trim();
  const normalized = name.toLowerCase();

  const serviceOnlyPatterns = [
    /^provtryckning av system$/,
    /^system, evakuering\/fyllning$/,
    /^system, läcktest$/,
    /^kompressionsprov$/,
    /^geometri, hela bilen$/,
    /^hjulinställning/,
    /^kont\./,
    /^kont\.\/just\./,
    /^tappa\/fyll/
  ];

  if (serviceOnlyPatterns.some((pattern) => pattern.test(normalized))) {
    return null;
  }

  const mappedPartRules = [
    [/^bytesmotor, kompl\./, 'Motor'],
    [/^motor, enbart$/, 'Motor'],
    [/^cylinderlock - flyttning detaljer$/, 'Cylinderlock'],
    [/^bromsbelägg bak/, 'Bromsbelägg bak'],
    [/^bromsbelägg fram/, 'Bromsbelägg fram'],
    [/^bromsskivor bak .*inklusive belägg$/, 'Bromsskivor och bromsbelägg bak'],
    [/^bromsskivor fram .*inklusive belägg$/, 'Bromsskivor och bromsbelägg fram'],
    [/^bromsskivor bak/, 'Bromsskivor bak'],
    [/^bromsskivor fram/, 'Bromsskivor fram'],
    [/^bromsok, bakre/, 'Bromsok bak'],
    [/^bromsok, främre/, 'Bromsok fram'],
    [/^bromsslang, bakre/, 'Bromsslang bak'],
    [/^bromsslang, främre/, 'Bromsslang fram'],
    [/^bromsservo/, 'Bromsservo'],
    [/^drev, hastighetsmätare/, 'Hastighetsmätardrev'],
    [/^axlar, växelväljare$/, 'Växelväljaraxel'],
    [/^avgasåterledningsventil$/, 'EGR-ventil'],
    [/^bakre rördel\/ljuddämpare$/, 'Bakre ljuddämpare'],
    [/^waste gate manöverdon$/, 'Wastegate-ställdon'],
    [/^gasurladdningsstrålkastare/, 'Xenonstrålkastare'],
    [/^glödlampa för gasurladdningsstrålkastare$/, 'Xenonlampa'],
    [/^bränslepump - i tank$/, 'Bränslepump'],
    [/^högtryckspump \(common rail\)$/, 'Högtryckspump'],
    [/^insprutare/, 'Insprutare'],
    [/^komplett värmepaket$/, 'Värmepaket'],
    [/^ledning, kompressor till kondensor$/, 'AC-ledning kompressor till kondensor'],
    [/^kylvätska\/frostskydd$/, 'Kylvätska'],
    [/^motorolja och filter$/, 'Motorolja och oljefilter'],
    [/^luftfilterenhet$/, 'Luftfilterhus'],
    [/^luftfilterinsats$/, 'Luftfilter'],
    [/^hjälpaggregatdrivremmens spännare$/, 'Drivremsspännare'],
    [/^gummidamasker, kuggstång/, 'Styrväxeldamask'],
    [/^dörrruta-bakdörr$/, 'Dörruta bakdörr'],
    [/^dörrruta-framdörr$/, 'Dörruta framdörr'],
    [/^fönsterhissmekanism-bakdörr$/, 'Fönsterhissmekanism bakdörr'],
    [/^fönsterhissmekanism-framdörr$/, 'Fönsterhissmekanism framdörr'],
    [/^hissmotor, framruta$/, 'Fönsterhissmotor fram'],
    [/^hissmotor, bakruta$/, 'Fönsterhissmotor bak']
  ];

  for (const [pattern, partName] of mappedPartRules) {
    if (pattern.test(normalized)) {
      return partName;
    }
  }

  const cleaned = cleanupPartName(name);
  const cleanedNormalized = cleaned.toLowerCase();

  if (/^fjäderben komplett$/.test(cleanedNormalized)) {
    return 'Fjäderben';
  }
  if (/^hjulnav komplett/.test(cleanedNormalized)) {
    return cleaned.replace(/komplett/gi, '').trim();
  }
  if (/^främre stötfångare$/.test(cleanedNormalized)) {
    return 'Stötfångare fram';
  }
  if (/^bakre stötfångare$/.test(cleanedNormalized)) {
    return 'Stötfångare bak';
  }
  if (/^pedal$/.test(cleanedNormalized)) {
    return 'Pedalställ';
  }

  return cleaned || null;
}

const source = fs.readFileSync(inputPath, 'utf8').replace(/^\uFEFF/, '');
const [headers, ...dataRows] = parseCsv(source);
const headerIndex = Object.fromEntries(headers.map((header, index) => [header, index]));

const uniqueRows = [];
const seen = new Set();
let excludedCount = 0;

for (const row of dataRows) {
  const category = row[headerIndex.category];
  const labourName = row[headerIndex.productName];
  const partName = getPartName(labourName);

  if (!partName) {
    excludedCount += 1;
    continue;
  }

  const key = `${category}|||${partName}`;
  if (seen.has(key)) {
    continue;
  }

  seen.add(key);
  uniqueRows.push([category, partName]);
}

uniqueRows.sort((left, right) => {
  const categoryCompare = left[0].localeCompare(right[0], 'sv');
  if (categoryCompare !== 0) {
    return categoryCompare;
  }
  return left[1].localeCompare(right[1], 'sv');
});

fs.writeFileSync(outputPath, `${toCsv([['category', 'partName'], ...uniqueRows])}\n`, 'utf8');

console.log(`Generated ${path.relative(process.cwd(), outputPath)}`);
console.log(`Input rows: ${dataRows.length}`);
console.log(`Output unique parts: ${uniqueRows.length}`);
console.log(`Excluded service-only rows: ${excludedCount}`);