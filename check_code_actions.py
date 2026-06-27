import json

lines = open("/Users/kayenatfatmi/.gemini/antigravity-ide/brain/cf1ea344-4249-496d-993e-852f3bbb49e6/.system_generated/logs/transcript.jsonl").read().splitlines()

for i, line in enumerate(lines):
    try:
        data = json.loads(line)
        if data.get("type") == "CODE_ACTION":
            print(f"--- STEP {data.get('step_index')} CODE_ACTION ---")
            print("Content:")
            print(data.get("content")[:500])
            print("...")
            
            # Check the system response immediately after
            next_line = json.loads(lines[i+1])
            if next_line.get("source") == "SYSTEM":
                print(f"System Response:")
                print(next_line.get("content")[:500])
                print("...")
    except:
        pass
