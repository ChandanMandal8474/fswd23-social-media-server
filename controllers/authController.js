const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { error, success } = require('../utils/responseWrapper');

const signupController = async (req,res)=>{
    try {
        
        const {email, password, name} = req.body;

        if(!email || !password || !name){            
            return res.send(error(400,'All fields are required')); 
        }

        const oldUser = await User.findOne({email});

        if(oldUser){
            // res.send(409).send('User already exist !');
            return res.send(error(409,'User already exist !')); 

        }

        const hashedPassword = await bcrypt.hash(password,10);

        const user = await User.create({
            name,
            email,
            password:hashedPassword
        });

        return res.send(success(201, 'user created successfully'));
        
    } catch (e) {
        return res.send(error(500,e.message));      
    }
}

const loginController = async (req,res)=>{
    try {
        const {email, password} = req.body;

        if(!email || !password){
            // res.status(400).send('All fields are required !');
            res.send(error(400,"All fields are required !"));
        }

        const user = await User.findOne({email}).select('+password');

        if(!user){
            // res.status(404).send('User is not registered !');
            res.send(error(404,"User is not registered !"));

        }

        const matched = await bcrypt.compare(password,user.password);
        
        if(!matched){
            // res.status(403).send('Incorrect password !');
            res.send(error(403,"Incorrect password !"));

        }

        const accessToken = generateAccessToken({
            _id: user._id,
        })

        const refreshToken = generateRefreshToken({
            _id:user._id,
        })

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true
        })

        // return res.json({accessToken,});

        return res.send(success(200, {accessToken}));
        
    } catch (e) {
        console.log(e);        
    }
}

// this api will check the refresh token validity and generate new access token

const refreshAccessTokenController = async (req, res) =>{
    const cookies = req.cookies;
    if(!cookies.jwt){
        // return res.status(401).send("Refresh token is required !");
        return res.send(error(401,"Refresh token is required !"));
    }

    const refreshToken = cookies.jwt;
    console.log("refresh token => ",refreshToken);

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_PRIVATE_KEY);

        const _id = decoded._id;
        const accessToken = generateAccessToken({_id});

        // return res.status(201).json({accessToken});
        return res.send(success(201,{accessToken}));
        
    } catch (e) {
        console.log(e);        
    }
}

const logoutController = async (req, res) => {
    try {
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: true,
        })

        return res.send(success(200,'user logged out'));        
    } catch (e) {
        return res.send(error(500, e.message));
        
    }

}

//internal functions
const generateAccessToken = (data)=>{
    try {
        const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY,{
            expiresIn:'1d'
        });
        console.log("access token => ", token);
        return token;
        
    } catch (e) {
        console.log(e);        
    }
    
}

const generateRefreshToken = (data) => {
    try {
        const token = jwt.sign(data, process.env.REFRESH_TOKEN_PRIVATE_KEY,{
            expiresIn:'1y'
        });

        console.log(token);
        return token;
        
    } catch (e) {
        console.log(e);
        
    }
}

module.exports ={
    signupController,
    loginController,
    refreshAccessTokenController,
    logoutController
};