// Receipt Number Generator
// Generates sequential receipt numbers: 1-999, then A0001-A9999, B0001-B9999, ..., Z9999

import { writeFileSync } from 'fs';

function generateReceiptSequence() {
  const receipts = [];
  
  console.log("Generating Receipt Number Sequence...\n");
  
  // Phase 1: Numbers 1 to 999
  console.log("Phase 1: Numeric receipts (1-999)");
  for (let i = 1; i <= 999; i++) {
    receipts.push(i.toString());
  }
  console.log(`Generated ${receipts.length} numeric receipts\n`);
  
  // Phase 2: Letter prefixed numbers A0001 to Z9999
  console.log("Phase 2: Letter-prefixed receipts (A0001-Z9999)");
  
  for (let charCode = 65; charCode <= 90; charCode++) { // A=65, Z=90
    const letter = String.fromCharCode(charCode);
    console.log(`Generating ${letter} series: ${letter}0001 to ${letter}9999`);
    
    for (let num = 1; num <= 9999; num++) {
      const paddedNum = num.toString().padStart(4, '0');
      receipts.push(`${letter}${paddedNum}`);
    }
  }
  
  console.log(`\nTotal receipts generated: ${receipts.length}`);
  console.log(`Sequence range: ${receipts[0]} to ${receipts[receipts.length - 1]}`);
  
  return receipts;
}

// Generate and display sample receipts
function displaySampleReceipts() {
  const receipts = generateReceiptSequence();
  
  console.log("\n=== SAMPLE RECEIPT NUMBERS ===");
  
  // Show first 10 numeric receipts
  console.log("\nFirst 10 receipts:");
  for (let i = 0; i < 10; i++) {
    console.log(`${i + 1}: ${receipts[i]}`);
  }
  
  // Show last 10 numeric receipts (990-999)
  console.log("\nLast 10 numeric receipts (990-999):");
  for (let i = 990; i < 999; i++) {
    console.log(`${i + 1}: ${receipts[i]}`);
  }
  
  // Show first 10 A series receipts
  console.log("\nFirst 10 A-series receipts:");
  for (let i = 999; i < 1009; i++) {
    console.log(`${i + 1}: ${receipts[i]}`);
  }
  
  // Show last 10 A series receipts
  console.log("\nLast 10 A-series receipts:");
  for (let i = 10997; i < 10998; i++) {
    console.log(`${i + 1}: ${receipts[i]}`);
  }
  
  // Show first 10 B series receipts
  console.log("\nFirst 10 B-series receipts:");
  for (let i = 10998; i < 11008; i++) {
    console.log(`${i + 1}: ${receipts[i]}`);
  }
  
  // Show first 10 Z series receipts
  const zStart = 999 + (25 * 9999); // Position where Z series starts
  console.log("\nFirst 10 Z-series receipts:");
  for (let i = zStart; i < zStart + 10; i++) {
    console.log(`${i + 1}: ${receipts[i]}`);
  }
  
  // Show last 10 receipts (Z9990-Z9999)
  console.log("\nLast 10 receipts (Z9990-Z9999):");
  for (let i = receipts.length - 10; i < receipts.length; i++) {
    console.log(`${i + 1}: ${receipts[i]}`);
  }
  
  console.log("\n=== SEQUENCE BREAKDOWN ===");
  console.log(`Numeric receipts (1-999): 999 receipts`);
  console.log(`Letter series (A-Z, each 0001-9999): 26 × 9999 = ${26 * 9999} receipts`);
  console.log(`Total capacity: ${999 + (26 * 9999)} receipts`);
}

function saveReceiptSequence(filename = 'receipt-sequence.txt') {
  const receipts = generateReceiptSequence();
  
  console.log(`\nSaving complete sequence to ${filename}...`);
  
  let content = "Complete Receipt Number Sequence\n";
  content += "=================================\n\n";
  
  receipts.forEach((receipt, index) => {
    content += `${index + 1}: ${receipt}\n`;
  });
  
  content += `\nTotal receipts: ${receipts.length}\n`;
  content += `Range: ${receipts[0]} to ${receipts[receipts.length - 1]}\n`;
  
  writeFileSync(filename, content);
  console.log(`Sequence saved to ${filename}`);
  
  return receipts;
}

// Run the display function
displaySampleReceipts();

// Uncomment the line below to save the complete sequence to a file
// saveReceiptSequence();

export { generateReceiptSequence, displaySampleReceipts, saveReceiptSequence };