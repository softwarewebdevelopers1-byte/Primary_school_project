import bcrypt from "bcrypt"
let password="staff123"
async function hashPassword(){
    let hash = await bcrypt.hash(password,10)
    console.log(hash)
}
hashPassword()
