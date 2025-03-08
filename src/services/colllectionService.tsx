import axios, { isAxiosError } from "axios";

const createCollection = () => {
    axios.post("api/collection")
}

const fetchCollection = () => {

}

export {createCollection, fetchCollection}