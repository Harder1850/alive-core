/**
 * ALIVE Knowledge Stack Converter
 * 
 * Converts .docx knowledge files to queryable JSON format.
 * 
 * Input:  .docx files organized by stack
 * Output: JSON index + chunked content for fast queries
 * 
 * Usage: node convert.js <input_dir> <output_dir>
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, basename, extname } from 'path';
import { createHash } from 'crypto';

// Stack definitions
const STACKS = {
  science: {
    name: 'Science & Technology',
    keywords: ['physics', 'engineering', 'robotics', 'health', 'chemistry', 'biology', 'math', 'technology']
  },
  governance: {
    name: 'Governance & Society',
    keywords: ['law', 'economics', 'geography', 'institutions', 'politics', 'government', 'policy']
  },
  language: {
    name: 'Language & Communication',
    keywords: ['vocabulary', 'documents', 'grammar', 'writing', 'speech', 'translation']
  },
  cognition: {
    name: 'Cognition & Ethics',
    keywords: ['thinking', 'learning', 'creativity', 'values', 'ethics', 'reasoning', 'decision']
  },
  aesthetics: {
    name: 'Aesthetics & Belief',
    keywords: ['art', 'religion', 'culture', 'education', 'music', 'philosophy', 'beauty']
  }
};

// Chunk size for content splitting
const CHUNK_SIZE = 1000; // characters
const CHUNK_OVERLAP = 100; // overlap between chunks

/**
 * Main converter
 */
export async function convert(inputDir, outputDir) {
  console.log(`[Converter] Input: ${inputDir}`);
  console.log(`[Converter] Output: ${outputDir}`);

  // Create output directories
  for (const stack of Object.keys(STACKS)) {
    await mkdir(join(outputDir, stack), { recursive: true });
  }

  // Find all .docx files
  const files = await findDocxFiles(inputDir);
  console.log(`[Converter] Found ${files.length} .docx files`);

  // Process each file
  const results = {
    processed: 0,
    failed: 0,
    byStack: {}
  };

  for (const file of files) {
    try {
      const result = await processFile(file, outputDir);
      results.processed++;
      results.byStack[result.stack] = (results.byStack[result.stack] || 0) + 1;
      console.log(`[Converter] ✓ ${basename(file)} → ${result.stack}`);
    } catch (err) {
      results.failed++;
      console.error(`[Converter] ✗ ${basename(file)}: ${err.message}`);
    }
  }

  // Build indexes for each stack
  console.log('[Converter] Building indexes...');
  for (const stack of Object.keys(STACKS)) {
    await buildIndex(join(outputDir, stack));
  }

  // Summary
  console.log('\n[Converter] Complete!');
  console.log(`  Processed: ${results.processed}`);
  console.log(`  Failed: ${results.failed}`);
  console.log('  By stack:');
  for (const [stack, count] of Object.entries(results.byStack)) {
    console.log(`    ${stack}: ${count}`);
  }

  return results;
}

/**
 * Find all .docx files recursively
 */
async function findDocxFiles(dir) {
  const files = [];
  
  async function scan(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        await scan(fullPath);
      } else if (entry.isFile() && extname(entry.name).toLowerCase() === '.docx') {
        files.push(fullPath);
      }
    }
  }
  
  await scan(dir);
  return files;
}

/**
 * Process single .docx file
 */
async function processFile(filePath, outputDir) {
  // Read and extract text from docx
  const text = await extractDocxText(filePath);
  
  // Classify into stack
  const stack = classifyStack(text, basename(filePath));
  
  // Generate document ID
  const docId = generateDocId(filePath);
  
  // Split into chunks
  const chunks = chunkText(text);
  
  // Create document record
  const document = {
    id: docId,
    source: basename(filePath),
    stack: stack,
    title: extractTitle(text) || basename(filePath, '.docx'),
    chunkCount: chunks.length,
    totalLength: text.length,
    created: new Date().toISOString(),
    keywords: extractKeywords(text)
  };
  
  // Save document metadata
  await writeFile(
    join(outputDir, stack, `${docId}.meta.json`),
    JSON.stringify(document, null, 2)
  );
  
  // Save chunks
  await writeFile(
    join(outputDir, stack, `${docId}.chunks.json`),
    JSON.stringify(chunks.map((content, i) => ({
      id: `${docId}_${i}`,
      docId,
      index: i,
      content,
      length: content.length
    })), null, 2)
  );
  
  return { stack, docId, chunks: chunks.length };
}

/**
 * Extract text from .docx file
 * Uses simple XML parsing (docx is a zip of XML files)
 */
