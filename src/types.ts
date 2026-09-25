export interface ZipFileItem {
  path: string;
  name: string;
  isDirectory: boolean;
  content?: string;
  size: number;
  extension: string;
}

export interface GitHubUploadStatus {
  status: 'idle' | 'creating_repo' | 'uploading_files' | 'success' | 'error';
  progress: number;
  total: number;
  currentFile?: string;
  repoUrl?: string;
  errorMessage?: string;
}
