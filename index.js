// Инициализация клиента Supabase
const SUPABASE_URL = 'https://supabase.com/dashboard/project/ytahxhzlkqcgsxbdcsgw'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0YWh4aHpsa3FjZ3N4YmRjc2d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjMxMzMsImV4cCI6MjA3MzEzOTEzM30.83OSt6fuE1h9i_GNj3g7q88gedBNQt7836pMLsbA6T0'; 
// Создаем глобальный объект supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Supabase подключен!', supabaseClient);

       /* // Пример функции для получения данных
        async function getPosts() {
            const { data, error } = await supabaseClient
                .from('posts') // Замените 'posts' на название вашей таблицы
                .select('*');

            if (error) {
                console.error('Ошибка:', error);
            } else {
                console.log('Данные:', data);
            }
        }

        // Вызываем функцию при загрузке страницы
        getPosts();*/