import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken =async  (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({validationBeforeSave : false})

    return {accessToken , refreshToken}

  } catch (error) {
    throw new ApiError (500 , "something went wrong while generating token")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  

  //logically steps -->

  //get user deatils from frontend
  //validation - not empty
  //check if user already exist -username and email
  //check for images , and avatar
  //upload them to cloudinary
  //check if avatar is on the db
  //create user object - create entry in db
  //remove pass and refresh token field from response
  //check for user creation
  //return response

  //get user deatils from frontend
  const { fullName, email, username, password } = req.body;
  // console.log("email: ", email);
  // console.log("req.files: ", req.files);

  //validation - not empty
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all fields are required");
  }

  //check if user already exist -username and email
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "user with email or username already exist");
  }

  //check for images , and avatar
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  let coverImageLocalPath;

  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is required");
  }

  //upload them to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  //check if avatar is on the db
  if (!avatar) {
    throw new ApiError(400, "avatar file is required");
  }

  //create user object - create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  //remove pass and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //check for user creation
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering the user");
  }

  //return response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));
});

const loginUser = asyncHandler(async(req,res) => {

  // req.boy-> data
  //username or email check
  //find the user
  //password check
  //access and refresh token
  //send cookie

  const {email , username,password} = req.body

  if (!(username||email)){
    throw new ApiError (400 , "username or email is required")
  }

  const user = await User.findOne({
    $or : [{username} , {email}]
  })

  if (!user){
    throw new ApiError (404 , "user does not exist")

  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) { 
    throw new ApiError(401 , "invalid user credentials")
  }

  const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)

 const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

 const options = {
  httpOnly : true,
  secure : true
 }

 return res
 .status(200)
 .cookie("accessToken" , accessToken, options)
 .cookie("refreshToken" , refreshToken, options)
 .json(
  new ApiResponse(
    200,
    {
      user : loggedInUser, accessToken, refreshToken
    },
    "user logged in successfully"
  )
 )
})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined,
    },
  },
  {
    new : true
  }
)
const options = {
  httpOnly: true,
  secure: true,
}

return res
.status(200)
.clearcookie("accessToken" , options)
.clearcookie("refreshToken" , options)
.json(new ApiResponse(200,{},"user logged out successfully"))

})

export { registerUser, loginUser, logoutUser };
