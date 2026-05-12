import React from 'react'
import AuthLayout from '../../components/layouts/AuthLayout'
import { useState, useContext } from 'react'
import { Link, useNavigate } from "react-router-dom"
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector'
import Input from '../../components/Inputs/Input'
import { validateEmail } from '../../utils/helper'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import { UserContext } from '../../context/userContext';
import uploadImage from '../../utils/uploadImage'    // ✅ added

const SignUp = () => {

  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminInviteToken, setAdminInviteToken] = useState("");
  const [error, setError] = useState(null);
  
  const {updateUser} = useContext(UserContext);
  const navigate = useNavigate();

const handleSignUp = async (e) => {
    e.preventDefault();

    if(!fullName) {
      setError("Please enter full name.");
      return;
    }

    if(!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if(!password){
      setError("Please enter the password");
      return;
    }

    if(password.length < 8){
    setError("Password must be at least 8 characters.");
    return;
  }

    setError("");

    try {
      let profileImageUrl = "";
      if(profilePic) {
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes.imageUrl || "";
      }

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: fullName,
        email,
        password,
        profileImageUrl,
        adminInviteToken
      });

      const { token, role} = response.data;

      if(token){
        localStorage.setItem("token", token);
        updateUser(response.data);

        if(role === "admin"){
          navigate("/admin/dashboard");
        } else {
          navigate("/user/dashboard");
        }
      }
    } catch(error){
      if(error.response && error.response.data.message){
        setError(error.response.data.message);
      }else{
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black">Create an Account</h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-6">Create your account and start managing your tasks today.</p>

        <form onSubmit={handleSignUp}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <Input
        value={fullName}
        onChange={({ target }) => setFullName(target.value)}
        label="Full Name"
        placeholder="Vijay"
        type="text"
        />

         <Input
        value={email}
        onChange={({ target }) => setEmail(target.value)}
        label="Email Address"
        placeholder="abc@gmail.com"
        type="text"
        />

        <Input
        value={password}
        onChange={({ target }) => setPassword(target.value)}
        label="Password"
        placeholder="Minimum 8 characters"
        type="password"
        />

        <Input
        value={adminInviteToken}
        onChange={({ target }) => setAdminInviteToken(target.value)}
        label="Admin Invite Token"
        placeholder="8 Digit Code"
        type="text"
        />
        </div>

        {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

        <button type="submit" className="btn-primary">SIGN UP</button>

        <p className="text-[13px] text-slate-800 mt-3 text-center">Already have an account? {""}
          <Link className="font-medium text-primary underline" to="/login"> Login </Link>
        </p>
        </form>
      </div>
    </AuthLayout>
  )
}

export default SignUp