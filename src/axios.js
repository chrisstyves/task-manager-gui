import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://cstyves-task-manager-api.herokuapp.com'
});

export default instance;