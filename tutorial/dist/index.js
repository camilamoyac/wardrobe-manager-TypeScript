let student = "John";
let grade1 = parseFloat("5");
let grade2 = 8;
//let isApproved : boolean;
function average(num1, num2) {
    return (num1 + num2) / 2;
}
//isApproved = average(grade1, grade2) > 6;
//console.log(isApproved);
//arrays
let grades = ["8", "7", "9", "5", "6"];
function finalGrade(grades) {
    let sum = 0;
    grades.forEach(grade => sum += parseFloat(grade));
    return sum / grades.length;
}
function printStudent(student) {
    console.log("Name: ", student.name);
    console.log("Final grade: ", finalGrade(student.grades));
    if (typeof student.isApproved == "boolean") { //handling optional with typeof
        console.log("Is Approved: ", student.isApproved);
    }
}
let newStudent = {
    name: "Johnny",
    grades: ["7", "8", "6", "9"]
};
//printStudent(newStudent);
let students = [
    {
        name: "Derek",
        grades: ["7", "8", "6", "9"],
        isApproved: true
    },
    {
        name: "Amelia",
        grades: ["7", "9"]
    },
    {
        name: "Jules",
        grades: ["2", "5", "6", "5"],
        isApproved: false
    }
];
//students.forEach(student => printStudent(student));
//union & literal types
let size;
let id;
function buttonStyle(size) {
    let style;
    if (size == "small") {
        style = {
            height: "60px",
            width: "100px"
        };
    }
    else {
        style = {
            height: "80px",
            width: "140px"
        };
    }
    return style;
}
//console.log(buttonStyle("large"));
//null & undefined
function printId(id) {
    if (typeof id == "string") {
        console.log(id.toUpperCase());
    }
    else if (typeof id == "number") {
        console.log(id);
    }
    else {
        console.log("No ID");
    }
}
let studentId;
//printId(studentId);
//any
function doubleNum(num) {
    console.log(num * 2);
}
doubleNum(5);
