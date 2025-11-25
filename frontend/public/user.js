import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = 'https://ytahxhzlkqcgsxbdcsgw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0YWh4aHpsa3FjZ3N4YmRjc2d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjMxMzMsImV4cCI6MjA3MzEzOTEzM30.83OSt6fuE1h9i_GNj3g7q88gedBNQt7836pMLsbA6T0'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Элементы DOM
const loginForm = document.querySelector('form')
const registerForm = document.getElementById('registerForm')
const registerModal = document.getElementById('registerModal')
const showRegisterModal = document.getElementById('showRegisterModal')
const closeRegisterModal = document.getElementById('closeRegisterModal')
const notification = document.getElementById('notification')
const notificationText = document.getElementById('notificationText')

let currentUser = null

document.addEventListener('DOMContentLoaded', function() {
    checkAuthState()
    setupEventListeners()
})

function setupEventListeners() {
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin)
    }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister)
    }
    if (showRegisterModal) {
        showRegisterModal.addEventListener('click', function(e) {
            e.preventDefault()
            showModal()
        })
    }
    if (closeRegisterModal) {
        closeRegisterModal.addEventListener('click', hideModal)
    }
    registerModal.addEventListener('click', function(e) {
        if (e.target === registerModal) {
            hideModal()
        }
    })
}

// Проверка состояния аутентификации
function checkAuthState() {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
        currentUser = JSON.parse(savedUser)
        showUserSection()
        updateUIForLoggedInUser()
    } else {
        showLoginSection()
    }
}

// Обновление секции плейлистов в зависимости от авторизации
function updatePlaylistsSection() {
    const playlistsSection = document.querySelector('.bg-white.rounded-lg.shadow.p-6:last-of-type')
    if (!playlistsSection) return

    if (currentUser) {
        // Пользователь авторизован - показываем настоящие плейлисты
        playlistsSection.innerHTML = `
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Мои плейлисты</h2>
            <div id="playlistsContainer" class="space-y-2">
                <div class="text-center py-4">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Загрузка плейлистов...</p>
                </div>
            </div>
            <div class="mt-4">
                <button id="createPlaylistBtn" class="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                    + Создать новый плейлист
                </button>
            </div>
        `
        
        // Загружаем плейлисты пользователя - ТОЛЬКО ЗДЕСЬ
        loadUserPlaylists()
        
        document.getElementById('createPlaylistBtn').addEventListener('click', createNewPlaylist)
    } else {
        // Пользователь не авторизован - показываем заглушку
        playlistsSection.innerHTML = `
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Мои плейлисты</h2>
            <div class="text-center py-8">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                <p class="text-gray-600 dark:text-gray-400 mb-4">Войдите в систему, чтобы управлять плейлистами</p>
                <button onclick="document.getElementById('login').focus()" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
                    Войти
                </button>
            </div>
        `
    }
}

