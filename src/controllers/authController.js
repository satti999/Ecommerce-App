
//const { hashPassword }= require('../helpers/authHelper.js');
//const{ userModel }= require('../models/user.model');
import { hashPassword } from "../helpers/authHelper.js"
import {User} from "../models/user.model.js"


console.log("wrking3")

const registerController = async(req, res)=>{
    try {
        console.log('registeration')
        const {name ,email,password,phone,address} =req.body
        console.log("Email", email);
        // Validation

        if(!name){
            res.send({error:"Name is Required"});
        }
        if(!email){
            res.send({error:"Email is Required"});
        }
        if(!password){
            res.send({error:"Password is Required"});
        }
        if(!phone){
            res.send({error:"Phone no is Required"});
        }
        if(!address){
            res.send({error:"Address is Required"});
        }
        // existing user

        const exisitingUser = await User.findOne({email})
        if (exisitingUser){
            
            return res.status(200).send({
                success:true,
                message:"Already Register please login ",
            })   
        }
        //register user

        const hashedPassword = await hashPassword(password)
        // save

        const user = await new User({name ,email,password:hashedPassword,phone,address}).save()

        res.status(201).send({
            sucess:true,
            message:'User Registeration Successfully',
            user

        })

        
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:"error in registeration",
            error:error,
        })
    }

}

export {
    registerController,
}

