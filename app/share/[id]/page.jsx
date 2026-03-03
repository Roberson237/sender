'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDownload, FaFile, FaLock, FaEye, FaEyeSlash, FaCloudDownloadAlt, FaFileAlt } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import Navbar from '../../page/Navbar';

export default function SharePage() {
    const params = useParams();
    const [fileInfo, setFileInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [needsPassword, setNeedsPassword] = useState(false);

    useEffect(() => {
        const fetchFileInfo = async () => {
            try {
                const response = await fetch(`/api/share/${params.id}`);
                const data = await response.json();

                if (data.success) {
                    setFileInfo(data);
                    setNeedsPassword(data.hasPassword);
                } else {
                    setError(data.error);
                }
            } catch (err) {
                setError('Erreur lors du chargement du fichier');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchFileInfo();
        }
    }, [params.id]);

    const handleDownload = async () => {
        if (needsPassword && !password) return;

        setDownloading(true);
        try {
            const downloadUrl = needsPassword ? `/api/download/${params.id}?password=${encodeURIComponent(password)}` : `/api/download/${params.id}`;

            const response = await fetch(downloadUrl);
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            saveAs(blob, fileInfo.fileName);
        } catch (error) {
            console.error('Download failed', error);
            alert('Échec du téléchargement. Vérifiez le mot de passe.');
        } finally {
            setDownloading(false);
        }
    };

    const formatSize = (bytes) => {
        if (!bytes) return 'Taille inconnue';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (type) => {
        if (type?.includes('pdf')) return <FaFileAlt className="text-red-500" size={48} />;
        if (type?.includes('image')) return <FaFile className="text-blue-500" size={48} />;
        if (type?.includes('text')) return <FaFile className="text-gray-500" size={48} />;
        return <FaFile className="text-purple-500" size={48} />;
    };

    if (loading) {
        return (
            <div className="fixed top-0 left-0 z-50 min-h-screen w-full bg-[#051b31] text-white flex flex-col items-center justify-center px-6 pt-28">
                <Navbar />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold mb-2">Chargement du fichier...</h2>
                    <p className="text-gray-300">Veuillez patienter</p>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed top-0 left-0 z-50 min-h-screen w-full bg-[#051b31] text-white flex flex-col items-center justify-center px-6 pt-28">
                <Navbar />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md"
                >
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold mb-2">Erreur</h2>
                    <p className="text-gray-300 mb-6">{error}</p>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                    >
                        Retour
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed top-0 left-0 z-50 min-h-screen w-full bg-[#051b31] text-white flex flex-col items-center justify-center px-6 pt-28">
            <Navbar />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-r from-blue-500 to-purple-600 rounded-full mb-6"
                    >
                        <FaCloudDownloadAlt className="text-white text-3xl" />
                    </motion.div>
                    <h1 className="text-4xl font-bold mb-2">Fichier partagé</h1>
                    <p className="text-gray-300 text-lg">Téléchargez votre fichier en toute sécurité</p>
                </div>

                {/* File Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-6 border border-white/20"
                >
                    <div className="flex items-center gap-6 mb-6">
                        <div className="shrink-0">
                            {getFileIcon(fileInfo.type)}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-white mb-2">{fileInfo.fileName}</h3>
                            <div className="flex items-center gap-4 text-gray-300">
                                <span className="flex items-center gap-2">
                                    <FaFile size={14} />
                                    {fileInfo.type || 'Type inconnu'}
                                </span>
                                <span>{formatSize(fileInfo.fileSize)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Password Field */}
                    <AnimatePresence>
                        {needsPassword && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6"
                            >
                                <label className="block text-sm font-medium text-gray-300 mb-3">
                                    Mot de passe requis <FaLock className="inline ml-1" />
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Entrez le mot de passe"
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm pr-12"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Download Button */}
                    <motion.button
                        onClick={handleDownload}
                        disabled={downloading || (needsPassword && !password)}
                        className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-emerald-400/50 disabled:border-gray-500/50 disabled:cursor-not-allowed"
                        whileHover={{ scale: downloading ? 1 : 1.02, y: downloading ? 0 : -2 }}
                        whileTap={{ scale: downloading ? 1 : 0.98 }}
                    >
                        {downloading ? (
                            <>
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                Téléchargement...
                            </>
                        ) : (
                            <>
                                <FaDownload size={24} />
                                Télécharger le fichier
                            </>
                        )}
                    </motion.button>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.6 } }}
                    className="text-center text-gray-400 text-sm"
                >
                    <p>Ce fichier a été partagé en toute sécurité • Téléchargement unique</p>
                </motion.div>
            </motion.div>
        </div>
    );
}