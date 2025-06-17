$(document).ready(function () {
  $("#loginForm").submit(async function (e) {
    e.preventDefault();

    const email = $("#email").val().trim();
    const password = $("#password").val().trim();
    const message = $("#loginMessage");

    message.removeClass("text-red-500 text-green-500").text("");

    if (!email || !password) {
      message
        .addClass("text-red-500")
        .text("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const useAuth = window.useAuth();

      const user = await useAuth.login(email, password);

      if (user) {
        message.addClass("text-green-500").text("Login realizado com sucesso!");
        setTimeout(() => {
          window.location.href = "pullrequest.html";
        }, 1000);
      } else {
        message.addClass("text-red-500").text("Senha incorreta.");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      message.addClass("text-red-500").text("Erro ao tentar fazer login.");
    }
  });
});
