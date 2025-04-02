// #### THIS FILE IS FOR LEARNING PURPOSES. IT IS NOT USED IN OUR APPLICATION ####


async function TasksPage() {
  const response = await fetch("http://localhost:3000/api/tasks", {
    cache: "no-store",
  })
  const tasks = await response.json()

  return (
    <div>page</div>
  )
}

export default TasksPage