# Changelog

All notable changes to this project will be documented in this file.

This project follows the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format and uses semantic versioning when versioned releases are published.

## [Unreleased]

### Added

- Local-first `plainforge` CLI with `convert` and `inspect` commands.
- Fixture discovery for `input.html`, `expected.txt`, and optional `meta.json`.
- Deterministic HTML-to-text conversion with link, entity, block, and hidden-content handling.
- JSON and Markdown report generation.
- Fixture-backed unit tests and CLI smoke checks.
- README, examples, safety, contributing, and security documentation.

### Fixed

- Omit hidden block contents when truncated HTML ends before the closing tag.

[Unreleased]: https://github.com/rogerchappel/plainforge/compare/HEAD...HEAD
