import {useContext} from "react"
import {AuthContext} from "../context/authcontext"

export default function useAuth(){
return useContext(AuthContext)
}