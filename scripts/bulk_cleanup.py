import os
import shutil
from pathlib import Path

# Setup paths
SKILLS_DIR = Path(r"c:\dev\antigravity-awasome-skills\.agent\skills\skills")
DISABLED_DIR = SKILLS_DIR.parents[0] / "skills/.disabled"

# Ensure disabled directory exists
if not DISABLED_DIR.exists():
    DISABLED_DIR.mkdir(parents=True)

# 1. ALWAYS KEEP these priorities (Keyword in name saves it)
# User: "Agentes, Next.js, Arquitectura, Seguridad, JavaScript/TypeScript, Python"
KEEP_KEYWORDS = [
    # Core User Stack
    "javascript", "js-", "-js", "typescript", "ts-", "node", "react", "next", "python",
    # Agents & AI
    "agent", "ai-", "llm", "rag-", "prompt", "robot", "bot-", "chat", "voice", "vision", "cortex", "brain", "memory",
    # Security (Explicitly requested)
    "security", "pentest", "hack", "attack", "vuln", "audit", "red-team", "defense", "shodan", "burp", "owasp", "xss", "injection",
    # Architecture & DB
    "architect", "design", "pattern", "clean", "refactor", "database", "db-", "sql", "postgres", "supabase", "mongo", "data",
    # General Productivity
    "git", "plan", "doc", "spec", "debug", "test", "review", "workflow", "manage", "product", "startup", "brainstorm",
    # Tools User might use
    "docker", "k8s", "kubernetes", "terraform", "linux", "bash", "shell", "powershell", "windows", "terminal"
]

# 2. EXPLICITLY REMOVE these (unless saved above)
# User: "Ruby, PHP, Java, C#, Unity" + others to reduce noise
REMOVE_KEYWORDS = [
    # Languages
    "ruby", "php", "java-", "javax", "c-pro", "cpp-", "cplusplus", "csharp", "dotnet", "fsharp",
    "scala", "haskell", "elixir", "julia", "swift", "kotlin", "dart", "ocaml", "r-pro", "matlab",
    "rust", "golang", "go-", # Assuming not needed unless specifically requested (Python/JS is main)
    "perl", "lua", "assembly", "fortran",
    # Mobile (Native)
    "android", "ios-", "flutter", "xamarin", "ionic", 
    # Game Dev
    "unity", "unreal", "godot", "game", "minecraft", "glsl", "shader",
    # Platforms/CMS/Enterprise
    "salesforce", "sap", "oracle", "shopify", "wordpress", "moodle", "drupal", "magento", "joomla",
    "angular", "vue", "svelte", "ember", "backbone", "jquery",
    # Crypto
    "blockchain", "web3", "nft", "solidity", "crypto", "defi", "smart-contract", "ethereum",
    # Specific Cloud (if not generic) - Keeping these is usually okay, but user has supabase. 
    # I'll be aggressive with obscure ones, but maybe keep AWS/Azure/GCP general skills just in case.
    # "aws", "azure", "gcp" -> I will NOT put them in REMOVE list, so they stay by default (Safety net)
]

def is_kept(name):
    for kw in KEEP_KEYWORDS:
        if kw in name:
            return True
    return False

def is_removed(name):
    for kw in REMOVE_KEYWORDS:
        if kw in name:
            return True
    return False

def main():
    print(f"Scanning {SKILLS_DIR}...")
    moved_count = 0
    kept_count = 0
    
    if not SKILLS_DIR.exists():
        print(f"Error: {SKILLS_DIR} does not exist")
        return

    for item in os.listdir(SKILLS_DIR):
        item_path = SKILLS_DIR / item
        if not item_path.is_dir():
            continue
        if item.startswith('.'):
            continue
            
        name = item.lower()
        
        # Logic: 
        # 1. If it matches KEEP keywords -> KEEP
        # 2. If it matches REMOVE keywords -> REMOVE
        # 3. Else -> KEEP (Default safe)
        
        if is_kept(name):
            kept_count += 1
            # print(f"Keeping: {item}")
            continue
            
        if is_removed(name):
            print(f"Disabling: {item}")
            target = DISABLED_DIR / item
            
            # Move it
            try:
                if target.exists():
                    print(f"  Warning: Target {target} already exists. Skipping.")
                else:
                    shutil.move(str(item_path), str(target))
                    moved_count += 1
            except Exception as e:
                print(f"  Error moving {item}: {e}")
        else:
            kept_count += 1
            # print(f"Keeping (Default): {item}")

    print("-" * 30)
    print(f"Summary:")
    print(f"Disabled: {moved_count} skills")
    print(f"Kept:     {kept_count} skills")
    print("-" * 30)
    print("To undo, use: python scripts/restore_all.py (you'd need to create it) or use skills_manager.py enable <name>")

if __name__ == "__main__":
    main()
