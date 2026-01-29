const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '../skills');
const DISABLED_DIR = path.join(__dirname, '../skills/.disabled');
const OUTPUT_FILE = path.join(__dirname, '../../CATALOGO_SKILLS.md');

const CATEGORIES = {
    "🧠 IA, Agentes y LLMs": ["agent", "ai-", "llm", "rag", "prompt", "robot", "cortex", "brain", "memory", "subagent", "notebooklm", "openai", "anthropic", "claude", "gemini"],
    "🛡️ Seguridad y Hacking": ["security", "pentest", "hack", "attack", "vuln", "audit", "red-team", "defense", "shodan", "burp", "owasp", "xss", "injection", "privilege"],
    "💻 Frontend y Web (JS/TS)": ["javascript", "typescript", "react", "next", "node", "web", "front", "tailwind", "ui-", "ux-", "css", "html", "browser", "app-builder"],
    "⚙️ Backend, Arquitectura y Cloud": ["architect", "backend", "api", "microservice", "server", "cloud", "aws", "azure", "gcp", "docker", "k8s", "kubernetes", "terraform", "db-", "sql", "postgres", "supabase", "mongo", "data"],
    "🔧 Herramientas y Productividad": ["git", "plan", "doc", "debug", "test", "workflow", "manage", "product", "startup", "brainstorm", "terminal", "shell", "bash", "linux"],
    "🐍 Python y Data Science": ["python", "data", "ml-", "analyze", "pandas", "numpy"],
    "🎨 Diseño y Creatividad": ["design", "art", "img", "video", "media", "svg", "canvas", "animation", "3d"]
};

function getCategory(name) {
    name = name.toLowerCase();
    for (const [cat, keywords] of Object.entries(CATEGORIES)) {
        if (keywords.some(k => name.includes(k))) return cat;
    }
    return "📂 Otros / General";
}

function getSkillDescription(skillPath) {
    const mdPath = path.join(skillPath, 'SKILL.md');
    if (!fs.existsSync(mdPath)) return "Sin descripción (No se encontró SKILL.md)";
    
    try {
        const content = fs.readFileSync(mdPath, 'utf8');
        // Simple heuristic to retrieve description from frontmatter
        const match = content.match(/^description:\s*(.+)$/m);
        if (match && match[1]) {
            return match[1].trim(); // Return raw English description
        }
    } catch (e) {
        // ignore errors
    }
    return "Descripción no encontrada en frontmatter";
}

function processDirectory(sourceDir, statusLabel) {
    const results = {};
    // Initialize categories
    for (const [cat] of Object.entries(CATEGORIES)) {
        results[cat] = [];
    }
    results["📂 Otros / General"] = [];

    if (!fs.existsSync(sourceDir)) return results;

    const items = fs.readdirSync(sourceDir);
    items.forEach(item => {
        const itemPath = path.join(sourceDir, item);
        if (item.startsWith('.') || !fs.statSync(itemPath).isDirectory()) return;

        const cat = getCategory(item);
        const desc = getSkillDescription(itemPath);
        results[cat].push({ name: item, description: desc });
    });

    return results;
}

function generateMarkdown(enabledMap, disabledMap) {
    let md = "# 📚 Catálogo Completo de Skills (Detallado)\n\n";
    md += "Este documento lista los skills habilitados y deshabilitados, organizados por categoría.\n\n";
    md += "> **Nota**: Las descripciones de los skills se extraen automáticamente y están en su idioma original (Inglés).\n\n";

    // --- ENABLED SKILLS ---
    md += "# ✅ Skills Habilitados (Activos)\n\n";
    let totalEnabled = 0;

    for (const [cat, items] of Object.entries(enabledMap)) {
        if (items.length === 0) continue;
        totalEnabled += items.length;
        md += `## ${cat} (${items.length})\n`;
        items.sort((a, b) => a.name.localeCompare(b.name)).forEach(skill => {
            md += `- **${skill.name}**: ${skill.description}\n`;
        });
        md += "\n";
    }

    // --- DISABLED SKILLS ---
    md += "# 🚫 Skills Deshabilitados (Archivados)\n\n";
    let totalDisabled = 0;

    for (const [cat, items] of Object.entries(disabledMap)) {
        if (items.length === 0) continue;
        totalDisabled += items.length;
        md += `## ${cat} (${items.length})\n`;
        items.sort((a, b) => a.name.localeCompare(b.name)).forEach(skill => {
            md += `- **${skill.name}**: ${skill.description}\n`;
        });
        md += "\n";
    }
    
    md = md.replace("(Detallado)", `(Total: ${totalEnabled + totalDisabled} | Activos: ${totalEnabled} | Archivados: ${totalDisabled})`);

    fs.writeFileSync(OUTPUT_FILE, md);
    console.log(`Catalog generated at ${OUTPUT_FILE}`);
}

function main() {
    console.log("Generating catalog with descriptions...");
    const enabledSkills = processDirectory(SKILLS_DIR, "Activo");
    const disabledSkills = processDirectory(DISABLED_DIR, "Inactivo");

    generateMarkdown(enabledSkills, disabledSkills);
}

main();
