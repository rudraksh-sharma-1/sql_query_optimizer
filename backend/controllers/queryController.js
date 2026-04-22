import parseExplainPlain from "../core/parser.js";
import analyzeNodes from "../core/rules.js";
import {supabaseWithToken} from "../db/supabaseClient.js";

export const analyzeQuery = async (req, res) =>{
    const {queryPlan} = req.body;
    const userId = req.user.id;
    const client = supabaseWithToken(req.token);

    if(!queryPlan){
        return res.status(400).json({error: "Query Plan is required"});
    }

    //core logic will go here in next step
    const {root,nodes, totalExecutionTime } = parseExplainPlain(queryPlan);
    const suggestions = analyzeNodes(nodes);

    const {error} = await client
    .from('history')
    .insert({user_id: userId, query_plan: queryPlan, suggestions: suggestions, tree: root});

    if(error){
        /* console.error("Error saving history:", error); */
        return res.status(500).json({error: "Failed to save History"});
    }

    res.json({tree: root,suggestions, totalExecutionTime});   
}

export const getHistory = async (req, res) => {
    const userId = req.user.id
    const client = supabaseWithToken(req.token)

    // get page and limit from query params, set defaults
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10

    // calculate range for supabase
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await client
        .from('history')
        .select('*', { count: 'exact' })   // count gives total records
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to)

    if (error) {
        return res.status(500).json({ error: 'Failed to fetch History' })
    }

    res.json({
        history: data,
        pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit)
        }
    })
}

export const getHistoryById = async (req, res) => {
    const { id } = req.params
    const client = supabaseWithToken(req.token)

    const { data, error } = await client
        .from('history')
        .select('*')
        .eq('id', id)
        .eq('user_id', req.user.id)  // ensure user owns this record
        .single()

    if (error) {
        return res.status(404).json({ error: 'History entry not found' })
    }

    res.json({ history: data })
}

const queryController = {
    analyzeQuery,
    getHistory,
    getHistoryById
}

export default queryController;