let student = "John";
let grade1 = parseFloat("5");
let grade2 = 8;
//let isApproved : boolean;

function average(num1: number, num2: number){
    return (num1 + num2) / 2;
}

//isApproved = average(grade1, grade2) > 6;
//console.log(isApproved);

//arrays
let grades = ["8", "7", "9", "5", "6"]
function finalGrade(grades : string[]){
    let sum = 0;
    grades.forEach(grade => sum += parseFloat(grade));
    return sum / grades.length;
}

//console.log(finalGrade(grades));

//objects

interface Person {
    name : string,
    surname? : string,
    age? : number
}

interface Student extends Person{ //can be added later
    grades : string[],
    isApproved? : boolean  //? for optional, when we use optional, we need to handle it later or we will get undefined
}
function printStudent(student : Student){
    console.log("Name: ", student.name);
    console.log("Final grade: ", finalGrade(student.grades));
    if(typeof student.isApproved == "boolean"){  //handling optional with typeof
        console.log("Is Approved: ", student.isApproved);
    }
}

let newStudent = {
    name : "Johnny",
    grades : ["7", "8", "6", "9"]
}

//printStudent(newStudent);

let students : Student[] = [
    {
    name : "Derek",
    grades : ["7", "8", "6", "9"],
    isApproved : true
    },
    {
    name : "Amelia",
    grades : ["7", "9"]
    },
    {
    name : "Jules",
    grades : ["2", "5", "6", "5"],
    isApproved : false
    }
]

//students.forEach(student => printStudent(student));

//union & literal types

let size : "small";

let id : string | number;

function buttonStyle(size : "small" | "large"){
    let style : {height : string, width : string}

    if (size == "small"){
        style = {
            height : "60px",
            width : "100px"
        }
    } else {
        style = {
            height : "80px",
            width : "140px"
        }
    }

    return style;
} 

//console.log(buttonStyle("large"));

//null & undefined

function printId(id: string | number | null){  // turned on "strictNullChecks": true so it checks that actions can be performed for all types
    if ( typeof id == "string"){
        console.log(id.toUpperCase());
    }
    else if (typeof id == "number"){
        console.log(id);
    }
    else{
        console.log("No ID");
    }
    
}

let studentId;

//printId(studentId);

//any

function doubleNum(num : number){ //turned on "noimplicitany" = true *only works for functions
    console.log(num * 2);
}

doubleNum(5);