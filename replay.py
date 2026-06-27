import json

lines = open("/Users/kayenatfatmi/.gemini/antigravity-ide/brain/cf1ea344-4249-496d-993e-852f3bbb49e6/.system_generated/logs/transcript.jsonl").read().splitlines()

content = open("Dashboard_reconstructed.tsx").read().splitlines(keepends=True)

patches = []
for line in lines:
    try:
        data = json.loads(line)
        if data.get("type") == "PLANNER_RESPONSE" and "tool_calls" in data:
            for call in data["tool_calls"]:
                name = call["name"]
                if name in ["replace_file_content", "multi_replace_file_content"]:
                    args = call["args"]
                    if "Dashboard.tsx" in args.get("TargetFile", ""):
                        if data["step_index"] > 600:
                            continue
                        
                        if name == "replace_file_content":
                            patches.append({
                                "step": data["step_index"],
                                "chunks": [{
                                    "start": int(args["StartLine"]),
                                    "end": int(args["EndLine"]),
                                    "rep": args["ReplacementContent"]
                                }]
                            })
                        elif name == "multi_replace_file_content":
                            chunks = []
                            for chunk in args["ReplacementChunks"]:
                                chunks.append({
                                    "start": int(chunk["StartLine"]),
                                    "end": int(chunk["EndLine"]),
                                    "rep": chunk["ReplacementContent"]
                                })
                            # Sort chunks in reverse order to apply from bottom to top
                            chunks.sort(key=lambda x: x["start"], reverse=True)
                            patches.append({
                                "step": data["step_index"],
                                "chunks": chunks
                            })
    except Exception as e:
        pass

patches.sort(key=lambda x: x["step"])

for p in patches:
    print(f"Applying patch from step {p['step']}")
    for chunk in p["chunks"]:
        start = chunk["start"] - 1
        end = chunk["end"]
        rep = chunk["rep"]
        if not rep.endswith("\n"):
            rep += "\n"
        content = content[:start] + [rep] + content[end:]

open("Dashboard_recovered.tsx", "w").writelines(content)
print("Done!")
