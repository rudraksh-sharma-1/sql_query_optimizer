import {createClient} from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
)

//this one uses the user's own token
export const supabaseWithToken = (token) =>{
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        global:{
            headers:{
                Authorization: `Bearer ${token}`,
            },
        },
    })
}

export default supabase;