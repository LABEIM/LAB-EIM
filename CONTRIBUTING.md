# Contributing Guidelines

Thank you for your interest in contributing to **EIM Lab Website**, a project under the **Enterprise Infrastructure Management (EIM) Laboratory**, Telkom University.

We welcome contributions from researchers, software engineers, students, and open-source enthusiasts. This document provides clear guidelines to ensure a collaborative, transparent, and efficient workflow.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Intellectual Property & Licensing](#intellectual-property--licensing)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Issues & Bugs](#reporting-issues--bugs)
  - [Requesting New Features](#requesting-new-features)
  - [Improving Documentation](#improving-documentation)
  - [Submitting Code Changes](#submitting-code-changes)
- [Getting Started & Local Setup](#getting-started--local-setup)
  - [Prerequisites](#prerequisites)
  - [Installation & Development Server](#installation--development-server)
- [Git & Contribution Workflow](#git--contribution-workflow)
  - [Branch Naming Standard](#branch-naming-standard)
  - [Commit Message Conventions](#commit-message-conventions)
  - [Commit Signing](#commit-signing)
- [Pull Request (PR) Lifecycle](#pull-request-pr-lifecycle)
  - [PR Submission Checklist](#pr-submission-checklist)
  - [CI/CD Verification](#cicd-verification)
  - [Code Review Process](#code-review-process)
- [Coding Standards & Quality Assurance](#coding-standards--quality-assurance)
- [Security Vulnerability Disclosures](#security-vulnerability-disclosures)
- [Community & Contact](#community--contact)

---

## Code of Conduct

All members, contributors, and maintainers are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please ensure you have read and understood our community standards before participating.

---

## Intellectual Property & Licensing

<!-- Select the relevant licensing option below based on whether your project uses LICENSE.MIT or LICENSE.ALL-RIGHTS-RESERVED -->

<!-- ========================================================================= -->
<!-- OPTION A: For Open-Source Projects (MIT Licensed)                          -->
<!-- ========================================================================= -->
<!--
This project is open-source under the [MIT License](LICENSE). By contributing to this repository, you agree that your contributions will be licensed under the same MIT License terms that govern the project.
-->

<!-- ========================================================================= -->
<!-- OPTION B: For Proprietary / Lab Internal Projects (All Rights Reserved)     -->
<!-- ========================================================================= -->
This repository and its assets are proprietary and licensed under [All Rights Reserved](LICENSE) by **Enterprise Infrastructure Management (EIM) Laboratory**, Telkom University.

We welcome contributions from external collaborators, researchers, and students under the following terms:
1. **Grant of Rights & Assignment:** By submitting a Pull Request, issue, patch, or code snippet, you agree that your contribution is provided to the laboratory, and you grant the laboratory all necessary rights, title, and interest to use, modify, integrate, and distribute the contributed work under the repository's proprietary terms.
2. **Original Work & Warranty:** You represent that all contributed materials are your original creation, or that you have full legal right and authorization from the copyright holder to contribute them.
3. **No Royalties:** Contributions are made on a voluntary basis without expectation of monetary compensation or royalties. Attribution will be maintained in commit logs and project documentation.

---

## How Can I Contribute?

### Reporting Issues & Bugs

If you discover an issue, defect, or unexpected behavior:
1. Check the [Issue Tracker](https://github.com/LABEIM/LAB-EIM/issues) to ensure the bug hasn't already been reported.
2. If unresolved, create a new issue using a concise, descriptive title.
3. Provide essential details:
   - **Description**: A clear summary of the unexpected behavior.
   - **Reproduction Steps**: Step-by-step instructions to reproduce the bug.
   - **Expected Behavior**: What you expected to happen.
   - **Environment**: OS, browser/runtime version, and hardware platform (if relevant).
   - **Logs / Screenshots**: Stack traces, error outputs, or screenshots.

### Requesting New Features

We welcome proposals for new features and optimizations:
1. Open a feature request in the issue tracker.
2. Describe the problem your proposal solves, target use cases, and suggested implementation approaches.
3. Discuss architectural implications with maintainers before opening large Pull Requests.

### Improving Documentation

High-quality documentation is vital for research and production software:
- Clarifying setup instructions, API references, architecture guides, and tutorial examples is always encouraged.
- Fix typos, broken links, or ambiguous explanations.

### Submitting Code Changes

Whether you are fixing a bug or adding a new feature, follow the git workflow detailed below.

---

## Getting Started & Local Setup

### Prerequisites

Ensure you have the required runtimes and tools installed on your development machine:
- **Git** (latest stable)
- **Runtime / Package Manager**: Node.js `>=22.12.0` with `pnpm` (12.x; `pnpm-lock.yaml` pins resolutions).
- **Editor**: VS Code, Cursor, or your preferred IDE

### Installation & Development Server

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/LABEIM/LAB-EIM.git
   cd LAB-EIM
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start the local development server:**
   ```bash
   pnpm run dev
   ```

4. **Verify baseline build and tests:**
   ```bash
   pnpm exec astro check
   pnpm test
   pnpm run build
   ```

---

## Git & Contribution Workflow

### Branch Naming Standard

Always create a new feature or fix branch from `main`. Do not commit directly to `main`.

```text
feat/add-sensor-telemetry-endpoint
fix/auth-token-refresh-leak
docs/update-api-reference
perf/optimize-query-caching
refactor/modularize-router-handler
chore/bump-dependencies
```

**Common Branch Prefixes:**
| Prefix | Description |
| :--- | :--- |
| `feat/` | New feature, component, or functional capability |
| `fix/` | Bug fix or issue resolution |
| `docs/` | Documentation additions or adjustments |
| `perf/` | Performance optimizations |
| `refactor/` | Code restructuring with no behavior change |
| `test/` | Adding or updating unit/integration tests |
| `chore/` | Tooling, dependencies, or repository maintenance |

### Commit Message Conventions

We strictly enforce the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<optional scope>): <imperative description>

[optional body explaining WHY the change was made]

[optional footer(s), e.g. Closes #123]
```

**Valid commit types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.

**Examples:**
```text
feat(auth): implement oauth2 token rotation
fix(api): handle null payload gracefully in webhook handler
docs(readme): add environment variables reference table
test(telemetry): add unit tests for packet parsing
```

### Commit Signing

Signed commits using GPG or SSH keys are strongly encouraged across all EIM Lab repositories to verify authorship:

```bash
git commit -S -m "feat(telemetry): add batch metrics processor"
```

---

## Pull Request (PR) Lifecycle

### PR Submission Checklist

Before submitting your Pull Request, ensure:
- [ ] Code compiles and passes all checks (`pnpm exec astro check`, `pnpm run build`).
- [ ] Automated tests pass successfully (`pnpm test`).
- [ ] New functionality includes corresponding unit or integration tests.
- [ ] Documentation (`README.md`, API specs, comments) is updated to reflect changes.
- [ ] Commit history is clean, signed, and adheres to Conventional Commits.
- [ ] Branch is rebased onto the latest `main` branch with no merge conflicts.

### CI/CD Verification

Once your PR is opened:
1. Automated CI/CD pipelines will execute build, lint, and test suites.
2. Opening a pull request produces a Cloudflare Workers preview deployment (plus a Vercel preview when the backup is enabled) for visual verification.
3. Ensure all CI checks pass green before requesting maintainer review.

### Code Review Process

- Project maintainers will review your PR for architectural alignment, code quality, test coverage, and security.
- Maintainers may request modifications or suggest improvements.
- Once approved, your PR will be merged into `main`.

---

## Coding Standards & Quality Assurance

- **Code Formatting & Style:** Maintain consistent formatting by adhering to [`.editorconfig`](.editorconfig) (UTF-8, LF line endings, 2-space indentation).
- **Readability & Modularity:** Write clear, self-documenting code with descriptive naming and minimal cognitive complexity.
- **Type Safety:** Ensure strong typing (e.g. TypeScript, Zod, Python type hints) across data boundaries and API interfaces.
- **Error Handling:** Gracefully catch and handle unexpected exceptions with helpful diagnostic log context.
- **Security Best Practices:** Never commit credentials, API keys, private tokens, or secrets. Use `.env.example` templates for configuration references.

---

## Security Vulnerability Disclosures

If you discover a security vulnerability or sensitive exploit:
- **Do not open a public GitHub issue, discussion, or PR.**
- Review our [Security Policy](SECURITY.md) for full reporting procedures and response guidelines.
- Report the vulnerability privately via email to: [`lab@eimlab.org`](mailto:lab@eimlab.org).
- Include full technical details and steps to reproduce. We will coordinate a patched release promptly.

---

## Community & Contact

Have questions, ideas, or feedback?
- **Issue Tracker:** [https://github.com/LABEIM/LAB-EIM/issues](https://github.com/LABEIM/LAB-EIM/issues)
- **Lab Email:** [lab@eimlab.org](mailto:lab@eimlab.org)
- **Lab Portal:** [https://eimlab.org](https://eimlab.org)
- **Organization:** Enterprise Infrastructure Management (EIM) Laboratory, Telkom University
