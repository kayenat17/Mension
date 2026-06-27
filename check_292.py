import json

lines = open("/Users/kayenatfatmi/.gemini/antigravity-ide/brain/cf1ea344-4249-496d-993e-852f3bbb49e6/.system_generated/logs/transcript.jsonl").read().splitlines()

for line in lines:
    try:
        data = json.loads(line)
        if data.get("type") == "PLANNER_RESPONSE" and "tool_calls" in data:
            for call in data["tool_calls"]:
                if call["name"] == "write_to_file" and data.get("step_index") in [286, 292]:
                    print(f"Step {data['step_index']}: {call['args']['TargetFile']}")
                    if data['step_index'] == 292:
                        content = call['args']['CodeContent']
                        if "<truncated" in content:
                            print("Step 292 contains truncation hallucination!")
                        else:
                            print(f"Step 292 content length: {len(content)}")
    except Exception as e:
        pass
