function newJobsProcessor(store, ghClient) {  
  const queue = {
    pop() {
      const queue = store.getState("queue");

      if (!queue || !Array.isArray(queue)) {
        store.setState("queue", []);
        return null;
      }

      if (queue.length == 0) {
        console.log("Client warning: the queue is empty");
        return null;
      }

      const current = queue[queue.length - 1];

      store.setState("queue", queue.slice(0, -1));

      return current;
    },
    enqueue(job) {
      const queue = store.getState("queue");

      if (!queue || !Array.isArray(queue)) {
        store.setState("queue", [job]);

        return;
      }

      store.appendItem("queue", job);
    },
  };

  return {
    async processNextJob() {
      if (!ghClient) return null;
      
      const currentJob = queue.pop();

      console.log("Client: Processing ", currentJob);

      try {
        const commits = await ghClient.getCommitsFromGitHub({
          owner: currentJob.owner,
          repo: currentJob.repo,
          baseBranch: currentJob.baseBranch,
          headBranch: currentJob.headBranch,
          githubToken: currentJob.githubToken,
        });

        console.log("Client: process completed. Commits:", commits);

        return commits;
      } catch (error) {
        console.error("Client error:", error);
        throw error;
      }
    },

    addJob(job) {    
      queue.enqueue(job);
    },
  };
};


window.newJobsProcessor = newJobsProcessor;