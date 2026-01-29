const fs = require("fs");
const path = require("path");

// Setup paths
const SKILLS_DIR = path.join(__dirname, "../skills");
const DISABLED_DIR = path.join(__dirname, "../skills/.disabled");

// Ensure disabled directory exists
if (!fs.existsSync(DISABLED_DIR)) {
  try {
    fs.mkdirSync(DISABLED_DIR, { recursive: true });
  } catch (e) {
    console.error("Error creating disabled directory:", e);
    process.exit(1);
  }
}

// 1. ALWAYS KEEP these priorities (Keyword in name saves it)
const KEEP_KEYWORDS = [
  // Core User Stack
  "javascript",
  "js-",
  "-js",
  "typescript",
  "ts-",
  "node",
  "react",
  "next",
  "python",
  // Agents & AI
  "agent",
  "ai-",
  "llm",
  "rag-",
  "prompt",
  "robot",
  "bot-",
  "chat",
  "voice",
  "vision",
  "cortex",
  "brain",
  "memory",
  // Security (Explicitly requested)
  "security",
  "pentest",
  "hack",
  "attack",
  "vuln",
  "audit",
  "red-team",
  "defense",
  "shodan",
  "burp",
  "owasp",
  "xss",
  "injection",
  // Architecture & DB
  "architect",
  "design",
  "pattern",
  "clean",
  "refactor",
  "database",
  "db-",
  "sql",
  "postgres",
  "supabase",
  "mongo",
  "data",
  // General Productivity
  "git",
  "plan",
  "doc",
  "spec",
  "debug",
  "test",
  "review",
  "workflow",
  "manage",
  "product",
  "startup",
  "brainstorm",
  // Tools
  "docker",
  "k8s",
  "kubernetes",
  "terraform",
  "linux",
  "bash",
  "shell",
  "powershell",
  "windows",
  "terminal",
];

// 2. EXPLICITLY REMOVE these (unless saved above)
const REMOVE_KEYWORDS = [
  // Languages
  "ruby",
  "php",
  "java-",
  "javax",
  "c-pro",
  "cpp-",
  "cplusplus",
  "csharp",
  "dotnet",
  "fsharp",
  "scala",
  "haskell",
  "elixir",
  "julia",
  "swift",
  "kotlin",
  "dart",
  "ocaml",
  "r-pro",
  "matlab",
  "rust",
  "golang",
  "go-",
  "perl",
  "lua",
  "assembly",
  "fortran",
  // Mobile
  "android",
  "ios-",
  "flutter",
  "xamarin",
  "ionic",
  // Game Dev
  "unity",
  "unreal",
  "godot",
  "game",
  "minecraft",
  "glsl",
  "shader",
  // Platforms/Enterprise
  "salesforce",
  "sap",
  "oracle",
  "shopify",
  "wordpress",
  "moodle",
  "drupal",
  "magento",
  "joomla",
  "angular",
  "vue",
  "svelte",
  "ember",
  "backbone",
  "jquery",
  // Crypto
  "blockchain",
  "web3",
  "nft",
  "solidity",
  "crypto",
  "defi",
  "smart-contract",
  "ethereum",
];

function isKept(name) {
  name = name.toLowerCase();
  return KEEP_KEYWORDS.some((kw) => name.includes(kw));
}

function isRemoved(name) {
  name = name.toLowerCase();
  return REMOVE_KEYWORDS.some((kw) => name.includes(kw));
}

function main() {
  console.log(`Scanning ${SKILLS_DIR}...`);
  let movedCount = 0;
  let keptCount = 0;

  if (!fs.existsSync(SKILLS_DIR)) {
    console.error(`Error: ${SKILLS_DIR} does not exist`);
    return;
  }

  const items = fs.readdirSync(SKILLS_DIR);

  for (const item of items) {
    const itemPath = path.join(SKILLS_DIR, item);

    // Skip files and hidden directories
    if (item.startsWith(".")) continue;
    try {
      if (!fs.statSync(itemPath).isDirectory()) continue;
    } catch (e) {
      console.warn(`Could not stat ${item}: ${e.message}`);
      continue;
    }

    if (isKept(item)) {
      keptCount++;
      continue;
    }

    if (isRemoved(item)) {
      console.log(`Disabling: ${item}`);
      const targetPath = path.join(DISABLED_DIR, item);

      try {
        if (fs.existsSync(targetPath)) {
          console.log(
            `  Warning: Target ${targetPath} already exists. Skipping.`,
          );
        } else {
          fs.renameSync(itemPath, targetPath);
          movedCount++;
        }
      } catch (e) {
        console.error(`  Error moving ${item}: ${e.message}`);
      }
    } else {
      // Did not match Keep OR Remove -> Keep by default
      keptCount++;
    }
  }

  console.log("-".repeat(30));
  console.log("Summary:");
  console.log(`Disabled: ${movedCount} skills`);
  console.log(`Kept:     ${keptCount} skills`);
  console.log("-".repeat(30));
}

main();
