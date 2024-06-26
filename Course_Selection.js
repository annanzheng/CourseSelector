class CourseModel {
    constructor() {
        this.courses = [];
        this.selectedCourses = [];
        this.totalCredits = 0;
    }

    async fetchCourses() {
        const response = await fetch('http://localhost:4232/courseList');
        this.courses = await response.json();
        this.courses.forEach(course => {
            course.isSelected = false;
         });         
    }

    selectCourse(courseId) {
        const course = this.courses.find(course => course.courseId === courseId);
        if (course) {
            if (!course.isSelected) { // Add this condition to prevent selecting already selected course
                if (this.totalCredits + course.credit <= 18) {
                    this.selectedCourses.push(course);
                    this.totalCredits += course.credit;
                    course.isSelected = true; // Mark the course as selected
                } else {
                    alert("You can only choose up to 18 credits in one semester");
                }
            } else {
                this.unselectCourse(courseId); // If course is already selected, unselect it
            }
        }
    }
    
    unselectCourse(courseId) {
        const courseIndex = this.selectedCourses.findIndex(course => course.courseId === courseId);
        if (courseIndex > -1) {
            this.totalCredits -= this.selectedCourses[courseIndex].credit;
            this.selectedCourses.splice(courseIndex, 1);
            this.courses.find(course => course.courseId === courseId).isSelected = false; // Mark the course as not selected
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
            courseElement.style.backgroundColor = course.isSelected === true ? 'deepskyblue' : index % 2 === 0 ? 'lightgreen' : 'white';
            courseElement.addEventListener('click', () => {
                this.controller.handleCourseClick(course.courseId);
            });
            this.availableCoursesContainer.appendChild(courseElement);
        });
        this.totalCreditsContainer.textContent = `Total Credits: ${this.controller.getTotalCredits()}`;
    }
    renderSelectedCourses() {
        this.selectedCoursesContainer.innerHTML = '<strong>Selected Courses</strong>';
        this.controller.getSelectedCourses().forEach((course, index) => {
            const courseElement = document.createElement('div');
            courseElement.innerHTML = `${course.courseName} <br> ${course.required ? 'Compulsory' : 'Elective'} <br> ${course.credit} Credits`;
            courseElement.className = 'selectedCourse';
            courseElement.style.backgroundColor = index % 2 === 0 ? 'lightgreen' : 'white';
            this.selectedCoursesContainer.appendChild(courseElement);
        });
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
            this.isSelected = false;
            
            
        } else {
            this.model.selectCourse(courseId);
            this.isSelected = true;
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
        // Call the new method to render selected courses upon confirmation
            this.view.renderSelectedCourses();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const model = new CourseModel();
    const view = new CourseView();
    const controller = new CourseController(model, view);
    view.setController(controller);
});