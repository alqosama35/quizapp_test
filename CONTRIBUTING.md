# 🤝 Contributing to QuizMaster

Thank you for your interest in contributing to QuizMaster! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Code Style Guide](#code-style-guide)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

Be respectful, inclusive, and constructive. This is a learning project—help others learn!

## How Can I Contribute?

### 🐛 Reporting Bugs

**Before submitting:**
- Check existing issues to avoid duplicates
- Test on multiple browsers if possible
- Gather browser console errors

**Bug Report Template:**
```markdown
**Description:**
Clear description of the bug

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- Browser: Chrome 90
- OS: Windows 10
- QuizMaster Version: v1.0

**Console Errors:**
```
(paste any errors)
```

**Screenshots:**
(if applicable)
```

### 💡 Suggesting Features

**Feature Request Template:**
```markdown
**Problem:**
What problem does this solve?

**Proposed Solution:**
How should it work?

**Alternatives Considered:**
Other approaches you've thought about

**Use Case:**
Example scenario where this helps
```

### 🔧 Code Contributions

**Good First Issues:**
- Documentation improvements
- UI/UX tweaks
- Bug fixes
- New quiz validation rules
- Additional helper functions

**Larger Features:**
- See [Roadmap](README.md#-roadmap) for planned features
- Discuss in issues before implementing

## Development Setup

### Prerequisites

- Git
- Modern browser (Chrome, Firefox, Safari, Edge)
- Text editor (VS Code recommended)

### Setup Steps

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/quizmaster.git
cd quizmaster

# 3. Add upstream remote
git remote add upstream https://github.com/ORIGINAL-OWNER/quizmaster.git

# 4. Create a branch
git checkout -b feature/your-feature-name

# 5. Make changes and test
# Open index-new.html in browser

# 6. Commit and push
git add .
git commit -m "Add: Your feature description"
git push origin feature/your-feature-name

# 7. Open Pull Request on GitHub
```

### Project Structure

See [README.md](README.md#-project-structure) for full structure.

**Key files for common tasks:**

| Task | Files to Modify |
|------|----------------|
| Add component | `components/new-component.js`, `index.html`, `js/app.js` |
| Add database table | `js/storage.js` (schema + functions) |
| Add styling | `styles/components.css` or `styles/main.css` |
| Add utility function | `js/utils.js` |
| Fix bug | Find component in `components/`, fix, test |

## Code Style Guide

### JavaScript

**ES6+ Features:**
```javascript
// ✅ Use const/let, not var
const courses = await getAllCourses();
let currentIndex = 0;

// ✅ Use async/await
async function loadData() {
    const data = await fetchData();
}

// ✅ Use template literals
const html = `<div>${escapeHTML(name)}</div>`;

// ✅ Use arrow functions for callbacks
courses.map(c => c.name);

// ✅ Use destructuring
const { name, description } = course;
```

**Naming Conventions:**
```javascript
// Variables & functions: camelCase
const courseList = [];
function getCourse() {}

// Classes: PascalCase
class ModalSystem {}

// Constants: UPPER_SNAKE_CASE (if truly constant)
const MAX_QUESTIONS = 100;

// Private functions: underscore prefix (convention)
function _internalHelper() {}
```

**Function Documentation:**
```javascript
/**
 * Creates a new course in the database
 * @param {Object} data - Course data
 * @param {string} data.name - Course name
 * @param {string} [data.description] - Optional description
 * @returns {Promise<Object>} Created course object
 */
async function createCourse(data) {
    // ...
}
```

**Indentation:**
- **4 spaces** (not tabs)
- Consistent nesting

**Semicolons:**
- Use them (avoid ASI issues)

**Quotes:**
- Single quotes `'text'` for JS strings
- Double quotes `"text"` for HTML attributes
- Template literals for interpolation

### HTML

```html
<!-- ✅ Semantic tags -->
<header class="dashboard-header">
    <h1>QuizMaster</h1>
</header>

<!-- ✅ Accessibility attributes -->
<button aria-label="Close" title="Close">×</button>

<!-- ✅ Data attributes for JS hooks -->
<div data-action="delete" data-id="123">Delete</div>

<!-- ✅ Escape user content -->
<div>${escapeHTML(userInput)}</div>
```

### CSS

**BEM-inspired naming:**
```css
/* Block */
.course-card {}

/* Element */
.course-card__title {}
.course-card__description {}

/* Modifier */
.course-card--featured {}

/* State */
.course-card.is-active {}
```

**Use CSS variables:**
```css
/* ✅ Use variables */
color: var(--primary-color);

/* ❌ Avoid hardcoded colors */
color: #3B82F6;
```

**Organization:**
```css
/* 1. Layout */
display: flex;
flex-direction: column;

/* 2. Sizing */
width: 100%;
padding: 16px;

/* 3. Appearance */
background: var(--bg-secondary);
border-radius: 8px;

/* 4. Typography */
font-size: 14px;
color: var(--text-primary);

/* 5. Transitions */
transition: all 0.3s ease;
```

## Commit Guidelines

### Commit Message Format

```
Type: Short description (50 chars max)

Longer description if needed (72 chars per line)

- Bullet points for details
- Reference issues: Fixes #123
```

### Commit Types

- **Add:** New feature
- **Fix:** Bug fix
- **Update:** Modify existing feature
- **Refactor:** Code restructuring (no behavior change)
- **Style:** Formatting, missing semicolons (no code change)
- **Docs:** Documentation only
- **Test:** Adding tests
- **Chore:** Build process, dependencies

### Examples

```bash
# Good commits
git commit -m "Add: Keyboard shortcut for quiz review (R key)"
git commit -m "Fix: Perfect score showing at 0% - Fixes #45"
git commit -m "Update: Improve modal animation performance"
git commit -m "Docs: Add architecture diagrams to README"

# Bad commits
git commit -m "fixes"
git commit -m "update stuff"
git commit -m "asdfasdf"
```

## Pull Request Process

### Before Submitting

- [ ] Test on Chrome, Firefox, Safari (if possible)
- [ ] Check browser console for errors
- [ ] Verify responsive design (mobile/tablet)
- [ ] Update documentation if needed
- [ ] Follow code style guide
- [ ] Rebase on latest `main` branch

### PR Template

```markdown
## Description
What does this PR do?

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Fixes #(issue number)

## Testing
How did you test this?

- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on mobile
- [ ] No console errors

## Screenshots
(if UI changes)

## Checklist
- [ ] Code follows style guide
- [ ] Self-reviewed code
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated Checks** (if set up):
   - Linting
   - Basic smoke tests

2. **Code Review**:
   - Maintainer reviews code
   - May request changes
   - Discuss in PR comments

3. **Approval**:
   - 1+ maintainer approval required
   - Address all feedback

4. **Merge**:
   - Squash merge to main
   - Delete branch after merge

## Testing

### Manual Testing Checklist

**Core Functionality:**
- [ ] Create course
- [ ] Add quiz (paste JSON)
- [ ] Take quiz
- [ ] View results
- [ ] Practice mistakes
- [ ] Export/import data

**Edge Cases:**
- [ ] Invalid JSON
- [ ] Empty states (no courses, no quizzes)
- [ ] Long course names
- [ ] 100+ question quiz
- [ ] Quiz with 2 options, quiz with 6 options

**Browser Testing:**
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Responsive Testing:**
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### Test Tools

**Browser DevTools:**
- Console for errors
- Network tab for failed requests
- Responsive design mode
- Application tab → IndexedDB

**Lighthouse:**
- Performance
- Accessibility
- Best Practices

## Documentation

### Update When:

- **README.md**: New features, setup changes
- **docs/ARCHITECTURE.md**: Architecture changes
- **QUICKSTART.md**: User workflow changes
- **Inline comments**: Complex logic

### Documentation Style

**README:**
- Clear, concise
- Examples for complex features
- Update Table of Contents

**Code Comments:**
```javascript
// ❌ Avoid obvious comments
const name = 'Quiz'; // Set name to 'Quiz'

// ✅ Explain WHY, not WHAT
// Dexie doesn't support .orderBy() after .where().equals()
// so we fetch all and sort manually
const quizzes = await db.quizzes
    .where('courseId').equals(courseId)
    .toArray();
quizzes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
```

---

## Questions?

- **GitHub Issues**: Ask questions in issues
- **Pull Request Comments**: Discuss specific code
- **README**: Check existing documentation

## Thank You! 🎉

Every contribution, no matter how small, helps make QuizMaster better for learners everywhere!

---

**Happy Contributing!** 🚀
