const express = require ('express');
const mongoose = require ('mongoose');
const cors = require('cors'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs')
  //it is important to take data from frontend ..command:- npm i cors

const app = express();

app.use(express.json());
app.use(cors()) // using cors as middleware && enabling this ..


//configure multer for image uploads
const storage = multer.diskStorage({
  destination:(req,file,cb)=>{
    const uploadPath=path.join(__dirname,'uploads/');// directory for uploaded images
    if(!fs.existsSync(uploadPath)){
      fs.mkdirSync(uploadPath, { recursive: true }); // create directory  if it does not exist
    }
    cb(null,uploadPath);
  },
  filename:(req,file,cb)=>{
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random()*1E9);
    cb(null,file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer ({ storage:storage});

mongoose.connect('mongodb://127.0.0.1:27017/userlogin')
  .then(() => {
    console.log("MongoDB connection successful!");
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });

   

  app.listen(3000,()=>{
    console.log("api is running port on http://localhost:3000");
  })


  const signupSchema= new mongoose.Schema({

    userName:{
      type:String,
      // required:true,
      // unique:true
    },
    email:{
      type:String,
      // required:true,
      // unique:true
    },
    password:{
      type:String,
      // required:true,
      // unique:true
    },

    age:{
      type:Number,
      // required:true,
      // unique:true
    },
    phonenumber:{
      type:String,
      // required:true,
      // unique:true
    },
    college:{
      type:String,
      // required:true,
      // unique:true
    },
    status:{
      type:String,
      // required:true,
    },
    image:{
      type:String,
      required:false,
    }
  });

  const signupModel=mongoose.model("signupModel",signupSchema);

  
    

  // post or save or create api 

  app.post("/Signup",upload.single('image'),async(req,res)=>{

    try{

        const {userName,email,password,age,phonenumber,college,status}=req.body;
        const image=req.file?req.file.path:null;
        const newSignup=new signupModel({
            userName,
            email,
            password,
            age,
            phonenumber,
            college,
            status,
            image
        })
        await newSignup.save();
        res.status(200).json({message:"user registred succesfully "});



    }
    catch(error){
        res.status(400).json({message:"Server Error",error})
    }
})

// get api..............

app.get("/users", async (req, res) => {
  try {
      const users = await signupModel.find();
      res.status(200).json({ message: 'Users fetched successfully', users });
  } catch (err) {
      res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

// Update Api ....

app.put("/user/:id", async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
      const user = await signupModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: 'User updated successfully', user });
  } catch (err) {
      res.status(400).json({ message: 'Error updating user', error: err.message });
  }
});

// Delete User API
app.delete("/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
      const user = await signupModel.findByIdAndDelete(id);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
      res.status(400).json({ message: 'Error deleting user', error: err.message });
  }
});

//login api

app.post('/login',async(req,res)=>{
  const {userName,password}=req.body;
  console.log(req.body);
  try{
      if(!userName){

          return res.status(404).json({messsage:'Invailid   UserName '});
      }
      // find the user by email
          
      const user = await signupModel.findOne({
          userName
      })
  
      if(user.password!==password){ 
          return res.status(401).json({message:'Invailid password'});
      }

      res.json({message:'Login Success'});

  }
  catch(error){
      res.status(500).json({error:'An error during login'});

  }
})