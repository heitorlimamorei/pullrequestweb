function useAuth() {
  const store = window.useState();
  const router = window.useRouter();

  const setToken = async (token, user) => {
    const resp = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${token}`,
      },
    });

    if (!resp.ok) {
      throw new Error("Erro ao validar o token. Verifique e tente novamente.");
    }

    const ghUser = await resp.json();

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);

    const session = {
      token: token,
      email: user?.email || "",
      username: ghUser.login,
      expiration: expirationDate.toISOString(),
      userId: user?.id || "",
    };

    store.setState("session", session);
  };

  const login = async (email, password) => {
    const response = await fetch(`/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: password,
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao realizar o login");
    }

    const user = await response.json();

    await setToken(user.token, user);

    return user;
  };

  const register = async (email, name, password) => {
    const tempSession = store.getState("session");

    if (!tempSession) {
      router.push("token.html");
      return;
    }

    const registerRes = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password: password,
        token: tempSession.token,
      }),
    });

    if (!registerRes.ok) {
      return false;
    }

    const user = await login(email, password);

    if (window.useChatSettings) {
      const chatSettingsStore = window.useChatSettings();

      await chatSettingsStore.setupDefaultSettings(user.id);
    }

    return true;
  };

  const getUserMetadata = async () => {
    const session = store.getState("session");

    if (!session) return;

    const resp = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${session.token}`,
      },
    });

    if (!resp.ok) {
      throw new Error(
        "client error: cannot get the github user metadata may be an incorrect token issue."
      );
    }

    const ghUser = await resp.json();

    return {
      avatar: ghUser.avatar_url,
      username: ghUser.login,
    };
  };

  const getSession = () => {
    const session = store.getState("session");
    const path = router.getPath();

    if (
      !session &&
      path != "/" &&
      path != "/index.html" &&
      path != "/login.html" &&
      path != "register.html" &&
      path != "token.html"
    ) {
      router.push("login.html");
    }
    if (!session) return null;

    const now = new Date();
    const expiration = new Date(session.expiration);

    if (now > expiration) {
      store.setState("session", null);
      router.push("index.html");

      return null;
    }

    return session;
  };

  const logOut = () => {
    localStorage.removeItem("session");
    localStorage.removeItem("current-ai-model");
    localStorage.removeItem("chat-id");
    localStorage.removeItem("apiKeys");
    localStorage.removeItem("chat-messages");
    localStorage.removeItem("chatSettings");

    setTimeout(() => {
      router.push("index.html");
    }, 1000);
  };

  const updateUser = async (updatedFields) => {
    const session = store.getState("session");
    if (!session) {
      throw new Error(
        "Client Error: Sessão não encontrada. Faça login novamente."
      );
    }

    const userId = session.userId;

    const response = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields),
    });

    if (!response.ok) {
      throw new Error("Erro ao atualizar os dados do usuário.");
    }

    const updatedUser = await response.json();

    store.setState("session", {
      ...session,
      ...updatedFields,
    });

    return updatedUser;
  };

  return {
    login,
    setToken,
    register,
    getUserMetadata,
    getSession,
    logOut,
    updateUser,
  };
}

window.useAuth = useAuth;
