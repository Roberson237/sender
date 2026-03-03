'use client'
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Framefileinfo from "./Frameshowinfo";
import Circularup from "./Progressbarup";
import Navbar from '../Navbar';
import { FaUpload, FaCloudUploadAlt, FaFolder } from 'react-icons/fa';
import JSZip from 'jszip';

export default function Uploade() {
  const [uploadState, setUploadState] = useState('idle');
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  // Fonction pour compresser un dossier en ZIP OPTIMISÉE
  const zipFolder = async (files, onProgress) => {
    const zip = new JSZip();
    const folderName = files[0].webkitRelativePath.split('/')[0];
    const totalFiles = files.length;

    console.log(`📦 Compression rapide de ${totalFiles} fichiers...`);

    // OPTIMISATION : Pas de compression pour aller plus vite
    onProgress(20);
    
    // Ajouter tous les fichiers en une fois (plus rapide)
    files.forEach((file) => {
      const relativePath = file.webkitRelativePath;
      zip.file(relativePath, file, { 
        compression: "STORE"
      });
    });

    onProgress(60);
    
    // Génération rapide sans callback de progression détaillée
    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: "STORE",
      compressionOptions: { level: 0 }
    });

    onProgress(90);
    
    return new File([zipBlob], `${folderName}.zip`, { 
      type: 'application/zip',
      lastModified: Date.now()
    });
  };

  // Gestion de la sélection de fichiers/dossiers OPTIMISÉE
  const handleFileSelect = async (files) => {
    console.log('🔄 Files selected:', files.length, 'items');
    
    let fileToUpload;
    let isFolder = files.length > 1 && files[0].webkitRelativePath;
    
    // Si c'est un dossier
    if (isFolder) {
      console.log('📁 Dossier détecté, compression rapide en cours...');
      setUploadState('loading');
      setIsCompressing(true);
      setProgress(10);
      
      try {
        // Compression en arrière-plan
        fileToUpload = await zipFolder(Array.from(files), (currentProgress) => {
          setProgress(currentProgress);
        });

        console.log('✅ Dossier compressé:', fileToUpload.name);
        setProgress(95);
        setIsCompressing(false);
        
      } catch (error) {
        console.error('❌ Erreur lors de la compression:', error);
        setProgress(0);
        setUploadState('idle');
        setIsCompressing(false);
        return;
      }
    } else {
      // Fichier unique
      setUploadState('loading');
      setProgress(0);
      fileToUpload = files[0];

      // Upload réel avec progression
      const formData = new FormData();
      formData.append('file', fileToUpload);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setProgress(100);
          setSelectedFile(fileToUpload);
          setUploadState('ready');
          console.log('✅ Upload completed');
        } else {
          console.error('Upload failed');
          setUploadState('idle');
          setProgress(0);
        }
      });

      xhr.addEventListener('error', () => {
        console.error('Upload error');
        setUploadState('idle');
        setProgress(0);
      });

      xhr.open('POST', '/api/new_file');
      xhr.send(formData);
    }
  };

  // Gestion du click sur le bouton fichier
  const handleFileUploadClick = () => {
    console.log('🎯 File upload button clicked');
    fileInputRef.current?.click();
  };

  // Gestion du click sur le bouton dossier
  const handleFolderUploadClick = () => {
    console.log('🎯 Folder upload button clicked');
    folderInputRef.current?.click();
  };

  // Gestion de la sélection via input file
  const handleFileInputChange = (event) => {
    console.log('📁 File input changed');
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    event.target.value = '';
  };

  // Gestion de la sélection via input dossier
  const handleFolderInputChange = (event) => {
    console.log('📁 Folder input changed');
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    event.target.value = '';
  };

  // Gestion du drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    console.log('📤 Files dropped');
    const files = e.dataTransfer.files;
    
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleCloseFrame = () => {
    console.log('🔙 Closing frame, returning to idle');
    setUploadState('idle');
    setSelectedFile(null);
    setProgress(0);
    setIsCompressing(false);
  };

  return (
    <div 
      className="fixed top-0 left-0 z-50 min-h-screen w-full bg-[#051b31] text-white flex flex-col items-center justify-center px-6 pt-28"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Input file caché */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.gif,.txt,.doc,.docx,.zip,.exe"
        multiple
      />
      
      {/* Input dossier caché */}
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderInputChange}
        className="hidden"
        webkitdirectory="true"
        mozdirectory="true"
        directory="true"
      />
      
      <Navbar />
      
      {/* Overlay de drag & drop */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            className="fixed inset-0 bg-blue-600/50 backdrop-blur-sm border-4 border-blue-400 border-dashed rounded-lg z-40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="text-white text-3xl font-bold bg-blue-600/90 px-10 py-6 rounded-2xl shadow-2xl flex items-center gap-4"
            >
              <FaCloudUploadAlt className="animate-bounce" />
              Drop your files or folder here!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* État initial - Boutons d'upload */}
      {uploadState === 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          className="flex flex-col items-center justify-center gap-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              onClick={handleFileUploadClick}
              className="flex items-center gap-4 px-8 py-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-emerald-400/50"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <FaUpload size={24} />
              </motion.div>
              Upload Files
            </motion.button>

            <motion.button
              onClick={handleFolderUploadClick}
              className="flex items-center gap-4 px-8 py-5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-purple-400/50"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: -10 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <FaFolder size={24} />
              </motion.div>
              Upload Folder
            </motion.button>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.5 } }}
            className="text-gray-300 text-center"
          >
            <p className="text-lg mb-2">or drag and drop files or folders anywhere</p>
            <p className="text-sm text-gray-400">
              Supports: PDF, Images, Text, Word documents, Folders
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Folders are automatically compressed • Max size: 100MB
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* État de chargement */}
      {uploadState === 'loading' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="flex flex-col items-center justify-center gap-6"
        >
          <Circularup percentage={progress} isLoading={progress < 100} />
          
          {selectedFile && progress > 0 && progress < 100 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <p className="text-lg font-semibold text-green-300">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <p className="text-xl font-medium text-white mb-2">
              {isCompressing ? `Compressing folder... ${progress}%` : 
               progress < 100 ? `Processing file... ${progress}%` : 'Ready!'}
            </p>
            <div className="w-64 bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* État prêt - Frame avec informations */}
      <AnimatePresence>
        {uploadState === 'ready' && selectedFile && (
          <Framefileinfo 
            file={selectedFile}
            onClose={handleCloseFrame}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 1 } }}
        className="absolute bottom-8 text-center text-gray-400 text-sm"
      >
        <p>Secure file sharing with Sendsey</p>
        <p className="text-xs mt-1">Files and folders are encrypted and protected</p>
      </motion.div>
    </div>
  );
}