import re
import os

def find_hardcoded_strings(directory):
    patterns = [
        r'>([^<{]+)<',                # Text between tags
        r'placeholder="([^"]+)"',       # Placeholders
        r'label="([^"]+)"',             # Labels
        r'title="([^"]+)"',             # Titles
        r'subtitle="([^"]+)"'           # Subtitles
    ]
    
    results = {}
    
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        
        for file in files:
            if file.endswith('.jsx') or file.endswith('.js'):
                # Skip localization files
                if file in ['en.js', 'ar.js', 'i18n.js']:
                    continue
                    
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                file_results = []
                for pattern in patterns:
                    matches = re.finditer(pattern, content)
                    for match in matches:
                        string = match.group(1).strip()
                        # Basic filtering: skip code-like strings, numbers, etc.
                        if string and len(string) > 1 and not re.match(r'^[0-9{}()[\]\s.,|\-+*/%&!?]+$', string):
                            # Skip strings that look like function calls or variables
                            if '{' in string or '}' in string or 't(' in string:
                                continue
                            file_results.append(string)
                
                if file_results:
                    results[path] = sorted(list(set(file_results)))
    
    return results

if __name__ == "__main__":
    src_dir = 'src'
    findings = find_hardcoded_strings(src_dir)
    
    with open('translation_audit_report.txt', 'w', encoding='utf-8') as f:
        f.write("Translation Audit Report\n")
        f.write("========================\n\n")
        
        for path, strings in findings.items():
            f.write(f"File: {path}\n")
            for s in strings:
                f.write(f"  - {s}\n")
            f.write("\n")
    
    print(f"Audit complete. Results saved to translation_audit_report.txt. Found {len(findings)} files with potential hardcoded strings.")
