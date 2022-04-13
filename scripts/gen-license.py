import csv
import json
import re
import shlex
import subprocess


"""
license-checker-rseidelsohn may not be able to find the repository for some dependencies.
Manually add the dependency name and the repository location in REPO_EXCEPTIONS.
"""
REPO_EXCEPTIONS = {
    "@aws-quickstart/eks-blueprints": "https://github.com/aws-quickstart/cdk-eks-blueprints",
    "@datadog/datadog-eks-blueprints-addon": "https://github.com/DataDog/ssp-addon-datadog"
}

"""
Copyright Exceptions List
typescript has its copyright information in `CopyrightNotice.txt`
"""
COPYRIGHT_FILE_EXCEPTIONS = {
    "typescript": "./node_modules/typescript/CopyrightNotice.txt",
}

def get_repo_url(dep_name, dep_meta):
    repo_url = dep_meta.get("repository", REPO_EXCEPTIONS.get(dep_name, "NO REPO"))
    if repo_url.startswith("https"):
        return re.search(r"https:\/\/(.*)", repo_url).group(1)
    return repo_url


if __name__ == "__main__":
    raw_output = subprocess.check_output(
        shlex.split("npx license-checker-rseidelsohn --json --start --direct .")
    )
    deps = json.loads(raw_output)
    alphabetized_dep_names = sorted(deps.keys())

    formatted_deps = []
    for dep in alphabetized_dep_names:
        dep_meta = deps[dep]
        dep_name = re.search(r"(.+)@", dep).group(1)
        repo_url = get_repo_url(dep_name, dep_meta)
        license = dep_meta.get("licenses", "LICENSE NOT FOUND")

        if "Custom" in license:
            print("Custom license for {}".format(dep_name))
        # "*" indicates a "guessed" license from a license text rather than with spdx.
        if "*" in license:
            license = license.replace("*", "")

        # Extract the "Copyright ..." line from the license file.
        # Naively handles multi-line copyrights 1) starting with "Copyright",
        # containing a year (4 digits), and ending with two newlines, then 2)
        # starting with "Copyright" and ending with two newlines.
        license_file = COPYRIGHT_FILE_EXCEPTIONS.get(dep_name, dep_meta.get("licenseFile", None))
        dep_copyright = ""
        if license_file and dep_copyright == "":
            with open(license_file) as f:
                contents = f.read()
                # https://stackoverflow.com/a/52347904
                matches = re.findall(r"(Copyright.*\d{4,}.*)(\n\S.*)*", contents)
                if len(matches) == 0:
                    matches = re.findall(r"(Copyright.*)(\n\S.*)*", contents)
                if len(matches) > 0:
                    dep_copyright = matches[0][0].replace("\n", " ")
        if not license_file:
            print("No license file for {}".format(dep_name))

        formatted_deps.append(
            {
                "Component": dep_name,
                "Origin": repo_url,
                "License": license,
                "Copyright": dep_copyright,
            }
        )

    with open("./LICENSE-3rdparty.csv", "w") as csv_file:
        fieldnames = ["Component", "Origin", "License", "Copyright"]
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()
        for dep in formatted_deps:
            writer.writerow(dep)
