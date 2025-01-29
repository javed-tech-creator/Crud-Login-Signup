import React, { useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { MdDelete, MdFileDownload } from "react-icons/md";
import { FaDownload, FaEdit } from "react-icons/fa";
import Swal from 'sweetalert2';
 import axios from 'axios';  // it is middleware that connects frontend to backend 
 import jsPDF from 'jspdf';
 import * as autoTable from 'jspdf-autotable';
 import * as XLSX from "xlsx";

 
function DashBoard() {
  const [isModelOpen, setIsModalOpen] = useState(false);
  const[ users,setUsers]=useState([]);
  const[formData,setFormData]=useState({
    userName:"",
    email:"",
    password:"",
    age:"",
    phonenumber:"",
    college:"",
    status:"",
    image:null,
  });
  const [currentUserId, setCurrentUserId] = useState(null);  // Track the current user ID for editing
const [searchQuery,setSearchQuery] = useState("");
const [statusQuery,setStatusQuery] = useState("");
const [downloadMenu, setDownloadMenu] = useState(false);


    // fetch data from the api
    const fetchUsers=async()=>{
      try{

        const response= await fetch("http://localhost:3000/users");
        const data = await response.json();
        console.log("data",data)
        if(response.ok){
          setUsers(data.users);
        }else{
          console.error("error fetching users",data.message)
        }

      }
      catch(error){

        console.error("Error",error);
      }
    };

   useEffect(()=>{
    fetchUsers(); 
   },[])

  const handleInputChange=(e)=>{
    const {name,value}=e.target;
    setFormData({...formData,[name]:value});
  };

  const handleFileChange=(e)=>{
    setFormData({...formData,image:e.target.files[0]});

  }

  // delete api code 

  const handleDelete = async (userId) => {
    try {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: 'Are You Sure?',
        text: 'This action will permanently delete the user.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
      });
  
      if (result.isConfirmed) {
        // Make DELETE API call to delete the user
        const response = await fetch(`http://localhost:3000/user/${userId}`, {
          method: 'DELETE',  // Use DELETE method instead of POST
        });
  
        const data = await response.json(); // Get response data
  
        if (response.ok) {
          Swal.fire({
            title: 'Deleted!',
            text: 'The user has been deleted.',
            icon: 'success',
          });
          
          // Update the state by filtering out the deleted user
          setUsers(users.filter((user) => user._id !== userId));  // Assuming user._id is used
        } else {
          Swal.fire({
            title: 'Error!',
            text: data.message || 'An error occurred while deleting the user.',
            icon: 'error',
          });
        }
      }
    } catch (error) {
      console.log('Error deleting the user', error);
  
      // Handle error if fetch or delete operation fails
      Swal.fire({
        title: 'Error!',
        text: 'An error occurred while deleting the user.',
        icon: 'error',
      });
    }
  };

 

  // saving data api or post data 
  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent page reload on form submit
  
    try {
      // Sending data via POST request
      const response = await axios.post('http://localhost:3000/Signup', formData , {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      // Check for successful response status (2xx range)
      if (response.status >= 200 && response.status < 300) {
        Swal.fire({
          title: "Save Successfully",
          text: "You clicked the button and the data has been saved.",
          icon: "success",
        });
      
      }
      // Reset the form data after successful submission
      setFormData({
        userName: "",
        email: "",
        password: "",
        age: "",
        phonenumber: "",
        college: "",
        status:"",
        image:""
        
      });

      setIsModalOpen(false); // Close the moda
      fetchUsers(); // Refresh the user list

} catch (error) {
  console.log("Error during form submission", error);
  Swal.fire({
    title: "Error",
    text: error.response?.data.message || "Something went wrong.",
    icon: "error",
  });
}
};
  
const openAddBtn = ()=>{
  setCurrentUserId(null) //i will shift 
  setIsModalOpen(true);
}

const openUpdateBtn = (userId)=>{
  setCurrentUserId(userId);
  setIsModalOpen(true);

}

// shorting based on status 
const filterdStatus=users.filter(user=>{
  if(statusQuery){
    if( user.status.toLowerCase() != statusQuery.toLowerCase() ){
    return user;
    }
  }
  else{
    return user;
  }
})
console.log("filteredusers",filterdStatus )


// shorting based on search 
const filterdUsers=filterdStatus.filter(user=>{
  return user.userName.toLowerCase().includes(searchQuery.toLowerCase()) 
 })
 console.log("filteredusers",filterdUsers )

// toggle download menu 
const toggleMenu = () => setDownloadMenu(!downloadMenu);

 // saving to pdf file
 const exportToPDF = ()=>{
  const doc = new jsPDF();
  doc.text("Users Data",20,10);
  doc.autoTable({
    head:[[ "userName",
      "email",
      "password",
      "age",
      "phonenumber",
      "college",
      "status"]],
      body:filterdUsers.map((user)=>[user.userName,user.email,user.password,user.age,user.phonenumber,user.college,user.status])
  });
  doc.save("UserData.pdf");
  setDownloadMenu(false);
 };
// close saving pdf file

 // save to excel file
 const exportToXL = ()=>{
  const worksheet=XLSX.utils.json_to_sheet(
  filterdUsers.map((user)=>({
    userName:user.userName,
    email:user.email,
    password:user.password,
    age:user.age,
    phonenumber:user.phonenumber,
    college:user.college,
    status:user.status

  }))
  
);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook,worksheet,"Users");
XLSX.writeFile(workbook,"UserData.xlsx");
setDownloadMenu(false);
 };
 // close excel file

  return (
    <div>
      
      {/* search status and download area  */}
      <div  style={{display:"flex", justifyContent:"space-between",textAlign:"center"}}>

    {/* search area  */}
    <div style={{display:"flex",gap:"5px" ,margin:"15px ",textAlign:"center"}}>

    <input type="text" placeholder="Search By Name  " value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)}
    style={{padding:"8px", borderRadius:"10px" ,outline:"none", width:"200px",borderRdius:"4px",border:"1px solid #ccc"}} />
   
   {/* select active inactive status  */}
    <select 
      style={{padding:"8px" , cursor:"pointer" , borderRadius:"5px" , outline:"none",  width:"150px",borderRdius:"4px",border:"1px solid #ccc"}}
      value={statusQuery} onChange={(e)=>setStatusQuery(e.target.value)}
    >
      <option>Select</option>
      <option value="Inactive">Active</option>
      <option value="Active">Inactive</option>
    </select>
    </div>

