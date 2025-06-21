function useRouter() {
  const getQueryParam = (key) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  };

  const onPopState = (callback) => {
    window.addEventListener("popstate", callback);
  };

  const push = (path) => {
    window.location.href = path;
  };

  const getPath = () => window.location.pathname;

  const getUrl = () => window.location.href;

  return {
    push,
    query: getQueryParam,
    getPath,
    getUrl,
    onPopState,
  };
}

window.useRouter = useRouter;
