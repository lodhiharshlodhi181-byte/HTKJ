import axios from "axios"

const API=axios.create({
baseURL:"http://localhost:5000/api"
})

export const uploadPaper=(file)=>{

const fd=new FormData()
fd.append("file",file)

return API.post("/paper/upload",fd)
}