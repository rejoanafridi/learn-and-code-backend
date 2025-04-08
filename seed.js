require('dotenv').config()
const mongoose = require('mongoose')
const connectDB = require('./configs/db')
const Tutorial = require('./models/Tutorials')

const tutorials = [
    {
        title: 'React Basics',
        content: `# React Basics\nReact is a JavaScript library for building user interfaces.\n\n- **Components**: Reusable building blocks.\n- **Props**: Pass data to components.\n\nTry the code below to log a greeting!`,
        sampleCode: `console.log("Hello from React!");`
    },
    {
        title: 'JavaScript Advanced',
        content: `# JavaScript Advanced\nMaster advanced JavaScript concepts.\n\n- **Closures**: Functions that remember their scope.\n- **Prototypes**: Object inheritance in JS.\n- **Generators**: Functions that can pause execution.\n- **Proxy**: Custom behavior for object operations.\n\nTry this advanced example with closures and generators!`,
        sampleCode: `function* counter() {
    let count = 0;
    while (true) {
        yield count++;
    }
}

const gen = counter();
console.log(gen.next().value); // 0
console.log(gen.next().value); // 1
console.log(gen.next().value); // 2

// Closure example
function createCounter() {
    let privateCount = 0;
    return {
        increment() {
            privateCount++;
            return privateCount;
        },
        getCount() {
            return privateCount;
        }
    };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.getCount());  // 1`
    },
    {
        title: 'JavaScript Loops',
        content: `# JavaScript Loops\nLoops let you repeat tasks efficiently.\n\n- **for**: Good for a fixed number of iterations.\n- **while**: Runs until a condition is false.\n\nRun the code to see a countdown!`,
        sampleCode: `for (let i = 5; i > 0; i--) {\n  console.log(\`Countdown: \${i}\`);\n}`
    },
    {
        title: 'Node.js Intro',
        content: `# Node.js Intro\nNode.js lets you run JavaScript on the server.\n\n- **Modules**: Use \`require\` or \`import\`.\n- **Async**: Handle tasks like file reading.\n\nThis sample just logs a message (since we're client-side for now).`,
        sampleCode: `console.log("Node.js is awesome!");\nconst add = (a, b) => a + b;\nconsole.log("2 + 3 =", add(2, 3));`
    },
    {
        title: 'CSS Flexbox',
        content: `# CSS Flexbox\nA layout system for aligning items.\n\n- **flex-direction**: Row or column?\n- **justify-content**: Space items.\n\nThis is JS, but imagine styling!`,
        sampleCode: `console.log("Flexbox rocks!");`
    },
    {
        title: 'Async JavaScript',
        content: `# Async JavaScript\nHandle delays with promises.\n\n- **async/await**: Cleaner async code.\n- **Promises**: Resolve or reject.\n\nTry this async example!`,
        sampleCode: `async function fetchData() {\n  await new Promise((r) => setTimeout(r, 1000));\n  console.log("Data fetched!");\n}\nfetchData();`
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
