# Security Policy

## Supported versions

Plainforge has not published stable releases yet. Until `1.0.0`, security fixes target the latest `main` branch and the latest npm package when one exists.

| Version | Supported |
| --- | --- |
| `main` | Yes |
| `<0.1.0` | No |

## Reporting a vulnerability

Please do not report suspected vulnerabilities in public issues, pull requests, or discussions.

Use GitHub private vulnerability reporting when it is enabled for the repository. If it is not enabled yet, open a public issue asking for a private reporting path without including exploit details, secrets, personal data, or sensitive technical details.

## Scope

In scope:

- Bugs that make Plainforge execute fixture HTML, JavaScript, CSS, or remote resources.
- Unexpected network, telemetry, credential, or publish behavior.
- CLI path handling issues that can overwrite files outside an explicit `--output` directory.
- CI, release, or dependency guidance maintained by this project.

Out of scope:

- General support requests.
- Problems in unrelated downstream converters.
- Vulnerabilities requiring modified local fixtures from a trusted maintainer without a security impact.

## Safety model

Plainforge is designed to read local fixture files, compare text, and write reports on request. It should not make network calls, execute HTML, collect credentials, or publish anything.
