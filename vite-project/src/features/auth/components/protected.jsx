import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";
import React from 'react'
import { FaCircleNotch } from "react-icons/fa"
const Protected = ({children}) => {
    const { loading,user } = useAuth()


    if(loading){
        return (
            <main className="global-loader">
                <FaCircleNotch className="spinner" size={50} />
            </main>
        )
    }

    if(!user){
        return <Navigate to={'/'} />
    }
    
    return children
}

export default Protected