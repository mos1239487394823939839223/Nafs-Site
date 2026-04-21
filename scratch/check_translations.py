import re
import json
import os

def parse_js_object(content):
    # Remove 'export default' or 'module.exports ='
    content = re.sub(r'export default\s+', '', content)
    content = re.sub(r'module\.exports\s*=\s*', '', content)
    # Remove comments
    content = re.sub(r'//.*', '', content)
    # This is a very rough parser for JS objects to JSON-like DICT
    # In a real scenario, we'd use a JS parser, but for these simple i18n files, regex might work.
    # Actually, it's better to just treat it as a string and look for keys.
    return content

def get_keys(content):
    # Find all keys in the format key: "value" or key: {
    keys = re.findall(r'(\w+):\s*["\'{]', content)
    return set(keys)

def get_nested_keys(data, prefix=''):
    keys = []
    if isinstance(data, dict):
        for k, v in data.items():
            full_key = f"{prefix}.{k}" if prefix else k
            keys.append(full_key)
            keys.extend(get_nested_keys(v, full_key))
    return keys

# Since I can't easily execute JS, I'll try to find keys using regex on the raw text
# To be safer, I'll just look for keys that are in EN but not in AR.

with open('src/i18n/en.js', 'r', encoding='utf-8') as f:
    en_content = f.read()

with open('src/i18n/ar.js', 'r', encoding='utf-8') as f:
    ar_content = f.read()

en_keys = re.findall(r'(\s*)(\w+):\s*["\']', en_content)
ar_keys = re.findall(r'(\s*)(\w+):\s*["\']', ar_content)

en_key_set = set([k[1] for k in en_keys])
ar_key_set = set([k[1] for k in ar_keys])

missing_in_ar = en_key_set - ar_key_set
print(f"Missing in AR: {missing_in_ar}")
