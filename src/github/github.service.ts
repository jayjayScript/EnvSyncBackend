import { Injectable } from '@nestjs/common';

@Injectable()
export class GithubService {

  private async getClient(accessToken: string) {
    const { Octokit } = await import('@octokit/rest');

    return new Octokit({
      auth: accessToken,
    });
  }

  // Fetch all repos the user has access to (own + org)
  async getUserRepos(accessToken: string) {
    const octokit = await this.getClient(accessToken);

    const { data } = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
      affiliation: 'owner,collaborator,organization_member',
    });

    return data.map((repo) => ({
      repoId: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      defaultBranch: repo.default_branch,
      private: repo.private,
      owner: repo.owner.login,
    }));
  }

  // // Fetch teams for org repos (used for member sync)
  // async getRepoCollaborators(accessToken: string, owner: string, repo: string) {
  //   const octokit = await this.getClient(accessToken);
  //   const { data } = octokit.repos.listCollaborators({ owner, repo });

  //   return data.map((c) => ({
  //     githubId: c.id,
  //     username: c.login,
  //     role: c.role_name, // "admin", "maintain", "write", "read"
  //   }));
  // }

  // Fetch a single repo
  async getRepo(accessToken: string, owner: string, repo: string) {
    const octokit = await this.getClient(accessToken);

    const { data } = await octokit.repos.get({ owner, repo });

    return {
      repoId: data.id,
      name: data.name,
      fullName: data.full_name,
      url: data.html_url,
      defaultBranch: data.default_branch,
      private: data.private,
    };
  }

  async createWebhook(
    accessToken: string,
    owner: string,
    repo: string,
  ) {
    const octokit = await this.getClient(accessToken);

    const { data } = await octokit.repos.createWebhook({
      owner,
      repo,
      config: {
        url: `${process.env.API_URL}/github/webhook`,
        content_type: 'json',
        secret: process.env.GITHUB_WEBHOOK_SECRET,
        insecure_ssl: '0',
      },
      events: ['push', 'pull_request'],
    });

    return data;
  }
}