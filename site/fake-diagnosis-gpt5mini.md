Problem summary
- Antora cannot clone https://github.com/FoodTruckNerds/onboarding.git and fails with HTTP 401 ("HTTP Basic: Access Denied").
- Your workflow already injects a PAT into GIT_CREDENTIALS, but the clone still fails — most likely Git on the runner is not actually using that env variable for authentication. The most reliable fix in Actions is to populate ~/.netrc with the PAT so git will use it for HTTPS clones.

Solution
Add a step before the "Build Antora site" step that creates a .netrc entry for github.com using your PAT from the ANTORA_GITHUB_TOKEN secret. This ensures git uses the PAT for HTTPS clones of other repositories.

Apply this change to .github/workflows/build-and-deploy.yml (use the job ref 0e9b4ce65fde857727e6fd0997df30ecf8496313).

Suggested YAML patch (insert before the Build Antora site step):

- name: Add GitHub credentials to .netrc
  working-directory: ./site
  env:
    ANTORA_GITHUB_TOKEN: ${{ secrets.ANTORA_GITHUB_TOKEN }}
  run: |
    # write netrc so git uses the PAT for https://github.com clones
    printf "machine github.com\n  login x-access-token\n  password %s\n" "$ANTORA_GITHUB_TOKEN" > $HOME/.netrc
    chmod 600 $HOME/.netrc

Then keep (or update) the Build Antora site step to provide the same secret if you want to keep GIT_CREDENTIALS for Antora:

- name: Build Antora site
  working-directory: ./site
  env:
    GIT_CREDENTIALS: "x-access-token:${{ secrets.ANTORA_GITHUB_TOKEN }}"
  run: pnpm exec antora --stacktrace antora-playbook.yml

Why this works
- Git honors ~/.netrc for HTTP Basic authentication; populating it with machine github.com + login x-access-token + password <PAT> causes git to send the PAT when cloning GitHub over HTTPS.
- Antora’s credential flow will then succeed when it runs git clone for external content repos.

Additional checks if it still fails
- Confirm the secret is present and non-empty: Repository → Settings → Secrets & variables → Actions → ANTORA_GITHUB_TOKEN.
- Confirm the PAT is approved for organization SSO if your org requires SAML/SSO.
- Verify the playbook actually references https://github.com/FoodTruckNerds/onboarding.git (log indicates this URL).
- Run locally to reproduce:
  GIT_TERMINAL_PROMPT=0 GIT_TRACE=1 ANTORA_GITHUB_TOKEN=yourPAT \
    bash -c 'printf "machine github.com\n  login x-access-token\n  password %s\n" "$ANTORA_GITHUB_TOKEN" > ~/.netrc && pnpm exec antora antora-playbook.yml'
- If you prefer SSH, change the playbook to SSH URLs and configure a deploy key and ssh-agent in the workflow instead.

If you want, I can produce the exact commit/patch file content to apply this change in a branch/PR.