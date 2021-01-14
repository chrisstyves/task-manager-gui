import React, { Component } from 'react';
import axios from './axios';
import Toolbar from './components/Navigation/Toolbar';
import TaskList from './components/TaskList';
import TaskControls from './components/TaskControls';
import Modal from './components/UI/Modal/Modal';
import Account from './components/Account';

// Task Manager API URL
// https://cstyves-task-manager-api.herokuapp.com

class App extends Component {
    state = {
        authToken: undefined,
        taskList: [],
        loading: false,
        creatingAcct: false,
        createAcctForm: {
            name: '',
            email: '',
            password: ''
        },
        loggingIn: false,
        loginForm: {
            email: '',
            password: ''
        },
        accountPanel: false,
        userName: '',
        userId: ''
    }

    // delete a task by its id
    // usually invoked via the button in that task's list element
    deleteTaskHandler = (id) => {
        console.log('deleting ' + id + '...');

        axios.delete('/tasks/' + id)
            .then(res => {
                console.log(res);
                this.getTasks();
            })
            .catch(error => {
                console.error(error);
            });
    }

    // update a task by its id, and an object with fields to update
    // e.g. { description: "awesome task", completed: "true"}
    // usually invoked via clicking a task div or checkbox
    updateTaskHandler = (id, updates) => {
        console.log ('updating ' + id + '...');

        axios.patch('/tasks/' + id, updates)
            .then(res => {
                console.log(res);
                this.getTasks();
            })
            .catch(error => {
                console.error(error);
            });
    }

    createAcctHandler = () => {
        this.setState({creatingAcct: true});
    }

    createAcctCancelHandler = () => {
        this.setState({creatingAcct: false});

        // reset the form
        this.setState({
            createAcctForm: {
                name: '',
                email: '',
                password: ''
            }
        });
    }

    nameChangeHandler = (event) => {
        this.setState(prevState => ({
            createAcctForm: {
                ...prevState.createAcctForm,
                name: event.target.value
            }
        }));
    }

    emailChangeHandler = (event) => {
        this.setState(prevState => ({
            createAcctForm: {
                ...prevState.createAcctForm,
                email: event.target.value
            }
        }));
    }

    passwordChangeHandler = (event) => {
        this.setState(prevState => ({
            createAcctForm: {
                ...prevState.createAcctForm,
                password: event.target.value
            }
        }));
    }

    loginEmailChangeHandler = (event) => {
        this.setState(prevState => ({
            loginForm: {
                ...prevState.loginForm,
                email: event.target.value
            }
        }));
    }

    loginPasswordChangeHandler = (event) => {
        this.setState(prevState => ({
            loginForm: {
                ...prevState.loginForm,
                password: event.target.value
            }
        }));
    }

    // Account Creation
    createAcctSubmitHandler = (event) => {
        event.preventDefault();
        console.log('Creating an account!');
        this.setState({loading: true});

        axios.post('/users', {
            name: this.state.createAcctForm.name,
            email: this.state.createAcctForm.email,
            password: this.state.createAcctForm.password
        })
        .then((res) => {
            console.log(res);

            this.setState({
                loading: false,
                creatingAcct: false, 
                createAcctForm: {
                    name: '',
                    email: '',
                    password: ''
                }});

            this.setState({
                userName: res.data.user.name,
                userId: res.data.user._id
            });

            this.setState({authToken: res.data.token});

            // save the token in axios so we don't have to build the headers each time
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + this.state.authToken;

            this.getTasks();
        })
        .catch((error) => {
            if (error.response.data.message) {
                // TODO: the message does explain the problem(s), but not in the cleanest way,
                // could use some polish
                alert(error.response.data.message);
            }
            else {
                alert("Couldn't create account. It's possible that the email address is already taken.");
            }

            this.setState({loading: false});
        })
    }

    // handles login/logout
    authHandler = () => {
        if (!this.state.authToken) {
            // This will bring up the login modal
            this.setState({loggingIn: true});
        }
        else {
            console.log('Logging out!');
            this.setState({loading: true});

            axios.post('/users/logout')
            .then((res) => {
                console.log(res);

                // cleanup
                this.setState({
                    authToken: undefined,
                    taskList: [],
                    accountPanel: false
                });

                // user cleanup
                this.setState({
                    userName: '',
                    userId: ''
                });

                // remove header in axios config
                delete axios.defaults.headers.common['Authorization'];
            })
            .catch(error => {
                console.error(error);
            })
            .finally(() => {
                this.setState({loading: false});
            })
        }
    }

    // login cancelled, typically from closing the login modal
    loginCancelHandler = () => {
        this.setState({loggingIn: false});

        // reset the form
        this.setState({
            loginForm: {
                email: '',
                password: ''
            }
        });
    }

