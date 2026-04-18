import os
import shutil
import time
import subprocess
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s - QuraCloud - %(message)s')
logger = logging.getLogger("Backup")

class QuraBackup:
    def __init__(self):
        # SARE IMPORTANT FILES KI LIST 🚀
        self.files_to_sync = ["qura_index.json", "qura_index.jsonl", "links_to_crawl.txt"]
        self.backup_folder = "backups"
        
        if not os.path.exists(self.backup_folder):
            os.makedirs(self.backup_folder)

    def git_push(self):
        """Cloud par data bhejne ka asali logic"""
        try:
            subprocess.run(["git", "add", "."], check=True)
            # Commit message me files ki info
            commit_msg = f"Vault Update: {datetime.now().strftime('%Y-%m-%d %H:%M')}"
            subprocess.run(["git", "commit", "-m", commit_msg], check=True)
            subprocess.run(["git", "push"], check=True)
            logger.info("☁️ Cloud Sync Complete: Data is safe on GitHub!")
        except Exception as e:
            logger.warning("⚠️ Git Push failed. Make sure repo is initialized.")

    def run_forever(self):
        logger.info("🚀 Qura Backup & Cloud Manager Active (Tracking JSON + JSONL).")
        while True:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # Har file ke liye backup process
            for file in self.files_to_sync:
                if os.path.exists(file):
                    ext = os.path.splitext(file)[1]
                    name = os.path.splitext(file)[0]
                    # Local copy: backups/qura_index_20260417_0329.jsonl
                    dest = f"{self.backup_folder}/{name}_{timestamp}{ext}"
                    shutil.copy2(file, dest)
                    logger.info(f"📦 Local Backup Created: {file}")

            # 2. Cloud par push karo
            self.git_push()
            
            # Har 1 ghante me sync (3600 seconds)
            time.sleep(3600)

if __name__ == "__main__":
    manager = QuraBackup()
    manager.run_forever()