# Releasing

This document summarizes the process of doing a new release of this project.

### Prerequisites

- [Yarn](https://yarnpkg.com/)
- Ensure the CI passing

### Process

- Create and checkout a release branch
- Update the version in `package.json` you want to release, following semver
    - Example for Yarn 2.x.x `yarn version --no-git-tag-version --set-version 0.0.2-beta.1`
    - Example for Yarn 4.x.x `yarn version patch` to increase patch version, see `yarn version --help` for more options.
- Commit the changes
- Create and push a git tag
    - Example `git tag v0.0.2-beta.1` and `git push origin v0.0.2-beta.1`
- Get the release branch approved and merged
    - Make sure the CI is passing, as this is the commit we will be releasing!
- Create a Github Release from the [Releases page](https://github.com/DataDog/datadog-eks-blueprints-addon/releases) with the description of changes introduced.
    - Set the tag and the release name to new version e.g. `v0.0.2-beta.1`
    - Click on the `Auto-generate release notes` button
    - Check the `This is a pre-release` box for alpha/beta releases
- Once the release or the pre-release has been created, a Github Action will publish the `@datadog/datadog-eks-blueprints-addon` NPM package. Pre-releases will be tagger with a `beta` tag while releases will have the `latest` tag.
