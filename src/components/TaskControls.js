import React, { Component } from 'react';
import axios from '../axios';
import styles from './TaskControls.module.css';

class TaskControls extends Component {

    state = {
        taskName: '',
        formIsValid: false
    };

    addTaskHandler = (event) => {
        // save task name
        const taskName = this.state.taskName;

        // prevent browser refresh
        event.preventDefault();

        // add task
        axios.post('/tasks', {description: taskName})
            .then(res => {
                console.log(res);
                this.props.getTasks();
            })
            .catch(error => {
                console.error(error);
            });

        // reset the form
        this.setState({ 
            taskName: '',
            formIsValid: false
        });
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

    render () {
        return (
            <div className={styles.TaskControls}>
                <form onSubmit={this.addTaskHandler}>
                    <input 
                        className={styles.TaskControlsField}
                        type="text"
                        placeholder="Enter a task name"
                        value={this.state.taskName}
                        onChange={this.handleChange} />
                    <input 
                        type="submit" 
                        value="Add Task" 
                        className={styles.TaskControlsButton}
                        disabled={!this.state.formIsValid} />
                </form>
            </div>
        );
    }
}

export default TaskControls;