import { supabaseWithToken } from "../db/supabaseClient.js";

const authMiddleware = async (req, res, next) => {
    /* console.log("Full Header Auth:", req.headers.authorization); */
    const token = req.headers.authorization?.split('Bearer')[1].trim();
    /* console.log('Extracted Token:', token); */
    if(!token){
        return res.status(401).json({error: 'No token Provided'});
    }

    const client = supabaseWithToken(token);
    const {data, error} = await client.auth.getUser();

    if(error || !data?.user){
        console.log(error);
        return res.status(401).json({error: "Invalid or Expired Token"});
    }

    req.user = data.user;
    req.token = token;
    next();
}

export default authMiddleware;