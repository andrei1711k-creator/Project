import { useState } from 'react'
import axios from 'axios'
import './header.css'

const baseURL = 'adsfdf'
const instance = axios.create({
    baseURL: baseURL,
    timeout: 1000,
    method: ['GET', 'POST'],
    withCredentials: true
})

export default function Header() {
    const [account, setAccount] = useState('')

    const getAccountIcon = async() => {
        const response = await instance.get(`${baseURL}/getUserIcon`)
    }

    return(
        <div className="Header">

        </div>
    )
}