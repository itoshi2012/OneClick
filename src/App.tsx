import React, { useState, useRef, useMemo, useEffect } from 'react';
import JSZip from 'jszip';
import {
  UploadCloud,
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  Github,
  CheckCircle2,
  AlertCircle,
  Download,
  Copy,
  Check,
  Search,
  ExternalLink,
  Lock,
  Globe,
  Sparkles,
  ArrowRight,
  Code2,
  Layers,
  Trash2,
  Plus,
  RefreshCw,
  Sliders,
  ChevronRight,
  FilePlus2,
  FileSpreadsheet,
  Cpu,
  Package,
  Boxes,
  HelpCircle,
} from 'lucide-react';
import { ZipFileItem, GitHubUploadStatus } from './types';
import { uploadToGithub } from './utils/github';

export default function App() {
  const [files, setFiles] = useState<ZipFileItem[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessingZip, setIsProcessingZip] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'insights' | 'deploy'>('editor');
  const [isWordWrap, setIsWordWrap] = useState(true);

  // GitHub Modal & Form State
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [repoName, setRepoName] = useState('my-app');
  const [commitMessage, setCommitMessage] = useState('Initial commit from CodeZip Liquid Studio');
  const [isPrivate, setIsPrivate] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<GitHubUploadStatus>({
    status: 'idle',
    progress: 0,
    total: 0,
  });

  // New File Modal
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFilePath, setNewFilePath] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load sample demo on first visit or on demand
  const loadSampleApp = () => {
    const demoFiles: ZipFileItem[] = [
      {
        path: 'football-app/package.json',
        name: 'package.json',
        isDirectory: false,
        size: 920,
        extension: 'json',
        content: JSON.stringify(
          {
            name: 'football-app',
            version: '1.0.0',
            description: 'Mobile football roster and ratings app powered by React Native and Firebase',
            main: 'App.js',
            scripts: {
              start: 'expo start',
              android: 'expo start --android',
              ios: 'expo start --ios',
            },
            dependencies: {
              expo: '~51.0.0',
              react: '18.2.0',
              'react-native': '0.74.0',
              firebase: '^10.12.0',
              '@react-navigation/native': '^6.1.17',
              '@react-navigation/native-stack': '^6.9.26',
              '@react-navigation/bottom-tabs': '^6.5.20',
              'lucide-react-native': '^0.370.0',
            },
          },
          null,
          2
        ),
      },
      {
        path: 'football-app/App.js',
        name: 'App.js',
        isDirectory: false,
        size: 890,
        extension: 'js',
        content: `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}`,
      },
      {
        path: 'football-app/firebaseConfig.js',
        name: 'firebaseConfig.js',
        isDirectory: false,
        size: 680,
        extension: 'js',
        content: `import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDemoKeyExample4892482",
  authDomain: "football-app-demo.firebaseapp.com",
  projectId: "football-app-demo",
  storageBucket: "football-app-demo.appspot.com",
  messagingSenderId: "953399849956",
  appId: "1:953399849956:web:89a42efd832"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;`,
      },
      {
        path: 'football-app/firestore.rules',
        name: 'firestore.rules',
        isDirectory: false,
        size: 510,
        extension: 'rules',
        content: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /players/{playerId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`,
      },
      {
        path: 'football-app/src/screens/HomeScreen.js',
        name: 'HomeScreen.js',
        isDirectory: false,
        size: 1650,
        extension: 'js',
        content: `import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import PlayerCard from '../components/PlayerCard';
import ExpandingSearchBar from '../components/ExpandingSearchBar';

export default function HomeScreen({ navigation }) {
  const [players] = useState([
    { id: '1', name: 'Lionel Messi', position: 'Forward', rating: 94, club: 'Inter Miami' },
    { id: '2', name: 'Cristiano Ronaldo', position: 'Forward', rating: 92, club: 'Al Nassr' },
    { id: '3', name: 'Kylian Mbappé', position: 'Forward', rating: 91, club: 'Real Madrid' },
    { id: '4', name: 'Erling Haaland', position: 'Striker', rating: 91, club: 'Manchester City' },
    { id: '5', name: 'Kevin De Bruyne', position: 'Midfielder', rating: 91, club: 'Manchester City' },
  ]);
  const [query, setQuery] = useState('');

  const filtered = players.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <View style={styles.container}>
      <Text style={styles.header}>⚽ Football Roster</Text>
      <ExpandingSearchBar value={query} onChangeText={setQuery} placeholder="Search players..." />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlayerCard player={item} onPress={() => navigation.navigate('PlayerProfile', { player: item })} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07090e', padding: 20 },
  header: { fontSize: 26, fontWeight: '700', color: '#f8fafc', marginBottom: 16 },
});`,
      },
      {
        path: 'football-app/src/components/PlayerCard.js',
        name: 'PlayerCard.js',
        isDirectory: false,
        size: 1120,
        extension: 'js',
        content: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function PlayerCard({ player, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.info}>
        <Text style={styles.name}>{player.name}</Text>
        <Text style={styles.details}>{player.club} · {player.position}</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.rating}>{player.rating}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 18,
    marginVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  name: { fontSize: 17, fontWeight: '600', color: '#ffffff' },
  details: { fontSize: 13, color: '#94a3b8', marginTop: 4 },
  badge: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
  },
  rating: { fontSize: 16, fontWeight: '800', color: '#38bdf8' },
});`,
      },
      {
        path: 'football-app/README.md',
        name: 'README.md',
        isDirectory: false,
        size: 610,
        extension: 'md',
        content: `# ⚽ Football App

A modern, fluid React Native & Firebase mobile application for tracking football players and scouting reports.

### ✨ Features
- Live player search & attribute rankings
- Firebase Firestore real-time synchronization
- Role-based admin management console
- Designed with iOS Liquid Glass aesthetic

### 🚀 Getting Started
\`\`\`bash
npm install
npx expo start
\`\`\`
`,
      },
    ];

    setFiles(demoFiles);
    setSelectedFilePath(demoFiles[0].path);
    setRepoName('football-app');
  };

  // Extract uploaded ZIP archive
  const handleZipFile = async (file: File) => {
    setIsProcessingZip(true);
    setZipError(null);
    try {
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(file);
      const extractedFiles: ZipFileItem[] = [];
      let detectedRoot = '';

      for (const [relativePath, zipEntry] of Object.entries(loadedZip.files)) {
        // Filter out macOS / Windows system metadata
        if (
          relativePath.startsWith('__MACOSX/') ||
          relativePath.includes('/.DS_Store') ||
          relativePath.endsWith('Thumbs.db')
        ) {
          continue;
        }

        const name = relativePath.split('/').filter(Boolean).pop() || relativePath;
        const ext = name.includes('.') ? name.split('.').pop()?.toLowerCase() || '' : '';

        if (zipEntry.dir) {
          extractedFiles.push({
            path: relativePath,
            name,
            isDirectory: true,
            size: 0,
            extension: '',
          });
        } else {
          if (!detectedRoot && relativePath.includes('/')) {
            detectedRoot = relativePath.split('/')[0];
          }

          let content = '';
          try {
            content = await zipEntry.async('text');
          } catch {
            content = '[Binary file cannot be previewed directly]';
          }

          extractedFiles.push({
            path: relativePath,
            name,
            isDirectory: false,
            content,
            size: (zipEntry as any)._data?.uncompressedSize || content.length,
            extension: ext,
          });
        }
      }

      if (extractedFiles.length === 0) {
        throw new Error('No valid files found inside the archive.');
      }

      // Sort: folders first, then alphabetically
      extractedFiles.sort((a, b) => {
        if (a.isDirectory === b.isDirectory) {
          return a.path.localeCompare(b.path);
        }
        return a.isDirectory ? -1 : 1;
      });

      setFiles(extractedFiles);
      if (detectedRoot) {
        setRepoName(detectedRoot.toLowerCase().replace(/[^a-z0-9_-]/g, '-'));
      }

      const firstCodeFile = extractedFiles.find((f) => !f.isDirectory);
      if (firstCodeFile) {
        setSelectedFilePath(firstCodeFile.path);
      }
    } catch (err: any) {
      console.error(err);
      setZipError(err.message || 'Failed to read zip archive. Please ensure it is a valid .zip file.');
    } finally {
      setIsProcessingZip(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.name.endsWith('.zip') || dropped.type.includes('zip')) {
        handleZipFile(dropped);
      } else {
        setZipError('Please upload a valid .zip archive file.');
      }
    }
  };

  // Currently selected file object
  const selectedFile = useMemo(() => {
    return files.find((f) => f.path === selectedFilePath) || null;
  }, [files, selectedFilePath]);

  const updateSelectedFileContent = (newContent: string) => {
    if (!selectedFile) return;
    setFiles((prev) =>
      prev.map((f) => (f.path === selectedFile.path ? { ...f, content: newContent, size: newContent.length } : f))
    );
  };

  const handleCreateNewFile = () => {
    if (!newFilePath.trim()) return;
    const cleanPath = newFilePath.trim().replace(/^\/+/, '');
    const name = cleanPath.split('/').pop() || cleanPath;
    const ext = name.includes('.') ? name.split('.').pop()?.toLowerCase() || '' : '';

    const newFile: ZipFileItem = {
      path: cleanPath,
      name,
      isDirectory: false,
      content: '// New file created in CodeZip Studio\n',
      size: 40,
      extension: ext,
    };

    setFiles((prev) => [newFile, ...prev]);
    setSelectedFilePath(cleanPath);
    setNewFilePath('');
    setShowNewFileModal(false);
  };

  const handleDeleteFile = (pathToDelete: string) => {
    if (confirm(`Are you sure you want to remove "${pathToDelete}"?`)) {
      setFiles((prev) => prev.filter((f) => f.path !== pathToDelete));
      if (selectedFilePath === pathToDelete) {
        const remaining = files.filter((f) => f.path !== pathToDelete && !f.isDirectory);
        setSelectedFilePath(remaining.length > 0 ? remaining[0].path : null);
      }
    }
  };

  const copyCode = () => {
    if (!selectedFile?.content) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAllZip = async () => {
    if (files.length === 0) return;
    const zip = new JSZip();
    files.forEach((file) => {
      if (!file.isDirectory && file.content !== undefined) {
        zip.file(file.path, file.content);
      }
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${repoName || 'app-codebase'}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStartGithubUpload = async () => {
    if (!githubToken.trim()) {
      alert('Please enter your GitHub Personal Access Token.');
      return;
    }
    if (!repoName.trim()) {
      alert('Please specify a repository name.');
      return;
    }

    setUploadStatus({
      status: 'creating_repo',
      progress: 0,
      total: files.filter((f) => !f.isDirectory).length,
    });

    try {
      const repoUrl = await uploadToGithub(
        githubToken,
        repoName.trim(),
        isPrivate,
        commitMessage,
        files,
        (current, total, currentFile) => {
          setUploadStatus({
            status: 'uploading_files',
            progress: current,
            total,
            currentFile,
          });
        }
      );

      setUploadStatus({
        status: 'success',
        progress: files.filter((f) => !f.isDirectory).length,
        total: files.filter((f) => !f.isDirectory).length,
        repoUrl,
      });
    } catch (err: any) {
      setUploadStatus({
        status: 'error',
        progress: 0,
        total: 0,
        errorMessage: err.message || 'Failed to complete GitHub synchronization.',
      });
    }
  };

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    return files.filter((f) => f.path.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [files, searchQuery]);

  const fileStats = useMemo(() => {
    const codeFiles = files.filter((f) => !f.isDirectory);
    const totalFiles = codeFiles.length;
    const totalFolders = files.filter((f) => f.isDirectory).length;
    const totalBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
    const sizeKB = (totalBytes / 1024).toFixed(1);

    // Count approximate lines
    let totalLines = 0;
    codeFiles.forEach((f) => {
      if (f.content) {
        totalLines += f.content.split('\n').length;
      }
    });

    // Detect package dependencies if package.json exists
    let depsCount = 0;
    const pkgFile = codeFiles.find((f) => f.name === 'package.json');
    if (pkgFile && pkgFile.content) {
      try {
        const parsed = JSON.parse(pkgFile.content);
        depsCount = Object.keys(parsed.dependencies || {}).length + Object.keys(parsed.devDependencies || {}).length;
      } catch {
        // Ignore json parse error
      }
    }

    return { totalFiles, totalFolders, sizeKB, totalLines, depsCount };
  }, [files]);

  const getFileIcon = (fileName: string, isDirectory: boolean) => {
    if (isDirectory) return <Folder className="w-4 h-4 text-amber-400 shrink-0" />;
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />;
      case 'json':
        return <FileJson className="w-4 h-4 text-amber-300 shrink-0" />;
      case 'md':
      case 'txt':
        return <FileText className="w-4 h-4 text-blue-400 shrink-0" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Liquid Ambient Lighting Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px]" />
      </div>

      {/* iOS Liquid Navigation Bar */}
      <header className="sticky top-0 z-40 liquid-glass border-b border-white/[0.08] px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <Github className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-sm tracking-tight text-white">CodeZip Liquid Studio</h1>
              <span className="text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-full bg-white/[0.08] text-cyan-300 font-medium border border-white/[0.08]">
                iOS 18 Glass Edition
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Direct Zip unpacker, inspector & instant GitHub publisher</p>
          </div>
        </div>

        {/* Center iOS Segmented Control (Active when files exist) */}
        {files.length > 0 && (
          <div className="hidden md:flex items-center p-1 rounded-2xl bg-white/[0.05] border border-white/[0.08] backdrop-blur-md">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'editor'
                  ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Source Explorer
            </button>

            <button
              onClick={() => setActiveTab('insights')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'insights'
                  ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Architecture Insights
            </button>

            <button
              onClick={() => {
                setActiveTab('deploy');
                setShowGithubModal(true);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'deploy'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 shadow-sm ring-1 ring-emerald-500/30'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <Github className="w-3.5 h-3.5" />
              Publish to GitHub
            </button>
          </div>
        )}

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5">
          {files.length > 0 && (
            <>
              <button
                onClick={handleDownloadAllZip}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 rounded-xl border border-white/[0.08] transition shadow-sm"
                title="Download Cleaned Archive"
              >
                <Download className="w-3.5 h-3.5" />
                Export Zip
              </button>

              <button
                onClick={() => setShowGithubModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-500/25 ring-1 ring-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Github className="w-4 h-4" />
                Publish to GitHub
              </button>
            </>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleZipFile(e.target.files[0]);
              }
            }}
            accept=".zip,application/zip"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-white/[0.08] hover:bg-white/[0.14] text-white rounded-xl border border-white/[0.12] transition shadow-sm"
          >
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            {files.length > 0 ? 'Load Another Zip' : 'Select Zip'}
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {files.length === 0 ? (
          /* Empty / Upload Liquid Dropzone */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full liquid-glass rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                isDragging
                  ? 'border-cyan-400/60 bg-cyan-500/10 scale-[1.01]'
                  : 'hover:border-white/20 hover:bg-white/[0.04]'
              }`}
            >
              {/* Liquid Radial Glow inside card */}
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />

              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/15 to-indigo-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300 mb-5 shadow-inner transition-transform group-hover:scale-105 duration-300">
                <UploadCloud className="w-9 h-9" />
              </div>

              <h2 className="text-xl font-semibold text-white tracking-tight mb-2">
                Drop your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">code archive (.zip)</span> here
              </h2>
              <p className="text-xs text-slate-400 mb-6 max-w-md leading-relaxed">
                Decompresses directly in your browser. Inspect and modify source files, then push directly to GitHub in one seamless step.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-500/25 ring-1 ring-white/20 transition-all hover:scale-[1.02]"
                >
                  Browse .zip from Device
                </button>
              </div>
            </div>

            {isProcessingZip && (
              <div className="mt-5 flex items-center gap-2.5 text-xs text-cyan-400 liquid-card px-4 py-2 rounded-xl">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Unpacking archive in memory...
              </div>
            )}

            {zipError && (
              <div className="mt-5 flex items-center gap-2 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/40 px-4 py-2.5 rounded-xl">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                {zipError}
              </div>
            )}

            {/* Quick Demo Option for Immediate Exploration */}
            <div className="mt-10 border-t border-white/[0.06] pt-6 w-full flex flex-col items-center">
              <span className="text-xs text-slate-500 mb-3">Don't have a zip archive right now?</span>
              <button
                onClick={loadSampleApp}
                className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 text-xs font-medium rounded-xl transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Load Sample Football App Codebase
              </button>
            </div>
          </div>
        ) : activeTab === 'insights' ? (
          /* iOS Architecture Insights View */
          <div className="flex-1 p-8 overflow-y-auto max-w-5xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white tracking-tight">Project Architecture Insights</h2>
                <p className="text-xs text-slate-400">High-level code breakdown and detected runtime packages</p>
              </div>
              <button
                onClick={() => setActiveTab('editor')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-xl"
              >
                Back to Source Editor
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* iOS Metric Widgets Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="liquid-glass rounded-2xl p-5 border border-white/[0.08]">
                <div className="text-slate-400 text-xs font-medium flex items-center gap-2 mb-2">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  Source Files
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">{fileStats.totalFiles}</div>
                <div className="text-[11px] text-slate-500 mt-1">{fileStats.totalFolders} folders detected</div>
              </div>

              <div className="liquid-glass rounded-2xl p-5 border border-white/[0.08]">
                <div className="text-slate-400 text-xs font-medium flex items-center gap-2 mb-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Total Lines of Code
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  {fileStats.totalLines.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Across all readable scripts</div>
              </div>

              <div className="liquid-glass rounded-2xl p-5 border border-white/[0.08]">
                <div className="text-slate-400 text-xs font-medium flex items-center gap-2 mb-2">
                  <Boxes className="w-4 h-4 text-blue-400" />
                  Uncompressed Size
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">{fileStats.sizeKB} KB</div>
                <div className="text-[11px] text-slate-500 mt-1">Ready for repository upload</div>
              </div>

              <div className="liquid-glass rounded-2xl p-5 border border-white/[0.08]">
                <div className="text-slate-400 text-xs font-medium flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-amber-400" />
                  Detected Packages
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">{fileStats.depsCount}</div>
                <div className="text-[11px] text-slate-500 mt-1">From package.json manifest</div>
              </div>
            </div>

            {/* Quick Readiness Checklist */}
            <div className="liquid-glass rounded-2xl p-6 border border-white/[0.08] space-y-4">
              <h3 className="text-sm font-semibold text-white">Repository Publishing Checklist</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>All archive files unpacked and normalized into clean UTF-8 Git trees.</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Hidden OS metadata (__MACOSX, .DS_Store) automatically pruned.</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Ready for 1-click push to GitHub via GitHub Git Database API.</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => setShowGithubModal(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg transition"
                >
                  Proceed to Publish to GitHub
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Source Explorer & Code Editor */
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left Sidebar: iOS File Tree */}
            <aside className="w-full lg:w-80 border-r border-white/[0.08] liquid-glass flex flex-col shrink-0">
              <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Workspace Files</span>
                  <span className="text-[10px] text-slate-400 font-normal">({fileStats.totalFiles})</span>
                </div>
                <button
                  onClick={() => setShowNewFileModal(true)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition"
                  title="Add new file"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* iOS Search Field */}
              <div className="p-2.5 border-b border-white/[0.08]">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by file name or extension..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 focus:bg-white/[0.07] transition"
                  />
                </div>
              </div>

              {/* File List */}
              <div className="flex-1 overflow-y-auto max-h-[40vh] lg:max-h-[calc(100vh-170px)] divide-y divide-white/[0.02]">
                {filteredFiles.map((file, idx) => {
                  const isSelected = selectedFilePath === file.path;
                  return (
                    <div
                      key={idx}
                      onClick={() => !file.isDirectory && setSelectedFilePath(file.path)}
                      className={`group w-full px-3 py-2 flex items-center justify-between text-xs transition cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/15 text-cyan-300 border-l-2 border-cyan-400 font-medium'
                          : file.isDirectory
                          ? 'bg-white/[0.02] text-slate-400 cursor-default font-semibold'
                          : 'text-slate-300 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate flex-1 mr-2">
                        {getFileIcon(file.name, file.isDirectory)}
                        <span className="truncate" title={file.path}>
                          {file.path}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!file.isDirectory && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {file.size ? `${(file.size / 1024).toFixed(1)}k` : ''}
                          </span>
                        )}
                        {!file.isDirectory && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFile(file.path);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition"
                            title="Remove file"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Quick Push Action */}
              <div className="p-3 border-t border-white/[0.08] bg-white/[0.02]">
                <button
                  onClick={() => setShowGithubModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-500/20 ring-1 ring-white/20 transition"
                >
                  <Github className="w-4 h-4" />
                  Publish {fileStats.totalFiles} Files to GitHub
                </button>
              </div>
            </aside>

            {/* Right Editor Frame */}
            <section className="flex-1 flex flex-col bg-[#05070d] min-w-0">
              {selectedFile ? (
                <>
                  {/* Editor Top Bar */}
                  <div className="border-b border-white/[0.08] liquid-glass px-5 py-2.5 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5 truncate">
                      {getFileIcon(selectedFile.name, false)}
                      <span className="text-xs font-medium text-slate-100 font-mono truncate">
                        {selectedFile.path}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] text-slate-400 uppercase font-mono">
                        {selectedFile.extension || 'code'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Word Wrap Toggle */}
                      <button
                        onClick={() => setIsWordWrap(!isWordWrap)}
                        className={`px-2.5 py-1 text-xs rounded-lg border transition ${
                          isWordWrap
                            ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                            : 'bg-white/[0.04] text-slate-400 border-white/[0.08]'
                        }`}
                        title="Toggle Word Wrap"
                      >
                        Wrap
                      </button>

                      {/* Copy Code */}
                      <button
                        onClick={copyCode}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 rounded-lg border border-white/[0.08] transition"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>

                      {/* Download Single File */}
                      <button
                        onClick={() => {
                          const blob = new Blob([selectedFile.content || ''], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = selectedFile.name;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] rounded-lg border border-white/[0.08] transition"
                        title="Download this file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Liquid Text Editor */}
                  <div className="flex-1 flex overflow-hidden">
                    <textarea
                      value={selectedFile.content || ''}
                      onChange={(e) => updateSelectedFileContent(e.target.value)}
                      wrap={isWordWrap ? 'soft' : 'off'}
                      spellCheck={false}
                      className="flex-1 w-full h-full bg-[#070911] p-5 font-mono text-xs leading-relaxed text-slate-200 resize-none focus:outline-none selection:bg-cyan-500/30 selection:text-cyan-200"
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <Code2 className="w-12 h-12 mb-3 text-slate-600" />
                  <p className="text-sm">Select any file from the sidebar to inspect or edit</p>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* New File Modal Sheet */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="liquid-sheet rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-white/[0.12]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Create New File</h3>
              <button
                onClick={() => setShowNewFileModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-white/[0.05]"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Provide relative file path (e.g. <code className="text-cyan-300">src/components/Header.js</code>)
            </p>
            <input
              type="text"
              value={newFilePath}
              onChange={(e) => setNewFilePath(e.target.value)}
              placeholder="e.g. src/config.js"
              className="w-full px-3.5 py-2 text-xs bg-white/[0.04] border border-white/[0.1] rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowNewFileModal(false)}
                className="px-3.5 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewFile}
                className="px-4 py-2 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition"
              >
                Create File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Liquid Modal Sheet: GitHub Sync */}
      {showGithubModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="liquid-sheet rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-white/[0.12]">
            {/* Sheet Header */}
            <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Publish Directly to GitHub</h3>
                  <p className="text-[11px] text-slate-400">No Git installation or command line needed</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (uploadStatus.status !== 'uploading_files') {
                    setShowGithubModal(false);
                  }
                }}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] transition"
              >
                ✕
              </button>
            </div>

            {/* Sheet Body */}
            <div className="p-6 space-y-5">
              {uploadStatus.status === 'success' ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-semibold text-white tracking-tight">Repository Published Successfully!</h4>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                    All {uploadStatus.total} files have been committed directly to your GitHub repository main branch.
                  </p>
                  {uploadStatus.repoUrl && (
                    <a
                      href={uploadStatus.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-500/25 transition mt-2"
                    >
                      <Github className="w-4 h-4" />
                      Open Repository on GitHub
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ) : (
                <>
                  {/* Repository Name */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Repository Name
                    </label>
                    <input
                      type="text"
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                      placeholder="e.g. football-app"
                      className="w-full px-3.5 py-2.5 text-xs bg-white/[0.04] border border-white/[0.1] rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/80 transition"
                    />
                  </div>

                  {/* Commit Message */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Commit Message
                    </label>
                    <input
                      type="text"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      placeholder="Initial commit via CodeZip"
                      className="w-full px-3.5 py-2.5 text-xs bg-white/[0.04] border border-white/[0.1] rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/80 transition"
                    />
                  </div>

                  {/* iOS Style Switch for Visibility */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div>
                      <span className="text-xs font-medium text-white block">Repository Visibility</span>
                      <span className="text-[11px] text-slate-400">
                        {isPrivate ? 'Private (only you and collaborators)' : 'Public (visible to anyone)'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsPrivate(!isPrivate)}
                      className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center p-0.5 ${
                        isPrivate ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5.5 h-5.5 bg-white rounded-full shadow-md transition-transform ${
                          isPrivate ? 'translate-x-5.5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* GitHub Personal Access Token */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-slate-300">
                        GitHub Personal Access Token (PAT)
                      </label>
                      <a
                        href="https://github.com/settings/tokens/new?scopes=repo&description=CodeZip+Liquid+Studio"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline"
                      >
                        Generate Token in 30s
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <input
                      type="password"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3.5 py-2.5 text-xs bg-white/[0.04] border border-white/[0.1] rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono transition"
                    />
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                      Token requires the <code className="text-cyan-400/80">repo</code> scope. It is held only in browser memory during export.
                    </p>
                  </div>

                  {/* Live Fluid Progress */}
                  {uploadStatus.status === 'uploading_files' && (
                    <div className="p-4 liquid-glass rounded-2xl border border-white/[0.08] space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-slate-200">
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                          Uploading files... ({uploadStatus.progress}/{uploadStatus.total})
                        </span>
                        <span className="font-mono text-cyan-300 font-semibold">
                          {Math.round((uploadStatus.progress / uploadStatus.total) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-300 rounded-full"
                          style={{
                            width: `${(uploadStatus.progress / (uploadStatus.total || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      {uploadStatus.currentFile && (
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          {uploadStatus.currentFile}
                        </p>
                      )}
                    </div>
                  )}

                  {uploadStatus.status === 'error' && (
                    <div className="p-3.5 bg-rose-950/40 border border-rose-800/40 rounded-2xl text-xs text-rose-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{uploadStatus.errorMessage}</span>
                    </div>
                  )}

                  {/* Main Action Trigger */}
                  <div className="pt-2">
                    <button
                      onClick={handleStartGithubUpload}
                      disabled={uploadStatus.status === 'uploading_files' || uploadStatus.status === 'creating_repo'}
                      className="w-full py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-2xl shadow-xl shadow-cyan-500/25 ring-1 ring-white/20 transition-all flex items-center justify-center gap-2"
                    >
                      {uploadStatus.status === 'uploading_files' || uploadStatus.status === 'creating_repo' ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Synchronizing with GitHub...
                        </>
                      ) : (
                        <>
                          <Github className="w-4 h-4" />
                          Publish to GitHub Repository
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
