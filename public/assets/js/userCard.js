function UserCard() {
  const auth = window.useAuth();

  const renderUserCard = async (container) => {
    const session = auth.getSession();
    
    if (!session) {
      container.append(`
        <button id="loginBtn" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Login
        </button>
      `);
      
      $('#loginBtn').on('click', () => {
        window.location.href = '/login.html';
      });
      return;
    }

    try {
      const user = await auth.getUserMetadata();

      const card = $(`
        <div id="user-card" class="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2 shadow-sm cursor-pointer hover:bg-gray-200 transition">
          <img src="${user.avatar}" alt="Avatar do GitHub" class="w-9 h-9 rounded-full border border-gray-300" />
          <span class="text-sm font-medium text-gray-800">@${session.username || user.username}</span>
        </div>
      `);

      // Adiciona o evento de clique para redirecionar
      card.on('click', () => {
        window.location.href = '/settings.html';
      });

      container.append(card);
    } catch (error) {
      console.error("Erro ao obter metadata do usuário:", error);
      container.empty().append(`
        <button id="loginBtn" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Login
        </button>
      `);
    }
  };

  const render = () => {
    const container = $("#userContainer");
    container.empty();
    renderUserCard(container);
  };

  return {
    render,
  };
}

// Auto-inicialização
$(document).ready(function() {
  window.userCard = new UserCard();
  window.userCard.render();
});