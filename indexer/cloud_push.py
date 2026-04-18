import json
import os
from supabase import create_client

# 🔑 TERA CLOUD CONFIG (Video se jo tune nikala)
SUPABASE_URL = "https://effjuhnplpoavblbkozs.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZmp1aG5wbHBvYXZibGJrb3pzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjUyNzE5OCwiZXhwIjoyMDkyMTAzMTk4fQ.lCL9t6EknMWM0WW8Vhk-O9_hhyX66YDAmyVOJG55xKw" # Jo 'sb_secret_...' wali copy ki thi

# Supabase Client Initialize karo
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def push_to_cloud(file_path, data_type):
    if not os.path.exists(file_path):
        print(f"❌ File missing: {file_path}")
        return

    print(f"\n📡 {data_type.upper()} data syncing to Qura Cloud Vault...")
    count = 0
    errors = 0
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                item = json.loads(line)
                
                # Payload matching with your table: url, title, content, type, priority
                payload = {
                    "url": item.get('url'),
                    "title": item.get('title', 'No Title'),
                    "content": item.get('text', ''), # 'text' field ko 'content' column mein bhej rahe hain
                    "type": data_type,
                    "priority": item.get('priority', 4)
                }
                
                # UPSERT: Duplicate URL hoga toh data update ho jayega, naya hoga toh insert
                supabase.table('search_index').upsert(payload).execute()
                
                count += 1
                if count % 20 == 0:
                    print(f"✅ Indexed {count} pages so far...")
                    
            except Exception as e:
                errors += 1
                continue

    print(f"\n🎉 {data_type.upper()} Sync Complete!")
    print(f"📊 Total Success: {count} | Errors: {errors}")

if __name__ == "__main__":
    # --- Pehle Qura Index (General) ---
    push_to_cloud("../crawler/qura_index.jsonl", "general")
    push_to_cloud("../crawler/qura_index.json", "old general")
    # --- Phir News Index ---
    push_to_cloud("../crawler/news_index.jsonl", "news")