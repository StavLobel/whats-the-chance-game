# Version Management Guide

## Overview

This project follows [Semantic Versioning (SemVer)](https://semver.org/) for version management. All version numbers follow the format: `MAJOR.MINOR.PATCH`.

## Version Format

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
```

### Version Components

- **MAJOR**: Incompatible API changes
- **MINOR**: New functionality in a backward-compatible manner
- **PATCH**: Backward-compatible bug fixes
- **PRERELEASE**: Alpha, beta, or release candidate versions
- **BUILD**: Build metadata

## Version Management

### Frontend (package.json)

- **Current Version**: 0.1.0
- **Version Scripts**:
  - `npm run version:patch` - Increment patch version
  - `npm run version:minor` - Increment minor version
  - `npm run version:major` - Increment major version
  - `npm run release:patch` - Version and push tags
  - `npm run release:minor` - Version and push tags
  - `npm run release:major` - Version and push tags

### Backend (pyproject.toml)

- **Current Version**: 0.1.0
- **Version Management**: Manual updates in pyproject.toml

## Release Process

### 1. Development Phase

- Work on feature branches
- Use conventional commits
- All tests must pass

### 2. Pre-release

- Update CHANGELOG.md
- Run full test suite
- Update version numbers

### 3. Release

- Create release branch
- Update version numbers
- Create Git tag
- Push to main branch

### 4. Post-release

- Create GitHub release
- Deploy to production
- Update documentation

## Conventional Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes
- **refactor**: Code refactoring
- **test**: Test changes
- **chore**: Build/tooling changes

### Examples

```
feat(auth): add Firebase authentication
fix(api): resolve challenge creation bug
docs(readme): update installation instructions
test(backend): add user model tests
```

## Version Constraints

### Frontend Dependencies

- **React**: ^18.2.0 (compatible with 18.2.x)
- **TypeScript**: ^5.0.2 (compatible with 5.0.x)
- **Vite**: ^4.4.5 (compatible with 4.4.x)

### Backend Dependencies

- **FastAPI**: >=0.104.1,<0.105.0 (exact minor version)
- **Python**: >=3.9 (minimum version)
- **Pydantic**: >=2.5.0,<3.0.0 (major version constraint)

## Dependency Management

### Frontend

- Use `npm ci` for production installs
- Use `npm install` for development
- Lock file: `package-lock.json`

### Backend

- Use `pip install -r requirements.txt` for production
- Use `pip install -e .[dev]` for development
- Lock file: `requirements.txt` with exact versions

## Breaking Changes

### Major Version Increment Required For:

- API endpoint changes
- Database schema changes
- Authentication flow changes
- Major UI/UX changes

### Minor Version Increment For:

- New features
- New API endpoints
- UI enhancements
- Performance improvements

### Patch Version Increment For:

- Bug fixes
- Documentation updates
- Minor UI tweaks
- Dependency updates

## Release Checklist

### Before Release

- [ ] All tests pass
- [ ] Code coverage meets targets (90%+)
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated
- [ ] Version numbers are updated
- [ ] Security scan passes

### During Release

- [ ] Create release branch
- [ ] Update version numbers
- [ ] Create Git tag
- [ ] Push to main
- [ ] Create GitHub release

### After Release

- [ ] Deploy to production
- [ ] Monitor application health
- [ ] Update deployment documentation
- [ ] Notify stakeholders

## Version History

### 0.1.0 (Current)

- Initial project setup
- Basic project structure
- Development infrastructure
- Documentation foundation

### Future Versions

- 0.2.0: Authentication system
- 0.3.0: Core game features
- 0.4.0: Real-time functionality
- 1.0.0: Production ready
