// Database setup and storage operations using Dexie.js
const db = new Dexie('QuizAppDB');

// Define database schema
db.version(1).stores({
    courses: 'id, name, createdAt',
    quizzes: 'id, courseId, name, createdAt',
    results: 'id, courseId, quizId, completedAt',
    mistakes: 'id, courseId, quizId, timestamp',
    settings: 'id'
});

// ============= UTILITY FUNCTIONS =============

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ============= COURSE OPERATIONS =============

async function createCourse(data) {
    const course = {
        id: generateUUID(),
        name: data.name || 'Untitled Course',
        description: data.description || '',
        color: data.color || '#3B82F6',
        icon: data.icon || '📘',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: {
            passingScore: data.passingScore || 70,
            defaultTimeLimit: data.defaultTimeLimit || null,
            shuffleQuestions: data.shuffleQuestions || false,
            shuffleOptions: data.shuffleOptions || false
        },
        stats: {
            totalQuizzes: 0,
            totalAttempts: 0,
            averageScore: 0,
            bestScore: 0,
            totalMistakes: 0
        }
    };
    
    await db.courses.add(course);
    return course;
}

async function getAllCourses() {
    return await db.courses.orderBy('createdAt').reverse().toArray();
}

async function getCourse(id) {
    return await db.courses.get(id);
}

async function updateCourse(id, updates) {
    const course = await db.courses.get(id);
    if (!course) throw new Error('Course not found');
    
    const updatedCourse = {
        ...course,
        ...updates,
        updatedAt: new Date().toISOString()
    };
    
    await db.courses.put(updatedCourse);
    return updatedCourse;
}

async function deleteCourse(id) {
    // Delete all related data
    await db.quizzes.where('courseId').equals(id).delete();
    await db.results.where('courseId').equals(id).delete();
    await db.mistakes.where('courseId').equals(id).delete();
    await db.courses.delete(id);
}

async function updateCourseStats(courseId) {
    const quizzes = await db.quizzes.where('courseId').equals(courseId).toArray();
    const results = await db.results.where('courseId').equals(courseId).toArray();
    const mistakes = await db.mistakes.where('courseId').equals(courseId).toArray();
    
    const stats = {
        totalQuizzes: quizzes.length,
        totalAttempts: results.length,
        averageScore: 0,
        bestScore: 0,
        totalMistakes: mistakes.length
    };
    
    if (results.length > 0) {
        const scores = results.map(r => r.percentage);
        stats.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        stats.bestScore = Math.max(...scores);
    }
    
    await db.courses.update(courseId, { stats });
    return stats;
}

// ============= QUIZ OPERATIONS =============

async function createQuiz(courseId, data) {
    const course = await db.courses.get(courseId);
    if (!course) throw new Error('Course not found');
    
    // Auto-increment quiz name if not provided
    let name = data.name;
    if (!name) {
        const existingQuizzes = await db.quizzes.where('courseId').equals(courseId).toArray();
        const quizNumbers = existingQuizzes
            .map(q => {
                const match = q.name.match(/^Quiz (\d+)$/);
                return match ? parseInt(match[1]) : 0;
            })
            .filter(n => n > 0);
        const nextNumber = quizNumbers.length > 0 ? Math.max(...quizNumbers) + 1 : 1;
        name = `Quiz ${nextNumber}`;
    }
    
    const quiz = {
        id: generateUUID(),
        courseId,
        name,
        jsonData: data.jsonData || [],
        createdAt: new Date().toISOString(),
        tags: data.tags || [],
        difficulty: data.difficulty || null,
        source: data.source || null,
        stats: {
            attempts: 0,
            bestScore: 0,
            lastAttempt: null
        }
    };
    
    await db.quizzes.add(quiz);
    await updateCourseStats(courseId);
    return quiz;
}

async function getAllQuizzes(courseId) {
    const quizzes = await db.quizzes.where('courseId').equals(courseId).toArray();
    return quizzes.sort((a, b) => b.createdAt - a.createdAt);
}

async function getQuiz(id) {
    return await db.quizzes.get(id);
}

async function updateQuiz(id, updates) {
    const quiz = await db.quizzes.get(id);
    if (!quiz) throw new Error('Quiz not found');
    
    const updatedQuiz = { ...quiz, ...updates };
    await db.quizzes.put(updatedQuiz);
    return updatedQuiz;
}

async function deleteQuiz(id) {
    const quiz = await db.quizzes.get(id);
    if (!quiz) return;
    
    await db.results.where('quizId').equals(id).delete();
    await db.mistakes.where('quizId').equals(id).delete();
    await db.quizzes.delete(id);
    await updateCourseStats(quiz.courseId);
}

async function updateQuizStats(quizId, result) {
    const quiz = await db.quizzes.get(quizId);
    if (!quiz) return;
    
    const stats = {
        attempts: quiz.stats.attempts + 1,
        bestScore: Math.max(quiz.stats.bestScore, result.percentage),
        lastAttempt: new Date().toISOString()
    };
    
    await db.quizzes.update(quizId, { stats });
}

// ============= RESULT OPERATIONS =============

async function saveResult(data) {
    const result = {
        id: generateUUID(),
        courseId: data.courseId,
        quizId: data.quizId,
        quizName: data.quizName,
        score: data.score,
        totalQuestions: data.totalQuestions,
        percentage: Math.round((data.score / data.totalQuestions) * 100),
        timeTaken: data.timeTaken || 0,
        completedAt: new Date().toISOString(),
        answers: data.answers || []
    };
    
    await db.results.add(result);
    
    // Update quiz and course stats
    if (data.quizId) {
        await updateQuizStats(data.quizId, result);
    }
    await updateCourseStats(data.courseId);
    
    return result;
}