async function extractDocxText(filePath) {
  const AdmZip = await importAdmZip();
  
  const zip = new AdmZip(filePath);
  const documentXml = zip.readAsText('word/document.xml');
  
  if (!documentXml) {
    throw new Error('No document.xml found in docx');
  }
  
  // Simple XML text extraction (no dependencies)
  // Extract text between <w:t> tags
  const textMatches = documentXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
  const text = textMatches
    .map(match => match.replace(/<[^>]+>/g, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (!text) {
    throw new Error('No text content found');
  }
  
  return text;
}

/**
 * Dynamic import for adm-zip (optional dependency)
 */
async function importAdmZip() {
  try {
    const module = await import('adm-zip');
    return module.default;
  } catch (err) {
    throw new Error('adm-zip not installed. Run: npm install adm-zip');
  }
}

/**
 * Classify text into knowledge stack
 */
function classifyStack(text, filename) {
  const lowerText = (text + ' ' + filename).toLowerCase();
  const scores = {};
  
  for (const [stack, config] of Object.entries(STACKS)) {
    scores[stack] = 0;
    for (const keyword of config.keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = lowerText.match(regex);
      scores[stack] += matches ? matches.length : 0;
    }
  }
  
  // Find highest score
  let maxStack = 'cognition'; // default
  let maxScore = 0;
  
  for (const [stack, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxStack = stack;
    }
  }
  
  return maxStack;
}

/**
 * Generate document ID from path
 */
function generateDocId(filePath) {
  const hash = createHash('sha256')
    .update(filePath)
    .digest('hex')
    .substring(0, 12);
  return `doc_${hash}`;
}

/**
 * Split text into overlapping chunks
 */
function chunkText(text) {
  const chunks = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    
    // Try to break at sentence boundary
    let chunkEnd = end;
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end);
      const lastQuestion = text.lastIndexOf('?', end);
      const lastExclaim = text.lastIndexOf('!', end);
      const bestBreak = Math.max(lastPeriod, lastQuestion, lastExclaim);
      
      if (bestBreak > start + CHUNK_SIZE / 2) {
        chunkEnd = bestBreak + 1;
      }
    }
    
    chunks.push(text.substring(start, chunkEnd).trim());
    start = chunkEnd - CHUNK_OVERLAP;
    
    if (start < 0) start = 0;
    if (chunkEnd >= text.length) break;
  }
  
  return chunks.filter(c => c.length > 0);
}

/**
 * Extract title from text (first line or heading)
 */
function extractTitle(text) {
  const firstLine = text.split(/[.\n]/)[0];
  if (firstLine && firstLine.length < 100) {
    return firstLine.trim();
  }
  return null;
}

/**
 * Extract keywords from text
 */
function extractKeywords(text) {
  // Simple keyword extraction: most frequent meaningful words
  const words = text.toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 4); // skip short words
  
  const stopwords = new Set([
    'about', 'above', 'after', 'again', 'against', 'which', 'while',
    'there', 'their', 'these', 'those', 'being', 'would', 'could',
    'should', 'because', 'through', 'during', 'before', 'between'
  ]);
  
  const counts = {};
  for (const word of words) {
    if (!stopwords.has(word)) {
      counts[word] = (counts[word] || 0) + 1;
    }
  }
  
  // Top 10 keywords
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Build search index for a stack
 */
async function buildIndex(stackDir) {
  const entries = await readdir(stackDir);
  const metaFiles = entries.filter(f => f.endsWith('.meta.json'));
  
  const index = {
    stack: basename(stackDir),
    documentCount: metaFiles.length,
    documents: [],
    keywords: {},
    built: new Date().toISOString()
  };
  
  for (const metaFile of metaFiles) {
    const meta = JSON.parse(await readFile(join(stackDir, metaFile), 'utf8'));
    
    index.documents.push({
      id: meta.id,
      title: meta.title,
      source: meta.source,
      chunkCount: meta.chunkCount
    });
    
    // Build keyword index
    for (const keyword of meta.keywords || []) {
      if (!index.keywords[keyword]) {
        index.keywords[keyword] = [];
      }
      index.keywords[keyword].push(meta.id);
    }
  }
  
  await writeFile(
    join(stackDir, 'index.json'),
    JSON.stringify(index, null, 2)
  );
  
  console.log(`[Converter] Index: ${basename(stackDir)} (${metaFiles.length} docs)`);
}

// CLI entry point
const args = process.argv.slice(2);
if (args.length >= 2) {
  convert(args[0], args[1]).catch(err => {
    console.error(`[Converter] Fatal: ${err.message}`);
    process.exit(1);
  });
} else if (args.includes('--help') || args.includes('-h')) {
  console.log(`
ALIVE Knowledge Stack Converter

Usage: node convert.js <input_dir> <output_dir>

Arguments:
  input_dir   Directory containing .docx files (searched recursively)
  output_dir  Directory to write converted knowledge stacks

Output structure:
  output_dir/
  ├── science/
  │   ├── index.json
  │   ├── doc_xxx.meta.json
  │   └── doc_xxx.chunks.json
  ├── governance/
  ├── language/
  ├── cognition/
  └── aesthetics/

Dependencies:
  npm install adm-zip
`);
}

export default { convert, STACKS };
