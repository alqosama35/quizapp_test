// Map URL slugs to exported course JSON file paths.
// To share a course:
//   1. Export it via "Export Course" button in the app
//   2. Move the downloaded .json file into the shared-courses/ folder
//   3. Add a line here:  "your-slug": "shared-courses/your-file.json"
//   4. Share the link:   yourapp/index.html?course=your-slug
const SHARED_COURSES_REGISTRY = {
    // "cs101": "shared-courses/cs101.json",
    // "os102": "shared-courses/os102.json"
    "cloud": "shared-courses/course-cloud.json",
    "nlp": "shared-courses/course-nlp.json"
};
