document.getElementById('taskForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const taskName = document.getElementById('taskName').value;
    const deadline = document.getElementById('deadline').value;
    const userEmail = document.getElementById('userEmail').value; // Capture the email

    fetch('/addTask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskName, deadline, email: userEmail }), // Include email in the request
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        fetchTasks(); // Refresh task list after adding a task
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

// Function to format the deadline in 12-hour format with "AM/PM"
function formatDeadline(deadline) {
    const date = new Date(deadline);
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    };
    return `Deadline: ${date.toLocaleString('en-US', options)}`;
}

// Function to fetch and display tasks
function fetchTasks() {
    fetch('/getTasks')
        .then(response => response.json())
        .then(tasks => {
            const taskList = document.getElementById('taskList');
            taskList.innerHTML = ''; // Clear the list before adding tasks
            tasks.forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.className = 'task-item';
                taskItem.innerHTML = `
                    <span>${task.taskName} - ${formatDeadline(task.deadline)}</span>
                    <button onclick="deleteTask(${task.id})">Delete</button>
                `;
                taskList.appendChild(taskItem);
            });
        })
        .catch(error => console.error('Error fetching tasks:', error));
}

// Function to delete a task
function deleteTask(taskId) {
    console.log(`Delete button clicked for task ID: ${taskId}`); // Log task ID
    fetch(`/deleteTask/${taskId}`, {
        method: 'DELETE'
    })
    .then(response => {
        console.log('Response status:', response.status); // Log response status
        if (response.ok) {
            fetchTasks(); // Refresh task list after deletion
        } else {
            console.error('Failed to delete task');
        }
    })
    .catch(error => console.error('Error deleting task:', error));
}

// Call fetchTasks to load tasks on page load
document.addEventListener('DOMContentLoaded', fetchTasks);
