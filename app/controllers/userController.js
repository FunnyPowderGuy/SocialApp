import bcryptjs from "bcryptjs";
import jsonwebtoken from 'jsonwebtoken';
import { users, blacklistedTokens } from '../models/model.js';

const { hash, compare } = bcryptjs;
const { sign, verify, decode } = jsonwebtoken;

const JWT_SECRET = process.env.JWT_SECRET;

export const registerUser = async (userData) =>{
    const { name, lastName, email, password } = userData;

    if(!name || !lastName || !email || !password){
        return { error: "All fields are required", status: 400 };
    }

    const userExists = users.find(u => u.email == email);
    if(userExists){
        return { error: "User with this email already exists", status: 409 };
    }

    const hashedPassword = await hash(password, 10);

    const newUser = {
        id: Date.now(),
        name,
        lastName,
        email,
        confirmed: false,
        password: hashedPassword
    };

    users.push(newUser);

    const confirmToken = sign({ email: newUser.email }, JWT_SECRET, { expiresIn: "1h" });
    const confirmLink = `http://localhost:${process.env.PORT}/api/user/confirm/${confirmToken}`;

    return {
        status: 201,
        message: "Registered succesfully. Copy following link to the browser to confirm your account. Link is activer for 1 hour",
        link: confirmLink,
        ...newUser
    };
}

export const confirmUser = async (token) =>{
    try{
        const decode = verify(token, JWT_SECRET);
        const user = users.find(u => u.email == decode.email);

        if(!user){
            return { error: "No valid user for that token", status: 404 };
        }

        if(user.confirmed){
            return { message: "Account was already confirmed", status: 200 };
        }

        user.confirmed = true;
        return { message: "Account was susccesfully confirmed", status: 200, user };
    } catch(err){
        return { error: `Link autoryzacyjny wygasł lub jest niepoprawny: ${err.message}`, status: 400 }
    }
}

export const loginUser = async (credentials) =>{
    const { email, password } = credentials;

    if(!email || !password){
        return { error: "Email and password are required", status: 400 };
    }

    const user = users.find(u => u.email == email);
    if(!user){
        return { error: "Invalid email or password", status: 401 };
    }

    const isPasswordValid = await compare(password, user.password);
    if(!isPasswordValid){
        return { error: "Invalid email or password", status: 401 };
    }

    if(!user.confirmed){
        return { error: "The account is not confirmed", status: 403 };
    }

    const token = sign({ id: user.id, email: user.email, name: user.name}, JWT_SECRET, { expiresIn: "24h" });

    return { status: 200, token, message: "Login successfull" };
}

export const logoutUser = (token) =>{
    const decoded = decode(token);

    const expiryTime = decoded && decoded.exp ? decoded.exp * 1000 : Date.now() + 24 * 60 * 60 * 1000;

    blacklistedTokens.push({
        token,
        expiresAt: new Date(expiryTime)
    });

    return { message: "Logout successfull" };
}

export const getAllUsers = () => {
    return users.map(({ password, ...userWithoutPassword }) => userWithoutPassword)
};
export const getBlacklist = () => blacklistedTokens;