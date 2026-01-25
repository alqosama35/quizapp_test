# 🏗 QuizMaster Architecture

Technical deep-dive into QuizMaster's architecture, design decisions, and implementation details.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Component Design](#component-design)
- [Data Layer](#data-layer)
- [State Management](#state-management)
- [Routing System](#routing-system)
- [Modal System](#modal-system)
- [Event Flow](#event-flow)
- [Performance Considerations](#performance-considerations)
- [Security Considerations](#security-considerations)
- [Design Patterns](#design-patterns)

## Overview

QuizMaster is built as a **Single Page Application (SPA)** using **Vanilla JavaScript** (no frameworks). The architecture follows a **component-based pattern** with clear separation of concerns.

### Key Architectural Principles

1. **No Build Tools** - Direct browser execution, no compilation
2. **Framework-Free** - Pure JavaScript, HTML, CSS
3. **Client-Side Only** - No server, no backend
4. **Offline-First** - IndexedDB for persistence
5. **Progressive Enhancement** - Core features work without JavaScript

## System Architecture

### High-Level Diagram

```
┌──────────────────────────────────────────────────────────┐
│                      Browser                              │
│  ┌────────────────────────────────────────────────────┐  │
│  │                 index.html                         │  │
│  │         (Entry Point & Script Loader)              │  │
│  └────────────────┬───────────────────────────────────┘  │
│                   │                                       │
│  ┌────────────────▼───────────────────────────────────┐  │
│  │           Core Layer (js/)                         │  │
│  │  ┌──────────┐  ┌──────────┐  ┌────────┐           │  │
│  │  │storage.js│  │ utils.js │  │modal.js│           │  │
│  │  │(Dexie.js)│  │(helpers) │  │(dialogs)│           │  │
│  │  └──────────┘  └──────────┘  └────────┘           │  │
│  │  ┌──────────────────────────────────────┐          │  │
│  │  │         app.js (Router & State)      │          │  │
│  │  └──────────────────────────────────────┘          │  │
│  └────────────────┬───────────────────────────────────┘  │
│                   │                                       │
│  ┌────────────────▼───────────────────────────────────┐  │
│  │        Component Layer (components/)               │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │  │
│  │  │ dashboard.js│  │course-view  │  │quiz-input │  │  │
│  │  └─────────────┘  └─────────────┘  └───────────┘  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │  │
│  │  │quiz-taking  │  │quiz-results │  │settings   │  │  │
│  │  └─────────────┘  └─────────────┘  └───────────┘  │  │
│  │  ┌─────────────┐                                   │  │
│  │  │   help.js   │                                   │  │
│  │  └─────────────┘                                   │  │
│  └────────────────┬───────────────────────────────────┘  │
│                   │                                       │
│  ┌────────────────▼───────────────────────────────────┐  │
│  │              IndexedDB                             │  │
│  │  (QuizAppDB via Dexie.js)                          │  │
│  │  ┌─────────┐ ┌────────┐ ┌────────┐ ┌─────────┐   │  │
│  │  │courses  │ │quizzes │ │results │ │mistakes │   │  │
│  │  └─────────┘ └────────┘ └────────┘ └─────────┘   │  │
│  │  ┌──────────┐                                     │  │
│  │  │ settings │                                     │  │
│  │  └──────────┘                                     │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

#### 1. Entry Layer (`index.html`)
- Loads external dependencies (Dexie.js)
- Loads scripts in correct order
- Provides initial loading UI
- Sets initial theme class

#### 2. Core Layer (`js/`)
- **storage.js**: Database abstraction, CRUD operations
- **utils.js**: Pure helper functions (no side effects)
- **modal.js**: Custom modal/dialog system
- **app.js**: Application initialization, routing, state

#### 3. Component Layer (`components/`)
- **dashboard.js**: Home view, stats, course grid
- **course-view.js**: Single course detail view
- **quiz-input.js**: JSON paste and validation
- **quiz-taking.js**: Interactive quiz interface
- **quiz-results.js**: Results display and actions
- **settings.js**: User preferences
- **help.js**: Usage documentation

#### 4. Data Layer (IndexedDB)
- Persistent storage via Dexie.js
- 5 object stores (courses, quizzes, results, mistakes, settings)
- Automatic indexing and querying

## Component Design

### Component Structure

All components follow this pattern:

```javascript
// Component: components/example.js

async function renderExample() {
    // 1. Fetch data
    const data = await getSomeData();
    
    // 2. Compute derived state
    const computed = transformData(data);
    
    // 3. Return HTML string
    return `
        <div class="example-component">
            <h1>${escapeHTML(computed.title)}</h1>
            <button onclick="handleAction()">Action</button>
        </div>
    `;
}

// Component-specific functions
function handleAction() {
    // Update state
    AppState.something = newValue;
    
    // Re-render
    render();
}
```

### Component Lifecycle

1. **Router.navigate('view-name')** called
2. **AppState.currentView** updated
3. **render()** function invoked
4. Switch statement routes to component
5. **Component renderFunction()** executes:
   - Fetches data from storage
   - Computes derived values
   - Returns HTML string
6. **innerHTML** updates DOM
7. **attachEventListeners()** rebinds events
8. Component-specific initialization runs

### Component Communication

**Parent → Child:**
- Via AppState properties
- Example: `AppState.currentCourse` passed to course-view

**Child → Parent:**
- Via Router.navigate()
- Example: `Router.navigate('dashboard')` returns home

**Sibling → Sibling:**
- Via AppState mutation + render()
- Example: Quiz results updates stats → Dashboard re-renders

## Data Layer

### Database Schema

```javascript
const db = new Dexie('QuizAppDB');

db.version(1).stores({
    courses: 'id, name, createdAt',
    quizzes: 'id, courseId, name, createdAt',
    results: 'id, courseId, quizId, completedAt',
    mistakes: 'id, courseId, quizId, timestamp',
    settings: 'id'
});
```

### Table Details

#### courses
```javascript
{
    id: String (UUID),
    name: String,
    description: String,
    color: String (hex),
    icon: String (emoji),
    createdAt: String (ISO 8601),
    updatedAt: String (ISO 8601),
    settings: {
        passingScore: Number,
        defaultTimeLimit: Number | null,
        shuffleQuestions: Boolean,
        shuffleOptions: Boolean
    },
    stats: {
        totalQuizzes: Number,
        totalAttempts: Number,
        averageScore: Number,
        bestScore: Number,
        totalMistakes: Number
    }
}
```

#### quizzes
```javascript
{
    id: String (UUID),
    courseId: String (UUID),
    name: String,
    jsonData: Array<Question>,
    createdAt: String (ISO 8601),
    lastUsed: String (ISO 8601)
}

Question = {
    question: String,
    options: Array<String>,
    correct: Number,
    explanation: String
}
```

#### results
```javascript
{
    id: String (UUID),
    courseId: String (UUID),
    quizId: String (UUID),
    quizName: String,
    totalQuestions: Number,
    correctAnswers: Number,
    percentage: Number,
    duration: Number (seconds),
    completedAt: String (ISO 8601),
    answers: Array<Number | null>
}
```

#### mistakes
```javascript
{
    id: String (UUID),
    courseId: String (UUID),
    quizId: String (UUID),
    question: String,
    options: Array<String>,
    userAnswer: Number,
    correctAnswer: Number,
    explanation: String,
    timestamp: String (ISO 8601),
    reviewCount: Number
}
```

#### settings
```javascript
{
    id: Number (always 1),
    theme: 'dark' | 'light' | 'auto',
    fontSize: 'small' | 'medium' | 'large' | 'x-large',
    animations: Boolean,
    confetti: Boolean,
    lastBackup: String (ISO 8601) | null
}
```

### Data Access Patterns

**Create Operations:**
```javascript
const course = await createCourse(data);
const quiz = await createQuiz(courseId, data);
```

**Read Operations:**
```javascript
const courses = await getAllCourses();
const course = await getCourse(courseId);
const quizzes = await getQuizzesForCourse(courseId);
```

**Update Operations:**
```javascript
await updateCourse(courseId, updates);
await updateQuiz(quizId, updates);
```

**Delete Operations:**
```javascript
await deleteCourse(courseId); // Cascades to quizzes, results, mistakes
await deleteQuiz(quizId);
```

### Indexing Strategy

- **Primary Keys**: All UUIDs for global uniqueness
- **Secondary Indexes**:
  - `courses.name` - For search/filter
  - `courses.createdAt` - For sorting
  - `quizzes.courseId` - For course queries
  - `results.completedAt` - For recent activity
  - `mistakes.courseId` - For mistake practice

### Query Optimization

**Problem**: Dexie doesn't support `.orderBy()` after `.where().equals()`

**Solution**: Fetch filtered results, sort in JavaScript
```javascript
// ❌ Doesn't work
const quizzes = await db.quizzes
    .where('courseId').equals(courseId)
    .orderBy('createdAt')
    .toArray();

// ✅ Works
const quizzes = await db.quizzes
    .where('courseId').equals(courseId)
    .toArray();
quizzes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
```

## State Management

### Global State Object

```javascript
const AppState = {
    currentView: 'dashboard',      // Current route
    currentCourse: null,            // Selected course object
    currentQuiz: null,              // Selected quiz object
    quizSession: null,              // Active quiz session
    settings: null                  // Cached settings
};
```

### State Updates

**Pattern:**
```javascript
// 1. Update state
AppState.currentView = 'course-view';
AppState.currentCourse = course;

// 2. Trigger re-render
render();
```

### Quiz Session State

Active quiz stores session data:
```javascript
AppState.quizSession = {
    quiz: Object,              // Quiz object
    answers: Array<Number>,    // User's answers (index per question)
    currentQuestion: Number,   // Current question index
    startTime: Number,         // Timestamp (ms)
    timerInterval: Number      // setInterval ID
};
```

### State Persistence

- **Transient**: AppState (lost on refresh)
- **Persistent**: IndexedDB (survives refresh)
- **Session**: Quiz progress (lost on navigate away)

## Routing System

### Router Implementation

```javascript
const Router = {
    navigate(view, params = {}) {
        AppState.currentView = view;
        Object.assign(AppState, params);
        render();
    },
    
    back() {
        // Smart back navigation
        if (AppState.currentView === 'course-view') {
            this.navigate('dashboard');
        } else if (AppState.currentView === 'quiz-results') {
            this.navigate('course-view', { currentCourse: AppState.currentCourse });
        }
        // ... more cases
    }
};
```

### Route Map

| Route | Component | Parameters |
|-------|-----------|------------|
| `dashboard` | dashboard.js | None |
| `course-view` | course-view.js | `currentCourse` |
| `quiz-input` | quiz-input.js | `currentCourse` |
| `quiz-taking` | quiz-taking.js | `quizSession` |
| `quiz-results` | quiz-results.js | `quizSession`, `result` |
| `settings` | settings.js | None |
| `help` | help.js | None |

### Navigation Flow

```
Dashboard → Course View → Quiz Input → Quiz Taking → Quiz Results
    ↑           ↑            ↑              ↑             ↓
    └───────────┴────────────┴──────────────┴─────────────┘
                      (Back navigation)
```

## Modal System

### Architecture

Custom modal system replaces browser `alert()`, `confirm()`, `prompt()`.

### Modal Types

```javascript
ModalSystem.alert(message, title);
ModalSystem.confirm(message, title);
ModalSystem.prompt(message, defaultValue, title);
ModalSystem.success(message, title);
ModalSystem.error(message, title);
ModalSystem.info(message, title);
ModalSystem.warning(message, title);
ModalSystem.showLoading(message);
```

### Implementation

```javascript
class ModalSystem {
    constructor() {
        this.currentModal = null;
        this.createModalContainer();
    }
    
    async confirm(message, title = 'Confirm') {
        return new Promise((resolve) => {
            // Create modal HTML
            // Attach event listeners
            // Return true/false on button click
        });
    }
    
    // ... other methods
}

window.Modal = new ModalSystem();
```

### Features

- **Promises**: All modals return Promises
- **Keyboard Support**: Enter/Escape
- **Theming**: Inherits app theme
- **Animations**: Smooth fade in/out
- **Danger Mode**: Red styling for destructive actions

## Event Flow

### Event Handling Patterns

**1. Inline Handlers (Simple Actions)**
```javascript
<button onclick="Router.navigate('dashboard')">Back</button>
```

**2. Global Functions (Component Actions)**
```javascript
<button onclick="handleSubmit()">Submit</button>

function handleSubmit() {
    const data = collectFormData();
    await saveData(data);
    Router.navigate('success');
}
```

**3. Event Delegation (Dynamic Content)**
```javascript
// In attachEventListeners()
document.addEventListener('click', (e) => {
    if (e.target.matches('[data-action="delete"]')) {
        handleDelete(e.target.dataset.id);
    }
});
```

### Keyboard Events

Handled globally in quiz-taking:
```javascript
document.addEventListener('keydown', (e) => {
    if (AppState.currentView !== 'quiz-taking') return;
    
    switch(e.key) {
        case '1': case '2': case '3': case '4':
            selectOption(parseInt(e.key) - 1);
            break;
        case 'ArrowLeft':
            previousQuestion();
            break;
        case 'ArrowRight':
            nextQuestion();
            break;
        case 'Enter':
            submitOrNext();
            break;
        case 'r': case 'R':
            reviewAllAnswers();
            break;
    }
});
```

## Performance Considerations

### Rendering Strategy

**Current**: Full re-render on navigation
```javascript
render() {
    appContainer.innerHTML = html; // Replace entire view
}
```

**Pros:**
- Simple, predictable
- No state sync issues
- Small bundle size

**Cons:**
- Loses input focus
- Re-creates all DOM nodes

**Optimization**: Use `innerHTML` sparingly, target specific elements for updates

### Database Performance

**Batch Queries:**
```javascript
// ❌ N+1 query problem
for (const courseId of courseIds) {
    const course = await getCourse(courseId);
}

// ✅ Batch fetch
const courses = await db.courses
    .where('id').anyOf(courseIds)
    .toArray();
```

**Indexing:**
- Primary keys for direct lookups: O(log n)
- Indexed fields for filtering: O(log n)
- Non-indexed fields: O(n) table scan

**Caching:**
- Settings cached in AppState
- Course stats computed on write, not read

### Memory Management

**Quiz Session Cleanup:**
```javascript
function cleanupQuizSession() {
    if (AppState.quizSession?.timerInterval) {
        clearInterval(AppState.quizSession.timerInterval);
    }
    AppState.quizSession = null;
}
```

**Event Listener Cleanup:**
- Global listeners persist (never removed)
- Component listeners removed on re-render (innerHTML)

## Security Considerations

### XSS Prevention

**HTML Escaping:**
```javascript
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Always escape user input
<div>${escapeHTML(userInput)}</div>
```

**Where Applied:**
- Course names, descriptions
- Quiz names
- Question text
- Answer options
- All user-generated content

### Data Validation

**Quiz JSON Validation:**
```javascript
function validateQuizJSON(jsonString) {
    const quiz = JSON.parse(jsonString);
    
    if (!Array.isArray(quiz)) throw new Error('Must be array');
    
    quiz.forEach((q, i) => {
        if (!q.question) throw new Error(`Q${i+1}: Missing question`);
        if (!Array.isArray(q.options)) throw new Error(`Q${i+1}: Invalid options`);
        if (q.options.length < 2) throw new Error(`Q${i+1}: Need 2+ options`);
        if (typeof q.correct !== 'number') throw new Error(`Q${i+1}: Invalid correct index`);
        if (q.correct < 0 || q.correct >= q.options.length) {
            throw new Error(`Q${i+1}: Correct index out of range`);
        }
    });
    
    return quiz;
}
```

### CSP (Content Security Policy)

**Recommended Header:**
```
Content-Security-Policy: 
    default-src 'self'; 
    script-src 'self' https://unpkg.com; 
    style-src 'self' 'unsafe-inline'; 
    img-src 'self' data:;
```

**Current**: None (static file hosting)

### Data Privacy

- ✅ No analytics or tracking
- ✅ No external API calls (except CDN for Dexie.js)
- ✅ No cookies
- ✅ No localStorage for sensitive data
- ✅ All data stays in browser

## Design Patterns

### Patterns Used

#### 1. Module Pattern
Each component is a self-contained module with private functions.

#### 2. Singleton Pattern
- `ModalSystem` - Single instance as `window.Modal`
- `Dexie database` - Single instance as `window.db`

#### 3. Factory Pattern
```javascript
function createCourse(data) {
    return {
        id: generateUUID(),
        name: data.name || 'Untitled',
        // ... defaults
    };
}
```

#### 4. Observer Pattern (Simple)
State change → render() → UI updates

#### 5. Repository Pattern
`storage.js` abstracts database operations from components

#### 6. Template Method Pattern
All components follow same render → HTML → attach listeners flow

### Anti-Patterns Avoided

❌ **Global State Pollution** - Minimal globals (AppState, Router, db, Modal)  
❌ **Tight Coupling** - Components don't reference each other  
❌ **God Objects** - storage.js is large but well-organized  
❌ **Magic Strings** - Use constants where appropriate  

### Trade-offs

**Vanilla JS vs Framework:**
- ✅ No build step, simple deployment
- ✅ Small bundle (~50KB total)
- ❌ Manual DOM updates
- ❌ No reactivity

**innerHTML vs DOM API:**
- ✅ Simple, readable templates
- ✅ Fast for full view changes
- ❌ Loses event listeners (must reattach)
- ❌ Can't diff for partial updates

**IndexedDB vs Server:**
- ✅ Offline-first
- ✅ No backend costs
- ❌ No multi-device sync
- ❌ Limited to browser storage

---

## Summary

QuizMaster's architecture prioritizes:
1. **Simplicity** - No build tools, frameworks
2. **Clarity** - Explicit data flow
3. **Performance** - Minimal dependencies
4. **Privacy** - Client-side only
5. **Maintainability** - Modular design

This makes it easy to understand, modify, and deploy while providing a production-ready user experience.
