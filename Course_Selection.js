class CourseModel {
    constructor() {
        this.courses = [];
        this.selectedCourses = [];
        this.totalCredits = 0;
    }

    async fetchCourses() {
        const response = await fetch('http://localhost:4232/courseList');
        this.courses = await response.json();
    }

    selectCourse(courseId) {
        const course = this.courses.find(course => course.courseId === courseId);
        if (course && !this.selectedCourses.includes(course)) {
            if (this.totalCredits + course.credit <= 18) {
                this.selectedCourses.push(course);
                this.totalCredits += course.credit;
            } else {
                alert("You can only choose up to 18 credits in one semester");
            }
        }
    }

    unselectCourse(courseId) {
        const courseIndex = this.selectedCourses.findIndex(course => course.courseId === courseId);
        if (courseIndex > -1) {
            this.totalCredits -= this.selectedCourses[courseIndex].credit;
            this.selectedCourses.splice(courseIndex, 1);
        }
    }
}

class CourseView {
    constructor() {
        this.availableCoursesContainer = document.getElementById('availableCourses');
        this.selectedCoursesContainer = document.getElementById('selectedCourses');
        this.totalCreditsContainer = document.getElementById('totalCredits');
        this.selectButton = document.getElementById('selectButton');
    }

    setController(controller) {
        this.controller = controller;
        this.selectButton.addEventListener('click', () => this.controller.handleSelectButtonClick());
        this.controller.init();
    }

    renderCourses() {
        this.availableCoursesContainer.innerHTML = '<strong>Available Courses</strong>';
        this.selectedCoursesContainer.innerHTML = '<strong>Selected Courses</strong>';
        
        this.controller.getCourses().forEach((course, index) => {
            const courseElement = document.createElement('div');
            courseElement.innerHTML = `${course.courseName} <br> ${course.required ? 'Compulsory' : 'Elective'} <br> ${course.credit} Credits`;
            courseElement.className = 'course';
            courseElement.style.backgroundColor = index % 2 === 0 ? 'lightgreen' : 'white';
            courseElement.addEventListener('click', () => {
                this.controller.handleCourseClick(course.courseId);
                courseElement.style.backgroundColor = 'deepskyblue';
            });
            this.availableCoursesContainer.appendChild(courseElement);
        });

        this.controller.getSelectedCourses().forEach((course, index) => {
            const courseElement = document.createElement('div');
            courseElement.innerHTML = `${course.courseName} <br> ${course.required ? 'Compulsory' : 'Elective'} <br> ${course.credit} Credits`;
            courseElement.className = 'selectedCourse';
            courseElement.style.backgroundColor = index % 2 === 0 ? 'lightgreen' : 'white';
            this.selectedCoursesContainer.appendChild(courseElement);
        });

        this.totalCreditsContainer.textContent = `Total Credits: ${this.controller.getTotalCredits()}`;
    }
}

class CourseController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    async init() {
        await this.model.fetchCourses();
        this.view.renderCourses();
    }

    getCourses() {
        return this.model.courses;
    }

    getSelectedCourses() {
        return this.model.selectedCourses;
    }

    getTotalCredits() {
        return this.model.totalCredits;
    }

    handleCourseClick(courseId) {
        if (this.getSelectedCourses().some(course => course.courseId === courseId)) {
            this.model.unselectCourse(courseId);
        } else {
            this.model.selectCourse(courseId);
        }
        this.view.renderCourses();
    }
    
    toggleCourseSelection(courseId) {
        const isSelected = this.model.selectedCourses.some(course => course.courseId === courseId);
        if (isSelected) {
            this.model.unselectCourse(courseId);
        } else {
            this.model.selectCourse(courseId);
        }
        // this.view.renderCourses();
        // Do not re-render courses here to wait for "Select" button click
    }

    handleSelectButtonClick() {
        const confirmation = confirm(`You have chosen ${this.model.totalCredits} credits for this semester. You cannot change once you submit. Do you want to confirm?`);
        if (confirmation) {
            this.view.selectButton.disabled = true;
            // Further actions after confirmation
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const model = new CourseModel();
    const view = new CourseView();
    const controller = new CourseController(model, view);
    view.setController(controller);
});
