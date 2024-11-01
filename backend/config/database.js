require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

let isDbInitialized = false;

async function initializeDatabase() {
    try {
        const { error } = await supabase
            .from('todos')
            .select('*')
            .limit(1);

        if (error) {
            throw error;
        }

        isDbInitialized = true;
    } catch (err) {
        console.error('Failed to initialize database:', err);
        isDbInitialized = false;
        throw err;
    }
}

module.exports = { supabase, initializeDatabase, isDbInitialized };