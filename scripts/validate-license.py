import csv
import json

if __name__ == "__main__":
    json_deps = set()
    with open('package.json', 'r') as json_file:
        data = json.load(json_file)
        for d in data['devDependencies']:
            json_deps.add(d)
        for d in data['dependencies']:
            json_deps.add(d)
    json_deps.add('@datadog/datadog-eks-blueprints-addon')

    csv_deps = set()
    with open('LICENSE-3rdparty.csv', newline='') as csv_file:
        reader = csv.reader(csv_file)
        next(reader, None)  # skip header
        for d in reader:
            csv_deps.add(d[0])

    diff = json_deps.symmetric_difference(csv_deps)
    if len(diff) > 0:
        raise Exception('The following dependencies are present in one of `package.json` or `LICENSE-3rdparty.csv` but not the other: {}'.format(diff))