{/* download icon  */}
<button
        onClick={toggleMenu}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",  
          fontSize: "18px",
          marginRight:"10px"
        }}
        aria-label="Download Options"
      >
        <FaDownload />
      </button>
       </div>

   

    {/* download menu  */}
    {downloadMenu && (
        <div
          style={{
            position: "absolute",
            top: "35px",
            right:"20px" ,
            background: "white",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            borderRadius: "4px",
            zIndex: 10,
            padding: "10px",
          }}
        >
          <span onClick={exportToPDF} style={{ display: "block", margin: "5px 0", width: "100%", cursor:"pointer", fontSize:"15px"}}>
          <MdFileDownload /> PDF
          </span>
          <span onClick={exportToXL} style={{ display: "block", margin: "5px 0", width: "100%", cursor:"pointer", fontSize:"15px" }}>
          <MdFileDownload /> EXCEL
          </span>
        </div>
      )}
  

    {/* End download menu  */}
       

      <button style={{ float: "right", marginRight:"15px",borderRadius:"10px" , marginBottom:"10px", backgroundColor:"green",color:"whitesmoke",padding:"5px", display:"flex",alignItems:"center"}} onClick={()=>openAddBtn()}>
      <IoMdAdd />
       <span>Add User</span> 
      </button>
      <table style={{ width: "100%" }}>
        <thead>
          <tr >
          <th style={{borderBottom:"1px solid black"}}>UserName</th>
          <th style={{borderBottom:"1px solid black"}}>Email</th>
          <th style={{borderBottom:"1px solid black"}}>Password</th>
          <th style={{borderBottom:"1px solid black"}}>Age</th>
          <th style={{borderBottom:"1px solid black"}}>PhoneNumber</th>
          <th style={{borderBottom:"1px solid black"}}>College</th>
          <th style={{borderBottom:"1px solid black"}}>Status</th>
          <th style={{borderBottom:"1px solid black"}}>Action</th>
          </tr>
          
        </thead>
        <tbody>
          {filterdUsers.length>0?(
            filterdUsers.map((user,index)=>{
              return  <tr key={index}>
                <td style={{borderBottom:"1px solid black",padding:"8px",textAlign:"center"}}>{user.userName}</td>
                <td style={{borderBottom:"1px solid black",padding:"8px",textAlign:"center"}} >{user.email}</td>
                <td style={{borderBottom:"1px solid black",padding:"8px",textAlign:"center"}}>{user.password}</td>
                <td style={{borderBottom:"1px solid black",padding:"8px",textAlign:"center"}}>{user.age}</td>
                <td style={{borderBottom:"1px solid black",padding:"8px",textAlign:"center"}}>{user.phonenumber}</td>
                <td style={{borderBottom:"1px solid black",padding:"8px",textAlign:"center"}}>{user.college}</td>
                <td style={{borderBottom:"1px solid black",padding:"8px",textAlign:"center", color: user.status === "Active" ? "darkgreen" : "red" }}>
                   {user.status}
                  </td>
                <td style={{borderBottom:"1px solid black",padding:"8px 0px",display:"flex", justifyContent:"space-evenly"}}>
                  <span style={{ color: "blue", cursor:"pointer"  }} onClick={() => openUpdateBtn(user._id)}  >
                  <FaEdit />
                    </span>
                  <span style={{  color: "red", cursor:"pointer"  }} onClick={()=>handleDelete(user._id)}>
                  <MdDelete />
                    </span>
                    </td>
              </tr>
            })

          ):(
            <tr>
              <td colSpan="8" style={{borderBottom:"1px solid black",padding:"8px"}}>
                </td>
              </tr>
          )}
        </tbody>
      
      </table>

      {/*  save model  */}
      {isModelOpen && (
       <div
       style={{
         position: "fixed",
         top: 0,
         left: 0,
         width: "100%",
         height: "100%",
         backgroundColor: "rgba(0,0,0,0.5)",
         display: "flex",
         justifyContent: "center",
         alignItems: "center",
       }}
     >
       <div
         style={{
           backgroundColor: "white",
           padding: "50px",
           borderRadius: "8px",
           width: "400px",
           boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
         }}
       >
         <h2>Add User</h2>
         <form onSubmit={handleSubmit}>
           <div style={{ marginBottom: "15px" }}>
             <label>
               Username:
               <input
                 type="text"
                 name="userName"
                 value={formData.userName}
                 onChange={handleInputChange}
                 style={{ width: "100%", padding: "8px", margin: "8px 0" }}
                 required
               />
             </label>
           </div>
     
           <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
             <div style={{ flex: 1 }}>
               <label>
                 Email:
                 <input
                   type="email"
                   name="email"
                   value={formData.email}
                   onChange={handleInputChange}
                   style={{ width: "100%", padding: "8px" }}
                   required
                 />
               </label>
             </div>
             <div style={{ flex: 1 }}>
               <label>
                 PhoneNumber:
                 <input
                   type="text"
                   name="phonenumber"
                   value={formData.phonenumber}
                   onChange={handleInputChange}
                   style={{ width: "100%", padding: "8px" }}
                   required
                 />
               </label>
             </div>
           </div>
     
           <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
             <div style={{ flex: 1 }}>
               <label>
                 Password:
                 <input
                   type="password"
                   name="password"
                   value={formData.password}
                   onChange={handleInputChange}
                   style={{ width: "100%", padding: "8px" }}
                   required
                 />
               </label>
             </div>
             <div style={{ flex: 1 }}>
               <label>
                 Age:
                 <input
                   type="number"
                   name="age"
                   value={formData.age}
                   onChange={handleInputChange}
                   style={{ width: "100%", padding: "8px" }}
                   required
                 />
               </label>
             </div>
           </div>
     
           <div style={{ marginBottom: "15px" }}>
             <label>
               College:
               <input
                 type="text"
                 name="college"
                 value={formData.college}
                 onChange={handleInputChange}
                 style={{ width: "100%", padding: "8px", margin: "8px 0" }}
                 required
               />
             </label>
           </div>

           <div style={{ marginBottom: "15px" }}>
             <label>
              Image
               <input
                 type="file"
                 name="image"
                 onChange={handleFileChange}
                 style={{ width: "100%", padding: "8px", margin: "8px 0" }}
                 required
               />
             </label>
           </div>
     
           <div style={{ marginBottom: "15px" }}>
             <label>
               Status:
               <select
                 name="status"
                 value={formData.status}
                 onChange={handleInputChange}
                 style={{ width: "100%", padding: "8px", margin: "8px 0" }}
                 required
               >
                 <option value="">Select</option>
                 <option value="Active">Active</option>
                 <option value="Inactive">Inactive</option>
               </select>
             </label>
           </div>
     
           <div>
             <button
               type="button"
               onClick={() => setIsModalOpen(false)}
               style={{ marginRight: "10px", padding: "8px 16px", color: "red" }}
             >
               Cancel
             </button>
            
             <button
               type="submit"
               style={{ padding: "8px 16px", backgroundColor: "green", color: "whitesmoke" }}
             >
               {!currentUserId ? "Save":"Update"}
             </button>
          
           </div>
         </form>
       </div>
     </div>
     
      )}
      </div>
  );
}

export default DashBoard;


