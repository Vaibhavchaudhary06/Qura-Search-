import json
import os
from collections import defaultdict

def process_item(item, inverted_index):
    """Keywords nikalne ka standard logic"""
    url = item.get('url', '#')
    # Title aur Text dono se keywords nikalna
    content = (str(item.get('title', '')) + " " + str(item.get('text', ''))).lower()
    # Cleaning: Sirf kaam ke words uthao
    for word in set(content.split()):
        if len(word) > 3 and word.isalnum():
            inverted_index[word].append(url)

def create_unified_index():
    crawler_dir = "../crawler/"
    # --- SARE VAULTS KI LIST ---
    json_file = os.path.join(crawler_dir, "qura_index.json")
    jsonl_file = os.path.join(crawler_dir, "qura_index.jsonl")
    news_file = os.path.join(crawler_dir, "news_index.jsonl") # NAYI FILE 🚀
    
    index_output_path = "keyword_map.json"
    inverted_index = defaultdict(list)
    total_scanned = 0

    # 1. Purani .json Scan karo
    if os.path.exists(json_file):
        print("📁 Scanning old .json vault...")
        with open(json_file, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                for item in data:
                    process_item(item, inverted_index)
                    total_scanned += 1
            except Exception as e: print(f"⚠️ Error: {e}")

    # 2. Nayi .jsonl Scan karo
    if os.path.exists(jsonl_file):
        print("🚀 Scanning new .jsonl vault...")
        with open(jsonl_file, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    process_item(json.loads(line), inverted_index)
                    total_scanned += 1
                except: continue

    # 3. Nayi NEWS .jsonl Scan karo 🛰️
    if os.path.exists(news_file):
        print("📰 Scanning News vault...")
        with open(news_file, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    process_item(json.loads(line), inverted_index)
                    total_scanned += 1
                except: continue

    # 4. UNIFIED MAP SAVE KARO
    print(f"💾 Saving unified map to {index_output_path}...")
    with open(index_output_path, 'w', encoding='utf-8') as f:
        json.dump(inverted_index, f, ensure_ascii=False)
        
    print(f"✅ Mission Success! Total Pages Indexed: {total_scanned}")
    print(f"✅ Total Unique Keywords in Qura Brain: {len(inverted_index)}")

if __name__ == "__main__":
    create_unified_index()