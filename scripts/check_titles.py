import re

with open('constants/initialQuestions.ts', 'r', encoding='utf-8') as f:
    text = f.read()

q_matches = re.findall(r'\{\s*"id":\s*"(q-\d+)",\s*"no":\s*(\d+),\s*"section":\s*"(SEC-\d+)",\s*"title":\s*"([^"]+)"', text)
print(f"Total Questions parsed: {len(q_matches)}")
for qid, no, sec, title in q_matches[:10]:
    print(f"[{sec}] No.{no} ({qid}): {title}")