async function getResultsForCourse(courseId) {
    const results = await db.results.where('courseId').equals(courseId).toArray();
    return results.sort((a, b) => b.completedAt - a.completedAt);
}

async function getResultsForQuiz(quizId) {
    const results = await db.results.where('quizId').equals(quizId).toArray();
    return results.sort((a, b) => b.completedAt - a.completedAt);
}

// ============= MISTAKE OPERATIONS =============

async function saveMistake(data) {
    const mistake = {
        id: generateUUID(),
        courseId: data.courseId,
        quizId: data.quizId || null,
        quizName: data.quizName || 'Unknown Quiz',
        question: data.question,
        incorrectAnswer: data.incorrectAnswer,
        correctAnswer: data.correctAnswer,
        timestamp: new Date().toISOString(),
        reviewedCount: 0,
        lastReviewed: null
    };
    
    await db.mistakes.add(mistake);
    await updateCourseStats(data.courseId);
    return mistake;
}

async function getMistakesForCourse(courseId) {
    const mistakes = await db.mistakes.where('courseId').equals(courseId).toArray();
    return mistakes.sort((a, b) => b.timestamp - a.timestamp);
}

async function updateMistakeReviewCount(id) {
    const mistake = await db.mistakes.get(id);
    if (!mistake) return;
    
    await db.mistakes.update(id, {
        reviewedCount: mistake.reviewedCount + 1,
        lastReviewed: new Date().toISOString()
    });
}

async function deleteMistake(id) {
    const mistake = await db.mistakes.get(id);
    if (!mistake) return;
    
    await db.mistakes.delete(id);
    await updateCourseStats(mistake.courseId);
}

async function clearMistakesForCourse(courseId) {
    await db.mistakes.where('courseId').equals(courseId).delete();
    await updateCourseStats(courseId);
}

// ============= SETTINGS OPERATIONS =============

async function getSettings() {
    let settings = await db.settings.get(1);
    if (!settings) {
        settings = {
            id: 1,
            theme: 'dark',
            accentColor: '#3B82F6',
            fontSize: 'medium',
            soundEffects: false,
            showTimer: true,
            compactMode: false,
            animations: true,
            autoBackupReminder: true,
            lastBackup: null
        };
        await db.settings.add(settings);
    }
    return settings;
}

async function updateSettings(updates) {
    const settings = await getSettings();
    const updated = { ...settings, ...updates };
    await db.settings.put(updated);
    return updated;
}

// ============= DATA MIGRATION =============

async function migrateFromLocalStorage() {
    console.log('Checking for localStorage data to migrate...');
    
    // Check if already migrated
    const migrated = localStorage.getItem('dataM igrated');
    if (migrated) {
        console.log('Data already migrated');
        return;
    }
    
    // Get old mistakes
    const oldMistakes = localStorage.getItem('quizMistakes');
    
    if (oldMistakes) {
        console.log('Found old mistakes, migrating...');
        
        // Create default "General" course
        const generalCourse = await createCourse({
            name: 'General',
            description: 'Default course for imported quizzes',
            color: '#6B7280',
            icon: '📚'
        });
        
        // Parse and migrate mistakes
        try {
            const mistakes = JSON.parse(oldMistakes);
            for (const mistake of mistakes) {
                await saveMistake({
                    courseId: generalCourse.id,
                    quizId: null,
                    quizName: 'Imported Quiz',
                    question: mistake,
                    incorrectAnswer: -1,
                    correctAnswer: mistake.correct || 0
                });
            }
            console.log(`Migrated ${mistakes.length} mistakes`);
        } catch (e) {
            console.error('Error migrating mistakes:', e);
        }
        
        // Backup old data
        localStorage.setItem('quizMistakes_backup', oldMistakes);
        localStorage.removeItem('quizMistakes');
    } else {
        // Create default course even if no old data
        const courses = await getAllCourses();
        if (courses.length === 0) {
            await createCourse({
                name: 'General',
                description: 'Your default course',
                color: '#3B82F6',
                icon: '📚'
            });
            console.log('Created default General course');
        }
    }
    
    localStorage.setItem('dataMigrated', 'true');
    console.log('Migration complete');
}

// ============= EXPORT/IMPORT =============

async function exportAllData() {
    const data = {
        version: 1,
        exportDate: new Date().toISOString(),
        courses: await db.courses.toArray(),
        quizzes: await db.quizzes.toArray(),
        results: await db.results.toArray(),
        mistakes: await db.mistakes.toArray(),
        settings: await db.settings.toArray()
    };
    return data;
}

async function importData(data, merge = false) {
    if (!merge) {
        // Clear existing data
        await db.courses.clear();
        await db.quizzes.clear();
        await db.results.clear();
        await db.mistakes.clear();
        await db.settings.clear();
    }
    
    // Import data
    if (data.courses) await db.courses.bulkAdd(data.courses);
    if (data.quizzes) await db.quizzes.bulkAdd(data.quizzes);
    if (data.results) await db.results.bulkAdd(data.results);
    if (data.mistakes) await db.mistakes.bulkAdd(data.mistakes);
    if (data.settings) await db.settings.bulkAdd(data.settings);
    
    console.log('Data imported successfully');
}
