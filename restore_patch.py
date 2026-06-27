import os

lines = open("dashboard_patch.txt").read().splitlines()
current_file = None
file_content = []

os.makedirs("src/components/dashboard", exist_ok=True)

for line in lines:
    if line.startswith("+++ b/src/components/dashboard/"):
        if current_file:
            with open(current_file, "w") as f:
                f.write("\n".join(file_content))
        current_file = line.replace("+++ b/", "")
        file_content = []
    elif current_file and (line.startswith("+") and not line.startswith("+++")):
        file_content.append(line[1:])
    elif current_file and line.startswith("@@"):
        pass

if current_file:
    with open(current_file, "w") as f:
        f.write("\n".join(file_content))

print("Files restored successfully.")
