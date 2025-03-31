
async function TasksPage() {
  const response = await fetch("http://localhost:3000/api/tasks", {
    cache: "no-store",
  })
  const tasks = await response.json()

  console.log(tasks)
  return (
    <div>page</div>
  )
}

export default TasksPage