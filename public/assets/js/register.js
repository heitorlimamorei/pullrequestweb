$(document).ready(function () {
  const useAuth = window.useAuth();

  $("#registerForm").on("submit", async function (e) {
    e.preventDefault();

    const name = $("#name").val().trim();
    const email = $("#email").val().trim();
    const password = $("#password").val();
    const message = $("#registerMessage");

    message.removeClass("text-red-500 text-green-500").text("");

    if (!name || !email || !password) {
      message.addClass("text-red-500").text("Preencha todos os campos.");
      return;
    }

    try {
      const ok = await useAuth.register(email, name, password);
      if (ok) {
        message
          .addClass("text-green-500")
          .text("Cadastro realizado com sucesso!");
        $("#registerForm")[0].reset();
        window.location.href = "pullrequest.html";
      } else {
        message.addClass("text-red-500").text("Erro ao cadastrar.");
      }
    } catch (err) {
      console.error(err);
      message
        .addClass("text-red-500")
        .text("Erro ao se comunicar com o servidor.");
    }
  });
});
