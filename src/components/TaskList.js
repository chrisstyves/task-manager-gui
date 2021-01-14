import React from 'react';
import Task from './Task';
import styles from './TaskList.module.css';

const taskList = (props) => {
    if (props.tasks.length === 0) {
        return <div className={styles.List}>
            <h3>No tasks yet! Add a task above to get started.</h3>
        </div>;
    }

    // sending task._id twice may seem redundant, but...
    // 'key' is used by react to uniquely identify the element in the DOM
    // 'taskId' is used by us when calling the API to manage tasks
    // https://reactjs.org/warnings/special-props.html
    return (
        <ul className={styles.List}>
            {props.tasks.map(task => (
                <Task 
                    key={task._id} 
                    taskId={task._id} 
                    taskName={task.description}
                    taskCompleted={task.completed}
                    updateTask={props.updateTask} 
                    deleteTask={props.deleteTask}/>
            ))}
        </ul>
    );
}

export default taskList;