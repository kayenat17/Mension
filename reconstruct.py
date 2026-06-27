import json

lines = open("/Users/kayenatfatmi/.gemini/antigravity-ide/brain/cf1ea344-4249-496d-993e-852f3bbb49e6/.system_generated/logs/transcript.jsonl").read().splitlines()

for line in lines:
    try:
        data = json.loads(line)
        if data.get("type") == "PLANNER_RESPONSE" and "tool_calls" in data:
            for call in data["tool_calls"]:
                if call["name"] in ["replace_file_content", "multi_replace_file_content", "write_to_file"] and "Dashboard.tsx" in str(call["args"]):
                    print(f"Step {data['step_index']}: {call['name']}")
    except Exception as e:
        pass
