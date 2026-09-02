import { User } from "../models/User.model.js";
import { SendVerificationCode, SendWelcomeEmail } from "../utils/sendMail.js";
import generateToken from '../utils/generateToken.js'
import jwt from "jsonwebtoken"
import { College } from "../models/College.model.js";
import { Notification } from "../models/Notification.model.js";
import { io, userSocketMap } from "../socket/socket.js";
import WORLD_UNIVERSITIES from '../world_universities_and_domains.json' with { type: 'json' };

const extractDomain = (email) => {
    return email.split("@")[1];
};

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const userExists = await User.findOne({ email });

        if (userExists && userExists.isVerified) {
            return res.status(409).json({ success: false, message: "User already exists" });
        }

        // If the user exists but is NOT verified, update the verification code
        if (userExists && !userExists.isVerified) {
            const token = generateToken(res, userExists._id)
            userExists.name = name
            userExists.password = password
            userExists.verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            userExists.verificationCodeExpiry = new Date(Date.now() + 60 * 60 * 1000);
            await userExists.save();

            SendVerificationCode(userExists.email, userExists.verificationCode);
            return res.status(200).json({
                success: true,
                message: "New verification code sent",
                user: {
                    name: userExists.name,
                    email: userExists.email,
                    avatar: userExists.avatar,
                    collegeId: userExists.collegeId._id,
                    collegeName: userExists.collegeId.name,
                    isVerified: userExists.isVerified,
                    bio: userExists.bio
                },
                token
            });
        }

        const domain = extractDomain(email);
        const collegeJson = WORLD_UNIVERSITIES.find(university => university.domains.some(
            universityDomain => universityDomain === domain || domain.endsWith(`.${universityDomain}`)
        ))


        if (!collegeJson) {
            return res.status(404).json({ success: false, message: "Your college domain was not found" });
        }

        let college = await College.findOne({ name: collegeJson.name });

        if(!college) {
            college = await College.create({
                name: collegeJson.name,
                domains: [domain],
            })
        } else {
            college = await College.findByIdAndUpdate(college._id, {
                $addToSet: {
                    domains: domain
                }
            }, { new: true })
            await college.save()
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationCodeExpiry = new Date(Date.now() + 60 * 60 * 1000);
        const user = await User.create({
            name,
            email,
            password,
            collegeId: college._id,
            verificationCode,
            verificationCodeExpiry
        })

        college.users.push(user._id);
        await college.save();
        await user.populate({ path: 'collegeId', model: 'College', select: 'name' })

        if (user) {
            const token = generateToken(res, user._id)
            SendVerificationCode(user.email, user.verificationCode);
            res.status(201).json({
                success: true,
                message: "New user registered successfully",
                user: {
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    _id: user._id,
                    collegeId: user.collegeId._id,
                    collegeName: user.collegeId.name,
                    isVerified: user.isVerified,
                    bio: user.bio
                },
                token,
            })
        } else {
            return res.status(400).json({ success: false, message: "Invalid user data" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const verifyCode = async (req, res) => {
    try {

        const { verificationCode } = req.body;
        let token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ success: false, message: "You must be registered first" });
        }

        const { userId } = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(userId);

        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized action" });
        }

        const isCodeExpired = new Date(Date.now()) > new Date(user.verificationCodeExpiry);

        if (isCodeExpired) {
            return res.status(400).json({ success: false, message: "Verification code expired" });
        }

        if (verificationCode === user.verificationCode) {
            SendWelcomeEmail(user.email, user.name)
            user.isVerified = true;
            await user.save();
            // for each user in his college notify him that a new user has joined
            const college = await College.findById(user.collegeId).populate({
                path: 'users',
                model: 'User'
            });
            try {
                await Promise.all(college.users.map(async (collegeUser) => {
                    if (!collegeUser._id.equals(user._id)) {
                        const notification = await Notification.create({
                            notificationType: "NEW_USER_JOINED",
                            message: `${user.name} has joined from your college`,
                            referenceId: user._id,
                        })
                        collegeUser.notifications.push(notification._id);
                        await collegeUser.save();

                        const collegeUserId = collegeUser._id.toString();
                        if (collegeUserId in userSocketMap) {
                            io.to(userSocketMap[collegeUserId]).emit('newNotification', notification);
                        }
                    }
                }))
            } catch (error) {
                console.log("Error in sending notifications to all users");
                console.error("Error message: ", error.message);
            }
            return res.status(201).json({ success: true, message: "User verified successfully", user });
        } else {
            return res.status(401).json({ success: false, message: "Invalid verification code" });
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export const resendVerificationCode = async (req, res) => {
    try {
        let token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ success: false, message: "You must be registered first" });
        }

        const { userId } = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(userId);

        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized action" });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: "User is already verified" });
        }

        // Generate new verification code
        const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = newVerificationCode;
        user.verificationCodeExpiry = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();

        // Send the new code
        await SendVerificationCode(user.email, newVerificationCode);

        return res.status(200).json({ success: true, message: "A new verification code has been sent to your email." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const user = await User
            .findOne({ email })
            .select('-verificationCode -verificationCodeExpiry');
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        if (!user.isVerified) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        await user.populate({ path: 'collegeId', model: 'College', select: 'name' })

        if (await user.matchPassword(password)) {
            const token = generateToken(res, user._id.toString());
            return res.status(200).json({
                success: true,
                message: "User logged in successfully",
                user: {
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    _id: user._id,
                    collegeId: user.collegeId._id,
                    collegeName: user.collegeId.name,
                    isVerified: user.isVerified,
                    bio: user.bio
                },
                token
            })
        } else {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const logout = async (req, res) => {
    try {

        res.cookie('jwt', '', {
            httpOnly: true,
            expires: new Date(0)
        })

        res.status(200).json({ message: 'User logged out' })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}