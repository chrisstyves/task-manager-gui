import React, { Component } from 'react';
import styles from './Task.module.css';

class Task extends Component {
    state = {
        editMode: false,
        formIsValid: true,
        taskName: '',
        taskCompleted: true
    };

    onEditMode = () => {
        this.setState({ editMode: true });
    }

    onEditComplete = (event) => {
        event.preventDefault();
        this.setState({ editMode: false });
        
        // pass the update back up the chain, will cause a re-render here
        this.props.updateTask(this.props.taskId, { description: this.state.taskName });
    }

    onEditCancel = () => {
        this.setState({ editMode: false });
    }

    handleChange = (event) => {
        if (event.target.value !== '') {
            this.setState({formIsValid: true});
        }
        else {
            this.setState({formIsValid: false});
        }

        this.setState({ taskName: event.target.value });
    }

    onChangeCompleted = (event) => {
        // pass the update back up the chain
        console.log(event.target.checked);
        this.props.updateTask(this.props.taskId, { completed: event.target.checked });
        this.setState({ taskCompleted: event.target.checked });
    }

    componentDidMount () {
        this.setState({ taskName: this.props.taskName, taskCompleted: this.props.taskCompleted });
    }

    render () {
        let task = null;
        if (this.state.editMode) {
            task = 
                <li className={styles.Task}>
                    <form className={styles.EditForm} onSubmit={this.onEditComplete}>
                        <input 
                            type="text"
                            placeholder="Enter a task name"
                            value={this.state.taskName}
                            onChange={this.handleChange} />
                        <input 
                            className={styles.TaskInputButton} 
                            type="submit" 
                            value="update" 
                            disabled={!this.state.formIsValid} />
                    </form>
                    <button onClick={this.onEditCancel}>cancel</button>
                </li>;
        }
        else {
            let taskNameStyle = this.state.taskCompleted
                ? styles.TaskNameCompleted : styles.TaskName;

            task = 
                <li className={styles.Task}>
                    <input 
                        className={styles.TaskCompleted}
                        type="checkbox" 
                        onChange={this.onChangeCompleted} 
                        checked={this.state.taskCompleted} />
                    <span  
                        className={taskNameStyle}
                        onClick={this.onEditMode}
                        title="Click to edit the name of this task">
                        {this.props.taskName}
                    </span>
                    <button 
                        className={styles.DeleteButton}
                        onClick={() => this.props.deleteTask(this.props.taskId)}
                        title="Delete this task">X
                    </button>
                </li>;
        }

        return task;
    }
}

export default Task;