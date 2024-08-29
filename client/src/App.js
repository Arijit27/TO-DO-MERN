import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';

function App() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [editingTask, setEditingTask] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [deletingTaskId, setDeletingTaskId] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [view, setView] = useState(token ? 'tasks' : 'login'); // Default to 'login' or 'tasks'
    const [username, setUsername] = useState('');
    useEffect(() => {
        if (token) {
            axios.get('http://localhost:5000/tasks', { headers: { Authorization: `Bearer ${token}` } })
                .then(response => setTasks(response.data))
                .catch(error => console.log(error));
        }
    }, [token]);

    useEffect(() => {
        localStorage.setItem('token', token);
    }, [token]);

    const addTask = () => {
        axios.post('http://localhost:5000/tasks', { title: newTask }, { headers: { Authorization: `Bearer ${token}` } })
            .then(response => setTasks([...tasks, response.data]))
            .catch(error => console.log(error));
        setNewTask('');
    };

    const deleteTask = (id) => {
        setDeletingTaskId(id);
        setTimeout(() => {
            axios.delete(`http://localhost:5000/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(() => setTasks(tasks.filter(task => task._id !== id)))
                .catch(error => console.log(error));
        }, 500);
    };

    const toggleCompletion = (id) => {
        const task = tasks.find(t => t._id === id);
        axios.put(`http://localhost:5000/tasks/${id}`, { completed: !task.completed }, { headers: { Authorization: `Bearer ${token}` } })
            .then(response => {
                const updatedTasks = tasks.map(t => t._id === id ? response.data : t);
                setTasks(updatedTasks);
            })
            .catch(error => console.log(error));
    };

    const handleEditClick = (task) => {
        setEditingTask(task._id);
        setEditingText(task.title);
    };

    const saveTask = (id) => {
        axios.put(`http://localhost:5000/tasks/${id}`, { title: editingText, completed: false }, { headers: { Authorization: `Bearer ${token}` } })
            .then(response => {
                const updatedTasks = tasks.map(task =>
                    task._id === id ? response.data : task
                );
                setTasks(updatedTasks);
                setEditingTask(null);
            })
            .catch(error => console.log(error));
    };

    const handleLogin = (token, username) => {
        setToken(token);
        setUsername(username);
        setView('tasks');
    };

    const handleRegister = () => {
        setView('login');
    };

    const handleLogout = () => {
        setToken('');
        localStorage.removeItem('token');
        setView('login');
        setUsername('');
    };

    return (
        <div className="container">
             <div className="left-half">
                <h1 className="app-title">TO-DO</h1>
            </div>
            <div className="right-half">
            {view === 'login' || view === 'register' ? (
                <div className="auth-container">
                    {view === 'login' ? (
                        <Login setToken={handleLogin} toggleView={() => setView('register')} />
                    ) : (
                        <Register setToken={handleRegister} toggleView={() => setView('login')} />
                    )}
                </div>
            ) : (
                <>
                    <h1 className="title">To-Do List : {username}</h1>
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                    <div className="add-task-form">
                        <input
                            type="text"
                            className="task-input"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="Add a new task"
                        />
                        <button className="add-task-btn" onClick={addTask}>Add Task</button>
                    </div>
                    <ul className="task-list">
                        {tasks.map(task => (
                            <li
                                key={task._id}
                                className={`task-item ${deletingTaskId === task._id ? 'fade-out' : ''}`}
                            >
                                {editingTask === task._id ? (
                                    <div className="edit-form">
                                        <input
                                            type="text"
                                            className="edit-input"
                                            value={editingText}
                                            onChange={(e) => setEditingText(e.target.value)}
                                        />
                                        <div className='task-actions'>
                                          <button className="save-btn" onClick={() => saveTask(task._id)}>Save</button>
                                        <button className="cancel-btn" onClick={() => setEditingTask(null)}>Cancel</button>  
                                        </div>
                                        
                                    </div>
                                ) : (
                                    <div className="task-content">
                                        <span className={`task-title ${task.completed ? 'completed' : ''}`}>
                                            {task.title}
                                        </span>
                                        <div className="task-actions">
                                            <button
                                                className="toggle-btn"
                                                onClick={() => toggleCompletion(task._id)}
                                            >
                                                {task.completed ? 'Undo' : 'Complete'}
                                            </button>
                                            <button
                                                className="edit-btn"
                                                onClick={() => handleEditClick(task)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => deleteTask(task._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </>
            )}
            </div>
        </div>
    );
}

export default App;
