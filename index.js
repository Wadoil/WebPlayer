import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// Инициализация клиента Supabase
const SUPABASE_URL = 'https://ytahxhzlkqcgsxbdcsgw.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0YWh4aHpsa3FjZ3N4YmRjc2d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjMxMzMsImV4cCI6MjA3MzEzOTEzM30.83OSt6fuE1h9i_GNj3g7q88gedBNQt7836pMLsbA6T0'; 
// Создаем глобальный объект supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
        
// Пример использования
async function getData() {
    const { data, error } = await supabase
        .from('Users')
        .select('*')
            
    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Data:', data)
    }
}
        
getData()
console.log('Function activated')