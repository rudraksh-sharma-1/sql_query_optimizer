import { supabaseWithToken } from '../db/supabaseClient.js'
import  supabase  from '../db/supabaseClient.js'
import crypto from 'crypto'

// generate a random slug
const generateSlug = () => {
    return crypto.randomBytes(6).toString('hex')  
}

// create shared report
export const createSharedReport = async (req, res) => {
    const { history_id } = req.body
    const userId = req.user.id
    const client = supabaseWithToken(req.token)

    if (!history_id) {
        return res.status(400).json({ error: 'history_id is required' })
    }

    // verify history belongs to user
    const { data: historyEntry, error: historyError } = await client
        .from('history')
        .select('id')
        .eq('id', history_id)
        .eq('user_id', userId)
        .maybeSingle()

    if (!historyEntry) {
        return res.status(404).json({ error: 'History entry not found' })
    }

    // check if an active report already exists for this history entry
    const { data: existing } = await client
        .from('shared_reports')
        .select('id, slug, expires_at, is_active')
        .eq('history_id', history_id)
        .eq('user_id', userId)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())  // not expired
        .maybeSingle()

    if (existing) {
        return res.status(200).json({
            message: 'Active shared report already exists',
            slug: existing.slug,
            expires_at: existing.expires_at,
            link: `${process.env.FRONTEND_URL}/report/${existing.slug}`
        })
    }

    // generate slug and expiry (7 days from now)
    const slug = generateSlug()
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await client
        .from('shared_reports')
        .insert({ user_id: userId, history_id, slug, expires_at })
        .select()
        .single()

    if (error) {
        return res.status(500).json({ error: 'Failed to create shared report' })
    }

    res.status(201).json({
        message: 'Shared report created successfully',
        slug: data.slug,
        expires_at: data.expires_at,
        link: `${process.env.FRONTEND_URL}/report/${data.slug}`
    })
}

// view shared report (public - no auth needed)
export const viewSharedReport = async (req, res) => {
    const { slug } = req.params

    // use base supabase client since this is public
    const { data: report, error } = await supabase
        .from('shared_reports')
        .select('*, history(*)')    // join with history to get full data
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle()

    if (!report) {
        return res.status(404).json({ error: 'Report not found or link is inactive' })
    }

    // check expiry manually as extra safety
    if (new Date(report.expires_at) < new Date()) {
        return res.status(410).json({ error: 'This shared link has expired' })
    }

    // increment view count
    await supabase
        .from('shared_reports')
        .update({ view_count: report.view_count + 1 })
        .eq('slug', slug)

    res.json({
        report: {
            slug: report.slug,
            expires_at: report.expires_at,
            view_count: report.view_count + 1,
            history: report.history
        }
    })
}

// get all shared reports for logged in user
export const getMySharedReports = async (req, res) => {
    const userId = req.user.id
    const client = supabaseWithToken(req.token)

    const { data, error } = await client
        .from('shared_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        return res.status(500).json({ error: 'Failed to fetch shared reports' })
    }

    res.json({ shared_reports: data })
}

// deactivate a shared report
export const deactivateSharedReport = async (req, res) => {
    const { id } = req.params
    const userId = req.user.id
    const client = supabaseWithToken(req.token)

    const { data, error } = await client
        .from('shared_reports')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .maybeSingle()

    if (!data) {
        return res.status(404).json({ error: 'Shared report not found' })
    }

    if (error) {
        return res.status(500).json({ error: 'Failed to deactivate shared report' })
    }

    res.json({ message: 'Shared report deactivated successfully' })
}

// regenerate slug and reset expiry for expired or inactive report
export const regenerateSharedReport = async (req, res) => {
    const { id } = req.params
    const userId = req.user.id
    const client = supabaseWithToken(req.token)

    const newSlug = generateSlug()
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await client
        .from('shared_reports')
        .update({ slug: newSlug, expires_at, is_active: true })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .maybeSingle()

    if (!data) {
        return res.status(404).json({ error: 'Shared report not found' })
    }

    if (error) {
        return res.status(500).json({ error: 'Failed to regenerate shared report' })
    }

    res.json({
        message: 'Shared report regenerated successfully',
        slug: data.slug,
        expires_at: data.expires_at,
        link: `${process.env.FRONTEND_URL}/report/${data.slug}`
    })
}