    loginSubmitHandler = (event) => {

        event.preventDefault(); 
        console.log('Logging in!');

        this.setState({loading: true});

        axios.post('/users/login', 
        {
            email: this.state.loginForm.email,
            password: this.state.loginForm.password
        })
        .then((res) => {
            console.log(res);

            this.setState({authToken: res.data.token});

            this.setState({
                userName: res.data.user.name,
                userId: res.data.user._id
            });

            this.setState({
                loggingIn: false, 
                loginForm: {
                    email: '',
                    password: ''
                }});

            // save the token in axios so we don't have to build the headers each time
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + this.state.authToken;

            // Populate the task list with this user's tasks
            this.getTasks();
        })
        .catch(error => {
            alert('That username/password combination was not found.');
        })
        .finally(() => {
            this.setState({loading: false});
        })
    }

    accountPanelHandler = () => {
        const prevState = this.state.accountPanel;

        this.setState({
            accountPanel: !prevState
        });
    }

    // updateUserNameField = (event) => {
    //     this.setState({ userName: event.target.value });
    // }

    getTasks = () => {
        axios.get('/tasks')
            .then(res => {               
                console.log(res);

                let taskList = [];
                res.data.forEach(element => {
                    taskList.push(element)
                });
                this.setState({taskList});
            })
            .catch(error => {
                console.error(error);
            });
    }

    updateUserName = (event, name) => {
        // prevent browser refresh
        event.preventDefault();

        axios.patch('/users/me', {name})
            .then(res => {
                console.log(res);
                this.setState({userName: name});
            })
            .catch(error => {
                console.error(error);
            });
    }

    deleteUser = () => {
        axios.delete('/users/me')
            .then((res) => {
                console.log(res);
                this.setState({
                    authToken: undefined,
                    taskList: [],
                    accountPanel: false,
                    userName: '',
                    userId: ''
                });
            })
            .catch((error) => {
                console.error(error);
            });
    }
    
    render () {
        const acctModals = 
            <>
            <Modal
                show={this.state.creatingAcct}
                modalClosed={this.createAcctCancelHandler}>
                <form onSubmit={this.createAcctSubmitHandler}>
                    <h2 style={{color: 'black'}}>Create an account</h2>
                    <p><input 
                        type='text' 
                        value={this.state.createAcctForm.name} 
                        placeholder="Username" 
                        onChange={this.nameChangeHandler} /></p>
                    <p><input 
                        type='email' 
                        value={this.state.createAcctForm.email}
                        placeholder="email" 
                        onChange={this.emailChangeHandler}/></p>
                    <p><input 
                        type='password' 
                        value={this.state.createAcctForm.password}
                        placeholder="Password" 
                        onChange={this.passwordChangeHandler}/></p>
                    <p><input 
                        type='submit' 
                        value={this.state.loading ? 'Please Wait...' : 'submit'}/></p>
                </form>
            </Modal>
            <Modal
                show={this.state.loggingIn}
                modalClosed={this.loginCancelHandler}>
                <form onSubmit={this.loginSubmitHandler}>
                <h2 style={{color: 'black'}}>Log in</h2>
                    <p><input 
                        type='email' 
                        value={this.state.loginForm.email} 
                        placeholder="email" 
                        onChange={this.loginEmailChangeHandler}/></p>
                    <p><input 
                        type='password' 
                        value={this.state.loginForm.password} 
                        placeholder="Password" 
                        onChange={this.loginPasswordChangeHandler}/></p>
                    <p><input 
                        type='submit' 
                        value={this.state.loading ? 'Please Wait...' : 'submit'}/></p>
                </form>
            </Modal>
            </>;

        const accountPanel = this.state.accountPanel 
            ? <Account 
                userName={this.state.userName} 
                userId={this.state.userId}
                updateUserName={this.updateUserName}
                deleteUser={this.deleteUser}/>
            : null;

        const taskManagement = this.state.authToken
            ? <>
                <TaskControls getTasks={this.getTasks} />                
                <TaskList 
                    tasks={this.state.taskList} 
                    updateTask={this.updateTaskHandler}
                    deleteTask={this.deleteTaskHandler} />
            </>
            : null;

        return (
            <div>
                {acctModals}
                <h1>Task Manager</h1>
                <Toolbar 
                    loggedIn={this.state.authToken} 
                    auth={this.authHandler} 
                    createAcct={this.createAcctHandler}
                    accountPanel={this.accountPanelHandler}/>
                {accountPanel}
                {taskManagement}
            </div>
        );
    }
}


export default App;
