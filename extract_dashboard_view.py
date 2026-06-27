import json

lines = open("/Users/kayenatfatmi/.gemini/antigravity-ide/brain/cf1ea344-4249-496d-993e-852f3bbb49e6/.system_generated/logs/transcript.jsonl").read().splitlines()

for i, line in enumerate(lines):
    try:
        data = json.loads(line)
        content = data.get("content", "")
        if "File Path:" in content and "Dashboard.tsx" in content:
            # Print the summary of the view_file
            summary = "\n".join(content.splitlines()[:10])
            print(f"Step {data.get('step_index')}:\n{summary}\n---")
            
            if "Showing lines 1 to 779" in content or "The above content shows the entire, complete file contents" in content:
                with open(f"extracted_dashboard_{data.get('step_index')}.tsx", "w") as f:
                    f.write(content)
    except:
        pass
