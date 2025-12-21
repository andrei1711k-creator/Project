import {useRef, useState, useEffect} from 'react'

const Login = () => {
    const userRef = useRef();
    const errRef = useRef();

    const [user, setUser] = useState();
    const [pwd, setPwd] = useState();
    const [errMsg, setErrMsg] = useState();
    const [success, setSuccess] = useState();

    useEffect(() => {
        userRef.current.focus();
    }, [])

    useEffect(() => {
        setErrMsg('')
    })

    return (
        <div>Login</div>
    )
}

export default Login