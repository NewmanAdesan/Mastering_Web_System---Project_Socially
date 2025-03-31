
// #### THIS FILE IS FOR LEARNING PURPOSES. IT IS NOT USED IN OUR APPLICATION ####

interface Task {
    id: string;
    title: string;
    description: string;
    completed: boolean;
}

interface CreateTaskRequest {
    title: string;
}

export const tasks: Task[] = [
    {
        id: "1",
        title: "Create a new project",
        description: "This task will guide you through creating a new project.",
        completed: false
    },
    {
        id: "2",
        title: "Create a new task",
        description: "This task will guide you through creating a new task.",
        completed: false
    },
    {
        id: "3",
        title: "Create a new task",
        description: "This task will guide you through creating a new task.",
        completed: false
    },
];


// get request handler
export async function GET() {
    return Response.json(tasks);
}

// post request handler
export async function POST(request: Request) {
    try {
        const body: CreateTaskRequest = await request.json();

        if (!body.title) {
            return Response.json({ error: "Title is required" }, {status:400});
        }

        const newTask: Task = {
            id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            title: body.title,
            description: "",
            completed: false
        };

        tasks.push(newTask);

        return Response.json(newTask, {status: 201});
    } catch (error) {
        return Response.json({ error: "Invalid request body" }, {status: 400});
    }
}

// delete handler
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return Response.json({ error: "ID is required" }, {status:400});
        }

        const taskIndex = tasks.findIndex(task => task.id === id);

        if (taskIndex === -1) {
            return Response.json({ error: "Task not found" }, {status:404});
        }

        tasks.splice(taskIndex, 1);

        return Response.json({ message: "Task deleted successfully" }, {status: 200});
    } catch (error) {
        return Response.json({ error: "Invalid request body" }, {status: 400});
    }
}