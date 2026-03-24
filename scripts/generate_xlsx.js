const XLSX = require('xlsx');
const path = require('path');

const fields = [
  ['Field', 'Your Response'],
  ['1. Client / Brand Name', '[Enter name here]'],
  ['2. Industry / Niche', '[Enter industry here]'],
  ['3. Target Audience', '[Enter primary demographics here]'],
  ['4. Current Core Challenges', '[Enter main problems they face]'],
  ['5. Main Competitors', '[Enter 2-5 competitors]'],
  ['6. Core Value Proposition / Messaging', '[Enter how they pitch their product today]'],
  ['7. Specific Goals for this Quarter/Year', '[Enter the objectives they explicitly shared]'],
];

const ws = XLSX.utils.aoa_to_sheet(fields);

// Set column widths for readability
ws['!cols'] = [{ wch: 45 }, { wch: 60 }];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Client Onboarding');

const outputPath = path.join(__dirname, '../public/CinaTech_Client_Onboarding_Template.xlsx');
XLSX.writeFile(wb, outputPath);
console.log('XLSX generated successfully.');
