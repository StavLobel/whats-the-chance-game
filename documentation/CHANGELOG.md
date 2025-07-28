# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial project setup with industry-standard configuration
- Comprehensive development infrastructure
- Version management system (SemVer)
- CI/CD pipeline with GitHub Actions
- Docker containerization
- Code quality tools (ESLint, Prettier, Black, isort, mypy)
- Testing infrastructure (Vitest, Playwright, Pytest)
- Pre-commit hooks and lint-staged
- Security scanning with Trivy
- Conventional commits support
- Comprehensive documentation
- **Hebrew text support** for challenge descriptions with RTL layout
- **Dark mode theme system** with light/dark/system options
- **Theme toggle** accessible on landing page and in-game
- **System theme detection** respecting user's OS preference
- **Enhanced UI components** with improved dark mode styling
- **Layout improvements** fixing sidebar spacing and text truncation
- **Custom logo integration** across all app interfaces (NavBar, Sidebar, Landing Page, Modals)
- **Browser favicon** with custom icon for improved brand identity
- **Logo documentation** in README.md with centered logo display

### Changed

- Updated project structure to industry standards
- Implemented strict TypeScript configuration
- Added comprehensive .gitignore
- Enhanced package.json with proper metadata and scripts
- **Removed language switcher** - UI now in English only with Hebrew support for challenge descriptions
- **Enhanced dark mode styling** with improved gradients and transitions
- **Improved layout structure** with better flex layouts and spacing

### Fixed

- TypeScript configuration issues
- Dependency version constraints
- Build tool configurations
- **Sidebar layout issues** - Fixed spacing between sidebar and main content
- **Text truncation** - Resolved user profile text cutoff in sidebar
- **CSS import warnings** - Fixed Google Fonts import order
- **Theme persistence** - Improved localStorage handling for theme preferences

## [0.1.0] - 2025-01-27

### Added

- Initial project foundation
- Basic project structure
- Development guidelines and Cursor rules
- GitHub issue tracking system
- Git workflow with feature branches
- Test-driven development approach
- Software Requirements Document (SRD)
- Development task roadmap (TASKS.md)

### Changed

- Migrated from Lovable template to custom project
- Updated project name and metadata
- Removed Lovable-specific dependencies

### Fixed

- Project initialization issues
- Documentation structure

---

## Version History

- **0.1.0**: Initial project setup and foundation
- **Unreleased**: Industry-standard configuration and infrastructure

## Release Notes

### Version 0.1.0

This is the initial release of the "What's the Chance?" project. It includes:

- Complete project foundation
- Development infrastructure setup
- Comprehensive documentation
- GitHub issue tracking
- Git workflow definition

### Upcoming Releases

#### Version 0.2.0 (Planned)

- Authentication system implementation
- Firebase integration
- User management features

#### Version 0.3.0 (Planned)

- Core game mechanics
- Challenge creation and resolution
- Real-time features

#### Version 1.0.0 (Planned)

- Production-ready application
- Complete feature set
- Performance optimizations
- Security hardening

## Contributing

When contributing to this project, please:

1. Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification
2. Update this changelog with your changes
3. Follow the established Git workflow
4. Ensure all tests pass
5. Update documentation as needed

## Links

- [Project Repository](https://github.com/StavLobel/whats-the-chance-game)
- [Software Requirements Document](./SRD.md)
- [Development Tasks](./TASKS.md)
- [Version Management Guide](./VERSIONING.md)
