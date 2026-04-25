import axios from "axios"

const API=axios.create({
baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
})

export const uploadPaper=(file)=>{

const fd=new FormData()
fd.append("file",file)

return API.post("/paper/upload",fd)
}