require('dotenv').config()
const mongoose = require('mongoose')
const connectDB = require('./configs/db')
const Tutorial = require('./models/Tutorials')

const tutorials = [
    {
        title: 'What is a Closure in JavaScript?',
        content:
            '# What is a Closure in JavaScript?\n\nA closure is a function that remembers its outer variables even after the outer function has finished executing.',
        sampleCode:
            'function outer() {\n  let count = 0;\n  return function inner() {\n    count++;\n    console.log(count);\n  };\n}\nconst counter = outer();\ncounter();\ncounter();',
        translations: [
            {
                language: 'en',
                title: 'What is a Closure in JavaScript?',
                content:
                    '# What is a Closure in JavaScript?\n\nA closure is a function that remembers its outer variables even after the outer function has finished executing.'
            },
            {
                language: 'ar',
                title: 'ما هو الإغلاق في جافا سكريبت؟',
                content:
                    '# ما هو الإغلاق في جافا سكريبت؟\n\nالإغلاق هو دالة تتذكر المتغيرات الخارجية حتى بعد انتهاء تنفيذ الدالة الخارجية.'
            },
            {
                language: 'bn',
                title: 'জাভাস্ক্রিপ্টে ক্লোজার কী?',
                content:
                    '# জাভাস্ক্রিপ্টে ক্লোজার কী?\n\nক্লোজার হল এমন একটি ফাংশন যা তার বাইরের ফাংশনের ভেরিয়েবলগুলো মনে রাখে, এমনকি বাইরের ফাংশনের এক্সিকিউশন শেষ হলেও।'
            }
        ]
    },
    {
        title: 'Difference between var, let, and const?',
        content:
            '# Difference between var, let, and const?\n\n- `var`: Function scoped and can be redeclared.\n- `let`: Block scoped and can be reassigned.\n- `const`: Block scoped and cannot be reassigned.',
        sampleCode:
            'var a = 10;\nlet b = 20;\nconst c = 30;\n\nb = 25;\n// c = 35; // This will throw an error',
        translations: [
            {
                language: 'en',
                title: 'Difference between var, let, and const?',
                content:
                    '# Difference between var, let, and const?\n\n- `var`: Function scoped and can be redeclared.\n- `let`: Block scoped and can be reassigned.\n- `const`: Block scoped and cannot be reassigned.'
            },
            {
                language: 'ar',
                title: 'الفرق بين var و let و const؟',
                content:
                    '# الفرق بين var و let و const؟\n\n- `var`: لها نطاق دالة ويمكن إعادة تعريفها.\n- `let`: لها نطاق كتلة ويمكن إعادة تعيينها.\n- `const`: لها نطاق كتلة ولا يمكن إعادة تعيينها.'
            },
            {
                language: 'bn',
                title: 'var, let এবং const এর মধ্যে পার্থক্য কী?',
                content:
                    '# var, let এবং const এর মধ্যে পার্থক্য কী?\n\n- `var`: ফাংশন স্কোপড এবং পুনরায় ঘোষণা করা যায়।\n- `let`: ব্লক স্কোপড এবং পুনরায় অ্যাসাইন করা যায়।\n- `const`: ব্লক স্কোপড এবং পুনরায় অ্যাসাইন করা যায় না।'
            }
        ]
    },
    {
        title: 'What is the difference between == and ===?',
        content:
            '# What is the difference between == and ===?\n\n- `==` checks for value equality with type coercion.\n- `===` checks for both value and type equality.',
        sampleCode:
            "console.log(5 == '5');  // true\nconsole.log(5 === '5'); // false",
        translations: [
            {
                language: 'en',
                title: 'What is the difference between == and ===?',
                content:
                    '# What is the difference between == and ===?\n\n- `==` checks for value equality with type coercion.\n- `===` checks for both value and type equality.'
            },
            {
                language: 'ar',
                title: 'ما الفرق بين == و ===؟',
                content:
                    '# ما الفرق بين == و ===؟\n\n- `==` يتحقق من تساوي القيم مع تحويل النوع.\n- `===` يتحقق من تساوي القيم والنوع معًا.'
            },
            {
                language: 'bn',
                title: '== এবং === এর মধ্যে পার্থক্য কী?',
                content:
                    '# == এবং === এর মধ্যে পার্থক্য কী?\n\n- `==` টাইপ কনভার্সন সহ মান যাচাই করে।\n- `===` মান এবং টাইপ উভয় যাচাই করে।'
            }
        ]
    },
    {
        title: 'Explain Event Delegation in JavaScript.',
        content:
            '# Explain Event Delegation in JavaScript.\n\nEvent delegation is a technique of using a single event listener on a parent element to handle events from its children.',
        sampleCode:
            "document.getElementById('list').addEventListener('click', function(e) {\n  if (e.target.tagName === 'LI') {\n    console.log('List item clicked:', e.target.textContent);\n  }\n});",
        translations: [
            {
                language: 'en',
                title: 'Explain Event Delegation in JavaScript.',
                content:
                    '# Explain Event Delegation in JavaScript.\n\nEvent delegation is a technique of using a single event listener on a parent element to handle events from its children.'
            },
            {
                language: 'ar',
                title: 'اشرح تفويض الحدث في جافا سكريبت.',
                content:
                    '# اشرح تفويض الحدث في جافا سكريبت.\n\nتفويض الحدث هو تقنية لاستخدام مستمع حدث واحد على عنصر الأب لمعالجة الأحداث من الأبناء.'
            },
            {
                language: 'bn',
                title: 'জাভাস্ক্রিপ্টে ইভেন্ট ডেলিগেশন ব্যাখ্যা করুন।',
                content:
                    '# জাভাস্ক্রিপ্টে ইভেন্ট ডেলিগেশন ব্যাখ্যা করুন।\n\nইভেন্ট ডেলিগেশন হল একটি প্যারেন্ট এলিমেন্টে একটি ইভেন্ট লিসেনার ব্যবহার করে চাইল্ড এলিমেন্টগুলোর ইভেন্ট হ্যান্ডেল করার কৌশল।'
            }
        ]
    },
    {
        title: 'What is hoisting in JavaScript?',
        content:
            "# What is hoisting in JavaScript?\n\nHoisting is JavaScript's behavior of moving declarations to the top of the current scope before code execution.",
        sampleCode: 'console.log(a); // undefined\nvar a = 5;',
        translations: [
            {
                language: 'en',
                title: 'What is hoisting in JavaScript?',
                content:
                    "# What is hoisting in JavaScript?\n\nHoisting is JavaScript's behavior of moving declarations to the top of the current scope before code execution."
            },
            {
                language: 'ar',
                title: 'ما هو الرفع (Hoisting) في جافا سكريبت؟',
                content:
                    '# ما هو الرفع (Hoisting) في جافا سكريبت؟\n\nالرفع هو سلوك جافا سكريبت بنقل التصريحات إلى أعلى النطاق الحالي قبل تنفيذ الكود.'
            },
            {
                language: 'bn',
                title: 'জাভাস্ক্রিপ্টে হোইস্টিং কী?',
                content:
                    '# জাভাস্ক্রিপ্টে হোইস্টিং কী?\n\nহোইস্টিং হল জাভাস্ক্রিপ্টের একটি আচরণ যেখানে কোড এক্সিকিউশনের আগে ভ্যারিয়েবল ও ফাংশন ডিক্লারেশন উপরের দিকে উঠিয়ে দেওয়া হয়।'
            }
        ]
    },
    {
        title: 'What are Promises in JavaScript?',
        content:
            '# What are Promises in JavaScript?\n\nA Promise is an object that represents the eventual completion or failure of an asynchronous operation.',
        sampleCode:
            "const promise = new Promise((resolve, reject) => {\n  setTimeout(() => resolve('Success!'), 1000);\n});\n\npromise.then(data => console.log(data));",
        translations: [
            {
                language: 'en',
                title: 'What are Promises in JavaScript?',
                content:
                    '# What are Promises in JavaScript?\n\nA Promise is an object that represents the eventual completion or failure of an asynchronous operation.'
            },
            {
                language: 'ar',
                title: 'ما هي الوعود (Promises) في جافا سكريبت؟',
                content:
                    '# ما هي الوعود (Promises) في جافا سكريبت؟\n\nالوعد هو كائن يمثل النجاح أو الفشل النهائي لعملية غير متزامنة.'
            },
            {
                language: 'bn',
                title: 'জাভাস্ক্রিপ্টে প্রমিস (Promise) কী?',
                content:
                    '# জাভাস্ক্রিপ্টে প্রমিস (Promise) কী?\n\nপ্রমিস হল একটি অবজেক্ট যা অ্যাসিনক্রোনাস অপারেশনের সফলতা বা ব্যর্থতাকে প্রতিনিধিত্ব করে।'
            }
        ]
    },
    {
        title: "Explain the 'this' keyword in JavaScript.",
        content:
            "# Explain the 'this' keyword in JavaScript.\n\nThe `this` keyword refers to the object from which the function was called.",
        sampleCode:
            "const person = {\n  name: 'Alice',\n  greet() {\n    console.log('Hello, ' + this.name);\n  }\n};\nperson.greet();",
        translations: [
            {
                language: 'en',
                title: "Explain the 'this' keyword in JavaScript.",
                content:
                    "# Explain the 'this' keyword in JavaScript.\n\nThe `this` keyword refers to the object from which the function was called."
            },
            {
                language: 'ar',
                title: "اشرح الكلمة المفتاحية 'this' في جافا سكريبت.",
                content:
                    "# اشرح الكلمة المفتاحية 'this' في جافا سكريبت.\n\nتشير الكلمة المفتاحية `this` إلى الكائن الذي تم استدعاء الدالة منه."
            },
            {
                language: 'bn',
                title: "জাভাস্ক্রিপ্টে 'this' কীওয়ার্ড ব্যাখ্যা করুন।",
                content:
                    "# জাভাস্ক্রিপ্টে 'this' কীওয়ার্ড ব্যাখ্যা করুন।\n\n`this` কীওয়ার্ড ফাংশন যেখান থেকে কল করা হয়েছে সেই অবজেক্টকে নির্দেশ করে।"
            }
        ]
    }
]

const seedDB = async () => {
    try {
        await connectDB()
        await Tutorial.deleteMany({})
        await Tutorial.insertMany(tutorials)
        console.log('Tutorials seeded successfully!')
        process.exit(0)
    } catch (error) {
        console.error('Seeding error:', error.message)
        process.exit(1)
    }
}

seedDB()
