import React, { Component } from 'react';
import styles from './Account.module.css';
import axios from '../axios';
import _arrayBufferToBase64 from '../utils/utils';

class Account extends Component {

    state = {
        userName: this.props.userName,
        formIsValid: true,
        avatar: null
    };

    updateUserNameField = (event) => {
        if (event.target.value !== '') {
            this.setState({formIsValid: true});
        }
        else {
            this.setState({formIsValid: false});
        }

        this.setState({ userName: event.target.value });
    }

    getAvatar = () => {
        axios.get('/users/' + this.props.userId + '/avatar', {responseType: 'arraybuffer'})
            .then((res) => {
                console.log(res);

                // convert ArrayBuffer to a String so we can render with an img tag
                // this fails for a 400KB file but not for a 200KB file
                //const base64String = btoa(String.fromCharCode(...new Uint8Array(res.data)));

                const base64String = _arrayBufferToBase64(res.data);

                this.setState({ avatar: base64String });
            })
            .catch((error) => {
                // an error is ok here, as the API returns a 404 if no avatar for this user
                console.log(error);
            });
    }

    confirmDeleteUser = () => {
        if  ( window.confirm("Whoa, hold up, are you sure you want to delete yourself?" )) {
            this.props.deleteUser();
        }
    }

    onChangeFile = (e) => {
        e.preventDefault();

        const bodyFormData = new FormData();
        bodyFormData.append('avatar', e.target.files[0]);

        // pass the selected file along to be uploaded
        axios({
            method: 'post',
            url: '/users/me/avatar',
            data: bodyFormData,
            headers: {'Content-Type': 'multipart/form-data'}
        })
        .then((res) => {
            console.log(res);

            this.getAvatar();
        })
        .catch((error) => {
            console.log(error);
        });
    }

    onDeleteAvatar = () => {
        axios.delete('/users/me/avatar')
        .then((res) => {
            console.log(res);

            this.setState({ avatar: null });
        })
        .catch((error) => {
            console.log(error);
        });
    }

    // don't want to be fetching the avatar image each render(), just when panel is opened
    componentDidMount = () => {
        this.getAvatar();
    }

    // this.props.userName shouldn't change until a name change is submitted in this form
    // this.state.userName is the working copy used in this form
    render () {
        let avatar = null;

        if (this.state.avatar) {
            
            const srcString = "data:image/png;base64," + this.state.avatar;

            avatar = 
                <div>
                    <img src={srcString} alt="Avatar" title="Your Avatar"/>
                </div>;
        }
        else {
            avatar = <h3 className={styles.AccountHeader}>No avatar for this user</h3>;
        }

        let deleteAvatarButton = null;

        if (this.state.avatar) {
            deleteAvatarButton = <p><button onClick={this.onDeleteAvatar}>Delete Avatar</button></p>;
        }

        return (
            <div className={styles.AccountPanel}>
                <h2 className={styles.AccountHeader}>{this.props.userName}'s Account Management</h2>
                <form 
                    className={styles.AccountNameControls}
                    onSubmit={(e) => this.props.updateUserName(e, this.state.userName)}>
                    <input 
                        className={styles.AccountField}
                        type="text" 
                        value={this.state.userName} 
                        onChange={this.updateUserNameField}/>
                    <input 
                        className={styles.AccountButton}
                        type="submit" 
                        value="Update Username" 
                        disabled={!this.state.formIsValid} />
                </form>
                <div className={styles.AvatarPanel}>
                    {avatar}
                    <p>
                        <input 
                            className={styles.AccountButton}
                            type="file" 
                            onChange={this.onChangeFile} />
                    </p>
                    {deleteAvatarButton}
                </div>
                <p><button onClick={this.confirmDeleteUser}>Delete Account</button></p>
            </div>
        );
    }
}

export default Account;