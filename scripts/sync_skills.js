
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE_DIR = path.join(__dirname, '..');
const SKILLS_DIR = path.join(BASE_DIR, 'skills');
const DISABLED_DIR = path.join(SKILLS_DIR, '.disabled');
const INDEX_FILE = path.join(BASE_DIR, 'skills_index.json');
const ARCHIVE_INDEX_FILE = path.join(BASE_DIR, '.skills_index_archived.json');
const CATALOG_FILE = path.join(BASE_DIR, '..', 'CATALOGO_SKILLS.md');

function parseFrontmatter(content) {
    const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!match) return {};
    const fm = {};
    match[1].split('\n').forEach(line => {
        const [key, ...val] = line.split(':');
        if (key && val.length) {
            fm[key.trim()] = val.join(':').trim();
        }
    });
    return fm;
}

function generateIndex(dir, outputFile, isArchived = false) {
    console.log(`🏗️ Generando índice para ${isArchived ? 'archivados' : 'activos'}...`);
    const results = [];
    
    function walk(currentDir) {
        if (!fs.existsSync(currentDir)) return;
        const items = fs.readdirSync(currentDir);
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            if (fs.statSync(fullPath).isDirectory()) {
                if (!isArchived && item === '.disabled') continue;
                if (item.startsWith('.') && item !== '.disabled') continue;
                
                const skillFile = path.join(fullPath, 'SKILL.md');
                if (fs.existsSync(skillFile)) {
                    const content = fs.readFileSync(skillFile, 'utf8');
                    const fm = parseFrontmatter(content);
                    const id = path.basename(fullPath);
                    
                    results.push({
                        id: id,
                        path: path.relative(BASE_DIR, fullPath).replace(/\\/g, '/'),
                        name: fm.name || id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                        description: fm.description || "Sin descripción",
                        risk: fm.risk || "unknown",
                        source: fm.source || "unknown"
                    });
                } else {
                    walk(fullPath);
                }
            }
        }
    }
    
    walk(dir);
    results.sort((a, b) => a.name.localeCompare(b.name));
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log(`✅ Generado índice con ${results.length} skills en: ${path.basename(outputFile)}`);
}

function archiveSkill(name) {
    const source = path.join(SKILLS_DIR, name);
    const target = path.join(DISABLED_DIR, name);
    
    if (!fs.existsSync(source)) {
        console.error(`❌ Error: La skill '${name}' no existe.`);
        return;
    }
    
    if (!fs.existsSync(DISABLED_DIR)) fs.mkdirSync(DISABLED_DIR);
    fs.renameSync(source, target);
    console.log(`📦 Skill '${name}' movida a .disabled/`);
    
    sync();
}

function sync() {
    generateIndex(SKILLS_DIR, INDEX_FILE, false);
    generateIndex(DISABLED_DIR, ARCHIVE_INDEX_FILE, true);
    console.log("\n🚀 Sincronización completa.");
}

const args = process.argv.slice(2);
if (args[0] === 'archive' && args[1]) {
    archiveSkill(args[1]);
} else if (args[0] === 'sync') {
    sync();
} else {
    console.log("Uso: node sync_skills.js [sync | archive NOMBRE]");
}
