import json

lines = open("/Users/kayenatfatmi/.gemini/antigravity-ide/brain/cf1ea344-4249-496d-993e-852f3bbb49e6/.system_generated/logs/transcript.jsonl").read().splitlines()

last_full_file = None

for i, line in enumerate(lines):
    try:
        data = json.loads(line)
        if data.get("type") == "RUN_COMMAND" and "File Path:" in data.get("content", "") and "Dashboard.tsx" in data.get("content", ""):
            # Let's check if it says "Total Lines:" and "Showing lines"
            if "Showing lines 1 to" in data["content"] and "The above content shows the entire, complete file contents" in data["content"]:
                last_full_file = data["content"]
            elif "The above content does NOT show the entire file" not in data["content"]:
                # Maybe it showed the whole file
                last_full_file = data["content"]
    except:
        pass

if last_full_file:
    with open("extracted_dashboard.tsx", "w") as f:
        # Extract just the code parts
        # The format is: <line_number>: <code line>
        code_lines = []
        for line in last_full_file.splitlines():
            if ":" in line:
                parts = line.split(":", 1)
                if parts[0].isdigit():
                    # It's a code line
                    # Usually it's `<line_number>: <original_line>`
                    code_lines.append(parts[1][1:]) # strip the leading space
        f.write("\n".join(code_lines))
    print("Found a full file! Saved to extracted_dashboard.tsx")
else:
    print("No full file view found.")
    
# Let's also check if the LLM used `write_to_file` on Dashboard.tsx anywhere near the end.
for i, line in enumerate(lines):
    try:
        data = json.loads(line)
        if data.get("type") == "PLANNER_RESPONSE" and "tool_calls" in data:
            for call in data["tool_calls"]:
                if call["name"] == "write_to_file" and call["args"]["TargetFile"].endswith("Dashboard.tsx"):
                    print(f"Step {data['step_index']}: write_to_file on Dashboard.tsx")
                    with open("extracted_dashboard_write.tsx", "w") as f:
                        f.write(call["args"]["CodeContent"])
    except:
        pass
