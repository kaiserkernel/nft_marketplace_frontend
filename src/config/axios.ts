import axios from 'axios'

export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

export const axiosFileInstance = axios.create({
  baseURL: process.env.REACT_APP_URL || "",
  headers: {
    "Content-Type": "multipart/form-data",
  },
});;