// Загрузка плейлистов пользователя
async function loadUserPlaylists() {
    if (!currentUser || !currentUser.user_id) {
        console.log('No user ID available for loading playlists')
        return
    }

    try {
        console.log('Loading playlists for user:', currentUser.user_id)
        
        const { data: playlists, error } = await supabase
            .from('Playlists')
            .select('*')
            .eq('user_id', currentUser.user_id)
            .order('created_at', { ascending: false })

        console.log('Playlists loaded:', playlists)

        const container = document.getElementById('playlistsContainer')
        if (!container) return

        if (error) {
            console.error('Error loading playlists:', error)
            container.innerHTML = `
                <div class="text-center py-4 text-red-600">
                    Ошибка загрузки плейлистов
                </div>
            `
            return
        }

        if (playlists && playlists.length > 0) {
            container.innerHTML = playlists.map(playlist => `
                <div class="flex justify-between items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors group">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-red-100 dark:bg-red-900 rounded flex items-center justify-center">
                            <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>
                            </svg>
                        </div>
                        <div>
                            <h3 class="font-medium text-gray-900 dark:text-white">${playlist.name || 'Без названия'}</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                ${playlist.track_count || 0} треков
                            </p>
                        </div>
                    </div>
                    <div class="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="playPlaylist(${playlist.id})" class="p-2 text-green-600 hover:text-green-700 transition-colors" title="Воспроизвести">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>
                            </svg>
                        </button>
                        <button onclick="editPlaylist(${playlist.id})" class="p-2 text-blue-600 hover:text-blue-700 transition-colors" title="Редактировать">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button onclick="deletePlaylist(${playlist.id})" class="p-2 text-red-600 hover:text-red-700 transition-colors" title="Удалить">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('')
        } else {
            container.innerHTML = `
                <div class="text-center py-8">
                    <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                    </svg>
                    <p class="text-gray-600 dark:text-gray-400 mb-4">У вас пока нет плейлистов</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Создайте первый плейлист, чтобы сохранять любимые треки</p>
                </div>
            `
        }
    } catch (error) {
        console.error('Error in loadUserPlaylists:', error)
        const container = document.getElementById('playlistsContainer')
        if (container) {
            container.innerHTML = `
                <div class="text-center py-4 text-red-600">
                    Ошибка загрузки плейлистов
                </div>
            `
        }
    }
}

// Создание нового плейлиста
async function createNewPlaylist() {
    if (!currentUser) {
        showNotification('Войдите в систему для создания плейлистов', 'error')
        return
    }

    const playlistName = prompt('Введите название плейлиста:')
    if (!playlistName) return

    try {
        const { data, error } = await supabase
            .from('Playlists')
            .insert([
                {
                    user_id: currentUser.user_id,
                    name: playlistName,
                    created_at: new Date().toISOString()
                }
            ])
            .select()

        if (error) throw error

        if (data && data.length > 0) {
            showNotification('Плейлист создан!', 'success')
            loadUserPlaylists() // Перезагружаем список
        }
    } catch (error) {
        console.error('Error creating playlist:', error)
        showNotification('Ошибка создания плейлиста', 'error')
    }
}

// Функции для работы с плейлистами (заглушки)
function playPlaylist(playlistId) {
    if (!currentUser) {
        showNotification('Войдите в систему для воспроизведения', 'error')
        return
    }
    showNotification(`Воспроизведение плейлиста ${playlistId}`, 'info')
    // Здесь будет логика воспроизведения
}

function editPlaylist(playlistId) {
    if (!currentUser) {
        showNotification('Войдите в систему для редактирования', 'error')
        return
    }
    showNotification(`Редактирование плейлиста ${playlistId}`, 'info')
    // Здесь будет логика редактирования
}

function deletePlaylist(playlistId) {
    if (!currentUser) {
        showNotification('Войдите в систему для удаления', 'error')
        return
    }
    
    if (confirm('Вы уверены, что хотите удалить этот плейлист?')) {
        showNotification(`Удаление плейлиста ${playlistId}`, 'info')
        // Здесь будет логика удаления
    }
}

// Обработка входа
async function handleLogin(e) {
    e.preventDefault()
    
    const login = document.getElementById('login').value.trim()
    const password = document.getElementById('password').value

    if (!login || !password) {
        showNotification('Пожалуйста, заполните все поля', 'error')
        return
    }

    showNotification('Вход в систему...', 'info')

    try {
        const { data: authData, error: authError } = await supabase
            .from('Authorisations')
            .select('*')
            .eq('Login', login)
            .eq('Password', password)

        if (authError) throw authError

        if (authData && authData.length > 0) {
            const authRecord = authData[0]
            
            const { data: userData, error: userError } = await supabase
                .from('Users')
                .select('*')
                .eq('AuthorisationID', authRecord.id)

            currentUser = {
                auth_id: authRecord.id,
                login: authRecord.Login,
            }

            if (userData && userData.length > 0) {
                currentUser.user_id = userData[0].id
                currentUser.username = userData[0].Username
                currentUser.avatar = userData[0].Avatar
                currentUser.created_at = userData[0].created_at
            } else {
                currentUser.username = login.split('@')[0]
            }
            
            localStorage.setItem('currentUser', JSON.stringify(currentUser))
            showNotification('Успешный вход!', 'success')
            updateUIForLoggedInUser()
        } else {
            showNotification('Неверный логин или пароль', 'error')
        }
    } catch (error) {
        console.error('Login error:', error)
        showNotification('Ошибка при входе в систему', 'error')
    }
}

// Обработка выхода
function handleLogout() {
    currentUser = null
    localStorage.removeItem('currentUser')
    showNotification('Вы вышли из системы', 'info')
    showLoginSection()
    updatePlaylistsSection() // Обновляем секцию плейлистов после выхода
    updateNavAvatar() // Обновляем аватар в навигации
}

// Обновление UI после входа
async function updateUIForLoggedInUser() {
    showUserSection()
    updatePlaylistsSection()
    
    // Загружаем аватар пользователя
    if (currentUser) {
        await loadUserAvatar()
    }
}

// Функция для загрузки аватара пользователя
async function loadUserAvatar() {
    if (!currentUser || !currentUser.user_id) return

    try {
        const { data, error } = await supabase.storage
            .from('Avatars') // название бакета
            .download(`${currentUser.user_id}/avatar.jpg`) // путь к файлу

        if (error) {
            // Если аватар не найден, используем заглушку
            console.log('Avatar not found:', error.message)
            return
        }

        if (data) {
            // Создаем URL для изображения
            const avatarUrl = URL.createObjectURL(data)
            currentUser.avatar = avatarUrl
            
            // Сохраняем в localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser))
            
            // Обновляем отображение аватара
            updateAvatarInUI(avatarUrl)
        }
    } catch (error) {
        console.error('Error loading avatar:', error)
    }
}

// Функция для обновления аватара в UI
function updateAvatarInUI(avatarUrl) {
    // Обновляем аватар в основном блоке пользователя
    const userSection = document.querySelector('.bg-white.rounded-lg.shadow.p-6')
    if (userSection) {
        const avatarImg = userSection.querySelector('.user-avatar img')
        const avatarPlaceholder = userSection.querySelector('.avatar-placeholder')
        
        if (avatarImg) {
            avatarImg.src = avatarUrl
        } else if (avatarPlaceholder && avatarUrl) {
            const displayName = currentUser?.username || currentUser?.login || 'Пользователь'
            avatarPlaceholder.parentElement.innerHTML = `
                <img src="${avatarUrl}" alt="${displayName}" class="w-16 h-16 rounded-full mx-auto mb-2">
            `
        }
    }
    
    // Обновляем аватар в навигации (правый верхний угол)
    updateNavAvatar(avatarUrl)
}

// Обновление аватара в навигации
function updateNavAvatar(avatarUrl = null) {
    const navAvatar = document.querySelector('nav img[alt="user photo"]')
    if (navAvatar) {
        if (avatarUrl) {
            navAvatar.src = avatarUrl
        } else if (currentUser && currentUser.avatar) {
            navAvatar.src = currentUser.avatar
        } else {
            // Используем placeholder или первую букву имени
            const displayName = currentUser?.username || currentUser?.login || 'U'
            navAvatar.src = `data:image/svg+xml;base64,${btoa(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <rect width="32" height="32" fill="#dc2626"/>
                    <text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">
                        ${displayName.charAt(0).toUpperCase()}
                    </text>
                </svg>
            `)}`
        }
    }
}

// Загрузка нового аватара
// TODO: реализовать загрузку аватаров в базу
async function uploadAvatar(file) {
    if (!currentUser || !currentUser.user_id) {
        showNotification('Войдите в систему для загрузки аватара', 'error')
        return
    }

    try {
        // Удаляем старый аватар (если есть)
        await supabase.storage
            .from('avatars')
            .remove([`${currentUser.user_id}/avatar.jpg`])

        // Загружаем новый аватар
        const { data, error } = await supabase.storage
            .from('avatars')
            .upload(`${currentUser.user_id}/avatar.jpg`, file, {
                upsert: true,
                contentType: file.type
            })

        if (error) throw error

        // Обновляем аватар в UI
        await loadUserAvatar()
        showNotification('Аватар обновлен!', 'success')

    } catch (error) {
        console.error('Error uploading avatar:', error)
        showNotification('Ошибка загрузки аватара', 'error')
    }
}

// Обработчик для input файла
function setupAvatarUpload() {
    const avatarInput = document.createElement('input')
    avatarInput.type = 'file'
    avatarInput.accept = 'image/*'
    avatarInput.style.display = 'none'
    document.body.appendChild(avatarInput)

    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0]
        if (file) {
            // Проверяем размер файла (максимум 2MB)
            if (file.size > 2 * 1024 * 1024) {
                showNotification('Файл слишком большой (максимум 2MB)', 'error')
                return
            }
            uploadAvatar(file)
        }
    })

    // Добавляем возможность клика на аватар для загрузки нового
    document.addEventListener('click', (e) => {
        if (e.target.closest('.user-avatar') || e.target.classList.contains('user-avatar')) {
            avatarInput.click()
        }
    })
}

