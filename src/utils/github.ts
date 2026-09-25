import { ZipFileItem } from '../types';

export async function uploadToGithub(
  token: string,
  repoName: string,
  isPrivate: boolean,
  commitMessage: string,
  files: ZipFileItem[],
  onProgress: (current: number, total: number, currentFile: string) => void
): Promise<string> {
  const headers = {
    Authorization: `Bearer ${token.trim()}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  // 1. Get authenticated user
  const userRes = await fetch('https://api.github.com/user', { headers });
  if (!userRes.ok) {
    const errorJson = await userRes.json().catch(() => ({}));
    throw new Error(errorJson.message || 'Invalid GitHub token. Please verify your Personal Access Token.');
  }
  const userData = await userRes.json();
  const owner = userData.login;

  // 2. Check if repository exists or create it
  let repoRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, { headers });
  let defaultBranch = 'main';

  if (!repoRes.ok) {
    // Create new repo with auto_init: true so it has a default branch & commit
    const createRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: repoName,
        private: isPrivate,
        description: 'Exported and synchronized via CodeZip Liquid Studio',
        auto_init: true,
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to initialize GitHub repository.');
    }
    const createdRepo = await createRes.json();
    defaultBranch = createdRepo.default_branch || 'main';
    // wait a moment for GitHub to initialize branch
    await new Promise((r) => setTimeout(r, 1200));
  } else {
    const existing = await repoRes.json();
    defaultBranch = existing.default_branch || 'main';
  }

  // 3. Get the latest commit SHA of default branch
  let baseCommitSha: string | null = null;
  const refRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/ref/heads/${defaultBranch}`, { headers });
  if (refRes.ok) {
    const refData = await refRes.json();
    baseCommitSha = refData.object.sha;
  }

  // 4. Create blobs for all files
  const fileList = files.filter((f) => !f.isDirectory);
  const treeItems: Array<{ path: string; mode: string; type: string; sha: string }> = [];

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    onProgress(i + 1, fileList.length, file.path);

    // Normalize path (strip leading slash)
    const cleanPath = file.path.replace(/^\/+/, '');

    const content = file.content || '';
    // Use base64 encoding to prevent encoding corruption across international character sets
    const utf8Bytes = new TextEncoder().encode(content);
    let binary = '';
    const len = utf8Bytes.byteLength;
    for (let b = 0; b < len; b++) {
      binary += String.fromCharCode(utf8Bytes[b]);
    }
    const base64Content = btoa(binary);

    const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/blobs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content: base64Content,
        encoding: 'base64',
      }),
    });

    if (!blobRes.ok) {
      const err = await blobRes.json().catch(() => ({}));
      throw new Error(`Failed to upload file "${file.path}": ${err.message || blobRes.statusText}`);
    }

    const blobData = await blobRes.json();
    treeItems.push({
      path: cleanPath,
      mode: '100644',
      type: 'blob',
      sha: blobData.sha,
    });
  }

  // 5. Create Git Tree
  const treeBody: any = {
    tree: treeItems,
  };
  if (baseCommitSha) {
    treeBody.base_tree = baseCommitSha;
  }

  const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/trees`, {
    method: 'POST',
    headers,
    body: JSON.stringify(treeBody),
  });

  if (!treeRes.ok) {
    const err = await treeRes.json().catch(() => ({}));
    throw new Error(`Git tree construction failed: ${err.message || treeRes.statusText}`);
  }
  const treeData = await treeRes.json();

  // 6. Create Commit
  const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/commits`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message: commitMessage || 'Initial import via CodeZip Studio',
      tree: treeData.sha,
      parents: baseCommitSha ? [baseCommitSha] : [],
    }),
  });

  if (!commitRes.ok) {
    const err = await commitRes.json().catch(() => ({}));
    throw new Error(`Commit creation failed: ${err.message || commitRes.statusText}`);
  }
  const commitData = await commitRes.json();

  // 7. Update branch reference to point to new commit
  const updateRefRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/refs/heads/${defaultBranch}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      sha: commitData.sha,
      force: true,
    }),
  });

  if (!updateRefRes.ok) {
    const createRefRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/refs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ref: `refs/heads/${defaultBranch}`,
        sha: commitData.sha,
      }),
    });
    if (!createRefRes.ok) {
      const err = await createRefRes.json().catch(() => ({}));
      throw new Error(`Branch update failed: ${err.message || updateRefRes.statusText}`);
    }
  }

  return `https://github.com/${owner}/${repoName}`;
}
