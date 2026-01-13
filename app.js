// Configuração do Facebook SDK
window.fbAsyncInit = function() {
    FB.init({
        appId: '1564602294586753', // Seu App ID
        cookie: true,
        xfbml: true,
        version: 'v18.0'
    });

    // Verificar se usuário já está logado
    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            console.log('Usuário já está logado');
            loadUserData();
        }
    });
};

// Elementos DOM
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loadingOverlay = document.getElementById('loadingOverlay');
const fbLoginBtn = document.getElementById('fbLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Event Listeners
fbLoginBtn.addEventListener('click', loginWithFacebook);
logoutBtn.addEventListener('click', logout);

// Função de Login
function loginWithFacebook() {
    showLoading();
    
    FB.login(function(response) {
        if (response.status === 'connected') {
            console.log('Login bem-sucedido!');
            loadUserData();
        } else {
            console.log('Login cancelado ou falhou');
            hideLoading();
            alert('Login cancelado. Por favor, tente novamente.');
        }
    }, {
        scope: 'public_profile,email,user_photos,user_posts,user_age_range',
        return_scopes: true
    });
}

// Carregar dados do usuário
function loadUserData() {
    showLoading();
    
    // Buscar dados do perfil, email e age_range
    FB.api('/me', {
        fields: 'id,name,email,picture.width(200).height(200),age_range'
    }, function(response) {
        if (response && !response.error) {
            console.log('Dados do usuário:', response);
            
            // Atualizar interface com dados do usuário
            document.getElementById('userName').textContent = response.name;
            document.getElementById('userPhoto').src = response.picture.data.url;
            document.getElementById('displayName').textContent = response.name;
            document.getElementById('displayEmail').textContent = response.email || 'Não disponível';
            document.getElementById('displayId').textContent = response.id;
            
            // Faixa etária
            if (response.age_range) {
                const ageRange = response.age_range.min ? 
                    `${response.age_range.min}+` : 
                    'Não disponível';
                document.getElementById('displayAge').textContent = ageRange;
            } else {
                document.getElementById('displayAge').textContent = 'Não disponível';
            }
            
            // Carregar fotos
            loadUserPhotos();
            
            // Carregar posts
            loadUserPosts();
            
            // Mostrar dashboard
            loginScreen.classList.remove('active');
            dashboardScreen.classList.add('active');
            hideLoading();
        } else {
            console.error('Erro ao buscar dados:', response.error);
            hideLoading();
            alert('Erro ao carregar dados do usuário.');
        }
    });
}

// Carregar fotos do usuário
function loadUserPhotos() {
    const photosContainer = document.getElementById('photosContainer');
    photosContainer.innerHTML = '<div class="loading">Carregando fotos...</div>';
    
    FB.api('/me/photos', {
        fields: 'id,picture,created_time,name',
        limit: 12
    }, function(response) {
        if (response && !response.error && response.data) {
            console.log('Fotos:', response.data);
            
            if (response.data.length === 0) {
                photosContainer.innerHTML = '<p class="loading">Nenhuma foto encontrada</p>';
                return;
            }
            
            photosContainer.innerHTML = '';
            
            response.data.forEach(photo => {
                const photoDiv = document.createElement('div');
                photoDiv.className = 'photo-item';
                
                const img = document.createElement('img');
                img.src = photo.picture;
                img.alt = photo.name || 'Foto';
                
                const overlay = document.createElement('div');
                overlay.className = 'photo-overlay';
                overlay.textContent = '🛡️ Protegida';
                
                photoDiv.appendChild(img);
                photoDiv.appendChild(overlay);
                photosContainer.appendChild(photoDiv);
            });
        } else {
            console.error('Erro ao buscar fotos:', response.error);
            photosContainer.innerHTML = '<p class="loading">Não foi possível carregar as fotos. Verifique as permissões.</p>';
        }
    });
}

// Carregar posts do usuário
function loadUserPosts() {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '<div class="loading">Carregando posts...</div>';
    
    FB.api('/me/posts', {
        fields: 'id,message,created_time',
        limit: 5
    }, function(response) {
        if (response && !response.error && response.data) {
            console.log('Posts:', response.data);
            
            if (response.data.length === 0) {
                postsContainer.innerHTML = '<p class="loading">Nenhum post encontrado</p>';
                return;
            }
            
            postsContainer.innerHTML = '';
            
            response.data.forEach(post => {
                const postDiv = document.createElement('div');
                postDiv.className = 'post-item';
                
                const date = new Date(post.created_time);
                const dateStr = date.toLocaleDateString('pt-BR');
                
                const dateSpan = document.createElement('div');
                dateSpan.className = 'post-date';
                dateSpan.textContent = dateStr;
                
                const messageP = document.createElement('div');
                messageP.className = 'post-message';
                messageP.textContent = post.message || '(Post sem texto)';
                
                postDiv.appendChild(dateSpan);
                postDiv.appendChild(messageP);
                postsContainer.appendChild(postDiv);
            });
        } else {
            console.error('Erro ao buscar posts:', response.error);
            postsContainer.innerHTML = '<p class="loading">Não foi possível carregar os posts. Verifique as permissões.</p>';
        }
    });
}

// Logout
function logout() {
    FB.logout(function(response) {
        console.log('Logout realizado');
        dashboardScreen.classList.remove('active');
        loginScreen.classList.add('active');
        
        // Limpar dados
        document.getElementById('photosContainer').innerHTML = '';
        document.getElementById('postsContainer').innerHTML = '';
    });
}

// Loading helpers
function showLoading() {
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    loadingOverlay.classList.remove('active');
}