// Показ секции пользователя с кнопкой публикации музыки
function showUserSection() {
    const loginSection = document.querySelector('.bg-white.rounded-lg.shadow.p-6')
    if (loginSection) {
        const displayName = currentUser?.username || currentUser?.login || 'Пользователь'
        const avatar = currentUser?.avatar || null
        
        loginSection.innerHTML = `
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Добро пожаловать!</h2>
            <div class="space-y-4">
                <div class="text-center user-avatar cursor-pointer" title="Нажмите для смены аватара">
                    ${avatar ? 
                        `<img src="${avatar}" alt="${displayName}" class="w-16 h-16 rounded-full mx-auto mb-2">` :
                        `<div class="avatar-placeholder w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span class="text-white font-bold text-lg">
                                ${displayName.charAt(0).toUpperCase()}
                            </span>
                        </div>`
                    }
                    <p class="text-gray-700 dark:text-gray-300 font-medium">${displayName}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">${currentUser?.login || ''}</p>
                </div>
                <div class="space-y-2">
                    <button id="publishMusicBtn" class="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center justify-center space-x-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        <span>Опубликовать музыку</span>
                    </button>
                    <button id="logoutBtn" class="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition">
                        Выйти
                    </button>
                </div>
            </div>
        `
        
        document.getElementById('logoutBtn').addEventListener('click', handleLogout)
        document.getElementById('publishMusicBtn').addEventListener('click', showPublishMusicModal)
        
        // Инициализируем загрузку аватаров
        setupAvatarUpload()
        
        // Обновляем аватар в навигации
        updateNavAvatar()
    }
}

