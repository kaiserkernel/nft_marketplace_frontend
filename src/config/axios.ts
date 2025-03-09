import axios from 'axios'

axios.defaults.baseURL = process.env.REACT_APP_URL;

axios.defaults.headers.post['Content-Type'] = 'application/json';