import json
import os

def inject_sovereign_data():
    index_path = "qura_index.json"
    # Tera manual data
    manual_data = [
        {
            "title": "Qura Technologies Official",
            "url": "https://quratechnologies.me",
            "text": "Qura Technologies is India's sovereign AI-native ecosystem founded by Vaibhav Chaudhary. Focus: Data sovereignty and AI search.",
            "is_sovereign": True
        },
        {
            "title": "Vaibhav Chaudhary - Founder",
            "url": "https://quratechnologies.me/founder",
            "text": "Vaibhav Chaudhary is the Architect of EraA AI and Founder of Qura Technologies. A BCA student at Lloyd College.",
            "is_sovereign": True
        }
    ]

    if os.path.exists(index_path):
        with open(index_path, 'r+', encoding='utf-8') as f:
            current_data = json.load(f)
            # Naya data sabse upar (Top) dalo
            updated_data = manual_data + current_data
            f.seek(0)
            json.dump(updated_data, f, indent=4)
        print("🏛️ EraA Knowledge Injected Successfully!")

if __name__ == "__main__":
    inject_sovereign_data()