// Модальное окно публикации музыки
function showPublishMusicModal() {
    if (!currentUser) {
        showNotification('Войдите в систему для публикации музыки', 'error')
        return
    }

    const modalHTML = `
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Опубликовать музыку</h3>
                    <button id="closePublishModal" class="text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <form id="publishMusicForm" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label for="trackTitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Название трека *</label>
                            <input type="text" id="trackTitle" required class="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-transparent">
                        </div>
                        
                        <div>
                            <label for="trackArtist" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Исполнитель *</label>
                            <input type="text" id="trackArtist" required class="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-transparent">
                        </div>
                    </div>

                    <div>
                        <label for="trackGenre" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Жанр</label>
                        <select id="trackGenre" class="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-transparent">
                            <option value="">Выберите жанр</option>
                            <option value="rock">Рок</option>
                            <option value="pop">Поп</option>
                            <option value="hiphop">Хип-хоп</option>
                            <option value="electronic">Электронная</option>
                            <option value="jazz">Джаз</option>
                            <option value="classical">Классическая</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Аудио файл *</label>
                        <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                            <input type="file" id="audioFile" accept="audio/*" required class="hidden">
                            <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"></path>
                            </svg>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Перетащите аудио файл или</p>
                            <button type="button" onclick="document.getElementById('audioFile').click()" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm">
                                Выбрать файл
                            </button>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">MP3 sдо 50MB</p>
                            <div id="audioFileName" class="text-sm text-green-600 dark:text-green-400 mt-2 hidden"></div>
                        </div>
                    </div>

                    <div class="flex space-x-3 pt-4">
                        <button type="button" id="cancelPublish" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition">
                            Отмена
                        </button>
                        <button type="submit" class="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center justify-center space-x-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                            <span>Опубликовать</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modalHTML)
    
    // Обработчики для модального окна
    document.getElementById('closePublishModal').addEventListener('click', closePublishModal)
    document.getElementById('cancelPublish').addEventListener('click', closePublishModal)
    document.getElementById('publishMusicForm').addEventListener('submit', handleMusicPublish)
    
    // Обработчики для отображения имен файлов
    document.getElementById('audioFile').addEventListener('change', function(e) {
        const fileName = e.target.files[0]?.name
        const fileNameDiv = document.getElementById('audioFileName')
        if (fileName) {
            fileNameDiv.textContent = fileName
            fileNameDiv.classList.remove('hidden')
        }
    })
    
    // Закрытие по клику вне модального окна
    document.querySelector('.fixed.inset-0').addEventListener('click', function(e) {
        if (e.target === this) {
            closePublishModal()
        }
    })
}

// Закрытие модального окна публикации
function closePublishModal() {
    const modal = document.querySelector('.fixed.inset-0')
    if (modal) {
        modal.remove()
    }
}

// Обработка публикации музыки
async function handleMusicPublish(e) {
    e.preventDefault()
    
    if (!currentUser) {
        showNotification('Войдите в систему для публикации музыки', 'error')
        return
    }

    const trackTitle = document.getElementById('trackTitle').value.trim()
    const trackArtist = document.getElementById('trackArtist').value.trim()
    const trackGenre = document.getElementById('trackGenre').value
    const audioFile = document.getElementById('audioFile').files[0]

    // Валидация
    if (!trackTitle || !trackArtist || !audioFile) {
        showNotification('Заполните обязательные поля: название, исполнитель и аудио файл', 'error')
        return
    }

    showNotification('Публикация музыки...', 'info')

    try {
        // TODO: реализовать загрузку файлов в базу
        setTimeout(() => {
            showNotification('Музыка успешно опубликована!', 'success')
            closePublishModal()
        }, 2000)

    } catch (error) {
        console.error('Music publish error:', error)
        showNotification('Ошибка при публикации музыки: ' + error.message, 'error')
    }
}

// Показ секции входа
function showLoginSection() {
    const loginSection = document.querySelector('.bg-white.rounded-lg.shadow.p-6')
    if (loginSection) {
        loginSection.innerHTML = `
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Вход в систему</h2>
            <form class="space-y-4">
                <div>
                    <label for="login" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input type="text" id="login" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-600 dark:text-white">
                </div>
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Пароль</label>
                    <input type="password" id="password" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-600 dark:text-white">
                </div>
                <button type="submit" class="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">Войти</button>
                <p class="text-center text-sm text-gray-600 dark:text-gray-400">Нет аккаунта? 
                    <a href="#" id="showRegisterModal" class="text-red-600 hover:underline">Зарегистрироваться</a>
                </p>
            </form>
        `
        
        const newLoginForm = loginSection.querySelector('form')
        const newShowRegisterModal = loginSection.querySelector('#showRegisterModal')
        
        newLoginForm.addEventListener('submit', handleLogin)
        newShowRegisterModal.addEventListener('click', function(e) {
            e.preventDefault()
            showModal()
        })
    }
}

function showModal() {
    registerModal.classList.remove('hidden')
}

function hideModal() {
    registerModal.classList.add('hidden')
    registerForm.reset()
}

function showNotification(message, type = 'info') {
    notificationText.textContent = message
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white',
        warning: 'bg-yellow-500 text-black'
    }
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${colors[type]}`
    notification.classList.remove('hidden')
    setTimeout(() => {
        notification.classList.add('hidden')
    }, 5000)
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// Регистрация
async function handleRegister(e) {
    e.preventDefault()
    
    const email = document.getElementById('registerEmail').value.trim()
    const username = document.getElementById('registerUsername').value.trim()
    const password = document.getElementById('registerPassword').value
    const confirmPassword = document.getElementById('confirmPassword').value

    if (!email || !username || !password || !confirmPassword) {
        showNotification('Пожалуйста, заполните все поля', 'error')
        return
    }
    if (password !== confirmPassword) {
        showNotification('Пароли не совпадают', 'error')
        return
    }
    if (password.length < 6) {
        showNotification('Пароль должен содержать минимум 6 символов', 'error')
        return
    }
    if (!isValidEmail(email)) {
        showNotification('Введите корректный email', 'error')
        return
    }

    showNotification('Регистрация...', 'info')

    try {
        const { data: existingAuth, error: checkError } = await supabase
            .from('Authorisations')
            .select('id')
            .eq('Login', email)

        if (checkError) throw checkError
        if (existingAuth && existingAuth.length > 0) {
            showNotification('Пользователь с таким email уже существует', 'error')
            return
        }

        const { data: existingUser, error: userCheckError } = await supabase
            .from('Users')
            .select('id')
            .eq('Username', username)

        if (userCheckError) throw userCheckError
        if (existingUser && existingUser.length > 0) {
            showNotification('Пользователь с таким именем уже существует', 'error')
            return
        }

        const { data: authData, error: authError } = await supabase
            .from('Authorisations')
            .insert([{ Login: email, Password: password }])
            .select()

        if (authError) throw authError

        if (authData && authData.length > 0) {
            const authId = authData[0].id

            const { error: userError } = await supabase
                .from('Users')
                .insert([{
                    AuthorisationID: authId,
                    Username: username,
                    created_at: new Date().toISOString()
                }])

            if (userError) {
                await supabase.from('Authorisations').delete().eq('id', authId)
                throw userError
            }

            showNotification('Регистрация успешна! Теперь вы можете войти.', 'success')
            hideModal()
            registerForm.reset()
        }
    } catch (error) {
        console.error('Registration error:', error)
        showNotification(error.message || 'Ошибка регистрации', 'error')
    }
}