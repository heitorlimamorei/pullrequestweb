$(document).ready(function () {
  const authStore = window.useAuth();
  const router = window.useRouter();

  // Redireciona para a página de login
  $('#loginBtn').on('click', function () {
     router.push('login.html');
  });

  // Redireciona para a página de cadastro
  $('#startBtn').on('click', function () {
    const session = authStore.getSession();

    if (session) {
      router.push("pullrequest.html");
    } else {
      router.push("token.html");
    }
    
  });
});
