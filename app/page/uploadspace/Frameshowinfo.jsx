// Framefileinfo.jsx - Version avec barre de progression
import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaTimes, FaCopy, FaCheck, FaShareAlt, FaLink, FaCloudUploadAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion'; 

export default function Framefileinfo({ file, onClose }) {
    const [showPassword, setShowPassword] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [password, setPassword] = useState('');
    const [expiration, setExpiration] = useState('7');
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStage, setUploadStage] = useState('preparing'); // 'preparing', 'uploading', 'processing', 'complete'
    const [shareResult, setShareResult] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, [file]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const getFileInfo = () => {
        if (!file) return null;
        
        const name = file.name;
        const ext = '.' + name.split('.').pop()?.toLowerCase();
        const size = (file.size / 1024 / 1024).toFixed(3) + ' MB';
        const type = getFileType(ext);
        
        return { name, type, ext, size };
    };

    const getFileType = (ext) => {
        const types = {
            '.pdf': 'PDF Document',
            '.jpg': 'JPEG Image',
            '.jpeg': 'JPEG Image',
            '.png': 'PNG Image',
            '.gif': 'GIF Image',
            '.txt': 'Text File',
            '.doc': 'Word Document',
            '.docx': 'Word Document',
            '.exe': 'Executable File',
            '.zip': 'Compressed Folder'
        };
        return types[ext] || 'Unknown File Type';
    };

    const getStageMessage = () => {
        switch(uploadStage) {
            case 'preparing':
                return 'Préparation du fichier...';
            case 'uploading':
                return `Upload en cours (${uploadProgress}%)...`;
            case 'processing':
                return 'Traitement et création du lien...';
            case 'complete':
                return 'Upload terminé !';
            default:
                return 'Upload en cours...';
        }
    };

    const getStageIcon = () => {
        switch(uploadStage) {
            case 'preparing':
                return '📁';
            case 'uploading':
                return '📤';
            case 'processing':
                return '🔗';
            case 'complete':
                return '✅';
            default:
                return '⏳';
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Fichier manquant');
            return;
        }

        setLoading(true);
        setError(null);
        setUploadProgress(0);
        setUploadStage('uploading');

        try {
            // Création du FormData
            const formData = new FormData();
            formData.append('file', file);
            
            if (password) {
                formData.append('password', password);
            }
            
            if (expiration) {
                formData.append('expiration', expiration);
            }

            // Upload avec XMLHttpRequest pour progression réelle
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    setUploadProgress(percentComplete);
                    if (percentComplete < 50) {
                        setUploadStage('uploading');
                    } else if (percentComplete < 90) {
                        setUploadStage('processing');
                    } else {
                        setUploadStage('complete');
                    }
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    const result = JSON.parse(xhr.responseText);
                    console.log('Résultat du serveur:', result);
                    if (result.success) {
                        setShareResult({
                            shareUrl: result.shareUrl,
                            fileId: result.fileId,
                            fileName: file.name,
                            fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                            hasPassword: !!password,
                            expiresIn: expiration === 'never' ? 'Jamais' : `${expiration} jours`
                        });
                        setUploadProgress(100);
                        setUploadStage('complete');
                        setTimeout(() => {
                            setLoading(false);
                        }, 500);
                    } else {
                        setError(result.error || 'Erreur lors de l\'upload');
                        setLoading(false);
                    }
                } else {
                    setError('Erreur lors de l\'upload');
                    setLoading(false);
                }
            });

            xhr.addEventListener('error', () => {
                setError('Erreur réseau lors de l\'upload');
                setLoading(false);
            });

            xhr.open('POST', '/api/new_file');
            xhr.send(formData);
        } catch (err) {
            console.error('Erreur complète:', err);
            setError('Erreur lors de l\'upload. Vérifiez la console.');
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        if (shareResult?.shareUrl) {
            navigator.clipboard.writeText(shareResult.shareUrl)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                })
                .catch(err => {
                    console.error('Erreur lors de la copie:', err);
                });
        }
    };

    const handleShare = async () => {
        if (shareResult?.shareUrl && navigator.share) {
            try {
                await navigator.share({
                    title: `Partager ${shareResult.fileName}`,
                    text: `Voici le fichier ${shareResult.fileName} partagé via Sendsey`,
                    url: shareResult.shareUrl,
                });
            } catch (err) {
                console.log('Partage annulé ou erreur:', err);
            }
        }
    };

    const fileInfo = getFileInfo();

    if (!fileInfo) {
        return null;
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !shareResult) {
                            handleClose();
                        }
                    }}
                >
                    <motion.div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center px-6 py-4 bg-linear-to-r from-green-400 to-blue-500">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                {shareResult ? (
                                    <>
                                        <FaLink /> Lien de partage
                                    </>
                                ) : loading ? (
                                    <>
                                        <FaCloudUploadAlt className="animate-pulse" /> Upload en cours
                                    </>
                                ) : (
                                    'Sendsey Upload Window'
                                )}
                            </h2>
                            {!shareResult && !loading && (
                                <button 
                                    onClick={handleClose} 
                                    className="text-white hover:text-red-200 text-xl font-bold transition-colors p-2 rounded-full hover:bg-white/20"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-6 text-gray-800">
                            {shareResult ? (
                                <div className="py-6">
                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-blue-500 to-blue-500 rounded-full mb-4">
                                            <FaLink className="text-white text-2xl" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">Fichier uploadé avec succès !</h3>
                                        <p className="text-gray-600">Votre lien de partage est prêt</p>
                                    </div>
                                    
                                    {/* Informations du fichier */}
                                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <span className="text-blue-600 font-bold">
                                                    {fileInfo.ext.replace('.', '').toUpperCase().slice(0, 3)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-bold truncate">{shareResult.fileName}</p>
                                                <p className="text-sm text-gray-500">{shareResult.fileSize}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="bg-white p-2 rounded-lg">
                                                <p className="text-gray-500">Mot de passe</p>
                                                <p className="font-semibold">{shareResult.hasPassword ? 'Activé' : 'Désactivé'}</p>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg">
                                                <p className="text-gray-500">Expiration</p>
                                                <p className="font-semibold">{shareResult.expiresIn}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Lien de partage - Section principale */}
                                    <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                                        <p className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-lg">
                                            <FaLink className="text-blue-600" /> Lien de partage
                                        </p>
                                        
                                        {/* Lien à copier */}
                                        <div className="bg-white border-2 border-blue-300 rounded-lg p-4 mb-5 break-all">
                                            <p className="text-sm text-gray-500 mb-1">Cliquez pour sélectionner:</p>
                                            <p className="text-base font-mono font-semibold text-blue-600 select-all">{shareResult.shareUrl}</p>
                                        </div>
                                        
                                        {/* Boutons d'action */}
                                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                            <button 
                                                onClick={handleCopyLink}
                                                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                                                    copied 
                                                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg' 
                                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                                                }`}
                                            >
                                                {copied ? (
                                                    <>
                                                        <FaCheck className="text-lg" /> Copié dans le presse-papiers !
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaCopy className="text-lg" /> Copier le lien
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={handleShare}
                                                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105"
                                            >
                                                <FaShareAlt className="text-lg" /> Partager
                                            </button>
                                        </div>
                                    </div>

                                    {/* Actions finales */}
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8 pt-6 border-t border-gray-200">
                                        <a
                                            href={shareResult.shareUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all text-center transform hover:scale-105"
                                        >
                                            Voir le fichier partagé
                                        </a>
                                        <button
                                            onClick={handleClose}
                                            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg hover:shadow-lg transition-all"
                                        >
                                            Fermer
                                        </button>
                                    </div>
                                </div>
                            ) : loading ? (
                                <div className="py-8">
                                    {/* Barre de progression */}
                                    <div className="mb-8">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="font-semibold text-gray-700 flex items-center gap-2">
                                                <span className="text-xl">{getStageIcon()}</span>
                                                {getStageMessage()}
                                            </span>
                                            <span className="font-bold text-blue-600">{uploadProgress}%</span>
                                        </div>
                                        
                                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                            <motion.div 
                                                className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full"
                                                initial={{ width: '0%' }}
                                                animate={{ width: `${uploadProgress}%` }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                        
                                        <div className="flex justify-between mt-2 text-sm text-gray-500">
                                            <span>Préparation</span>
                                            <span>Upload</span>
                                            <span>Traitement</span>
                                            <span>Terminé</span>
                                        </div>
                                        
                                        <div className="flex justify-between mt-1">
                                            <div className={`w-3 h-3 rounded-full ${uploadStage === 'preparing' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                            <div className={`w-3 h-3 rounded-full ${uploadStage === 'uploading' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                            <div className={`w-3 h-3 rounded-full ${uploadStage === 'processing' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                            <div className={`w-3 h-3 rounded-full ${uploadStage === 'complete' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                        </div>
                                    </div>
                                    
                                    {/* Informations du fichier pendant l'upload */}
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <span className="text-blue-600 font-bold text-lg">
                                                    {fileInfo.ext.replace('.', '').toUpperCase().slice(0, 3)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-bold truncate">{fileInfo.name}</p>
                                                <p className="text-sm text-gray-500">{fileInfo.size} • {fileInfo.type}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-center mt-8">
                                        <p className="text-gray-500 text-sm">
                                            Ne fermez pas cette fenêtre pendant l'upload...
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-6 border-b pb-3">
                                        Informations du fichier
                                    </h3>
                                    
                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="font-semibold text-gray-700">Nom du fichier :</span>
                                            <span className="text-gray-900 font-medium truncate max-w-xs">{fileInfo.name}</span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="font-semibold text-gray-700">Type :</span>
                                            <span className="text-gray-900 font-medium">{fileInfo.type}</span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="font-semibold text-gray-700">Extension :</span>
                                            <span className="text-gray-900 font-medium">{fileInfo.ext}</span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="font-semibold text-gray-700">Taille :</span>
                                            <span className="text-gray-900 font-medium">{fileInfo.size}</span>
                                        </div>
                                    </div>

                                    {/* Password Section */}
                                    <div className="mb-6">
                                        <label className="block font-semibold text-gray-700 mb-3">
                                            Protection par mot de passe (optionnel)
                                        </label>
                                        <div className="relative">
                                            <input 
                                                type={showPassword ? 'text' : 'password'} 
                                                placeholder="Entrez un mot de passe pour protéger le fichier"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full h-12 border border-gray-300 rounded-lg px-4 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-800 transition-colors"
                                                onClick={() => setShowPassword(prev => !prev)}
                                            >
                                                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expiration */}
                                    <div className="mb-8">
                                        <label className="block font-semibold text-gray-700 mb-3">
                                            Expiration du lien (en jours)
                                        </label>
                                        <select
                                            value={expiration}
                                            onChange={(e) => setExpiration(e.target.value)}
                                            className="w-full h-12 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="1">1 jour</option>
                                            <option value="3">3 jours</option>
                                            
                                        </select>
                                    </div>

                                    {error && (
                                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                                            ❌ {error}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex justify-center gap-4 pt-4">
                                        <button
                                            onClick={handleClose}
                                            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={handleUpload}
                                            disabled={loading}
                                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            <FaCloudUploadAlt /> Upload & Partager
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}