export const loadTasks = async () => {
  // Calls the Main process to get data from the JSON file
  const data = await window.db.getItems('tasks')
  return data || []
}

export const saveTasks = async (tasks) => {
  // Sends the data to the Main process to write to the JSON file
  await window.db.setItems('tasks', tasks)
}