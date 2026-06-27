import json

lines = open("/Users/kayenatfatmi/.gemini/antigravity-ide/brain/cf1ea344-4249-496d-993e-852f3bbb49e6/.system_generated/logs/transcript.jsonl").read().splitlines()

for i, line in enumerate(lines):
    try:
        data = json.loads(line)
        if data.get("source") == "MODEL" and data.get("type") == "VIEW_FILE" and data.get("step_index") == 121:
            # The next line might be the SYSTEM response with the file content
            next_line = json.loads(lines[i+1])
            if next_line.get("source") == "SYSTEM":
                print("FOUND step 122")
                # Wait, step 121 is CODE_ACTION, maybe step 120 is PLANNER_RESPONSE with the tool call
                pass
    except:
        pass

# Let's just find the last view_file response before step 124
last_content = ""
for line in lines:
    try:
        data = json.loads(line)
        if data.get("step_index", 0) > 124:
            break
        if data.get("type") == "RUN_COMMAND" and "File Path:" in data.get("content", ""):
            last_content = data["content"]
        if data.get("type") == "TOOL_RESPONSE" or data.get("type") == "ACTION_RESPONSE":
            pass # look for view_file output
    except:
        pass

# The best way is to extract all view_file outputs before step 124
import re
with open("transcript_dump.txt", "w") as f:
    for line in lines:
        try:
            d = json.loads(line)
            if d.get("step_index", 0) < 125:
                if d.get("source") == "SYSTEM" and "Showing lines" in d.get("content", ""):
                    f.write(f"--- STEP {d['step_index']} ---\n")
                    f.write(d["content"] + "\n")
        except:
            pass
