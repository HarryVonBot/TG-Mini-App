import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Avatar {
  id: string;
  name: string;
  url: string;
}

interface AvatarSelectorProps {
  currentAvatarId?: string;
  onAvatarSelect: (avatarId: string) => Promise<void>;
  loading?: boolean;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  currentAvatarId,
  onAvatarSelect,
  loading = false
}) => {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loadingAvatars, setLoadingAvatars] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load available avatars on mount
  useEffect(() => {
    loadAvatars();
  }, []);

  const loadAvatars = async () => {
    try {
      // Using the backend URL from environment
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/user/avatars`);
      
      if (!response.ok) {
        throw new Error('Failed to load avatars');
      }
      
      const data = await response.json();
      setAvatars(data.avatars);
    } catch (error) {
      console.error('Failed to load avatars:', error);
      setError('Failed to load avatars');
    } finally {
      setLoadingAvatars(false);
    }
  };

  const handleAvatarSelect = async (avatarId: string) => {
    if (loading || selecting || avatarId === currentAvatarId) return;

    setSelecting(avatarId);
    setError(null);

    try {
      await onAvatarSelect(avatarId);
    } catch (error) {
      console.error('Failed to select avatar:', error);
      setError('Failed to select avatar');
    } finally {
      setSelecting(null);
    }
  };

  const getCurrentAvatarUrl = () => {
    if (!currentAvatarId) return null;
    const currentAvatar = avatars.find(avatar => avatar.id === currentAvatarId);
    return currentAvatar?.url;
  };

  if (loadingAvatars) {
    return (
      <div className="text-center">
        <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-2xl">⏳</span>
        </div>
        <p className="text-gray-400 text-sm">Loading avatars...</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      {/* Current Avatar Display */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer relative overflow-hidden border-2 border-purple-500"
        style={{
          backgroundImage: getCurrentAvatarUrl() ? `url(${getCurrentAvatarUrl()})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: getCurrentAvatarUrl() ? 'transparent' : '#9333ea'
        }}
      >
        {!getCurrentAvatarUrl() && (
          <span className="text-3xl">👤</span>
        )}
        
        {/* Loading overlay */}
        {(loading || selecting === currentAvatarId) && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs">⏳</span>
          </div>
        )}
      </motion.div>

      {/* Avatar Selection Grid */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {avatars.map((avatar) => (
          <motion.button
            key={avatar.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAvatarSelect(avatar.id)}
            disabled={loading || selecting === avatar.id}
            className={`
              w-12 h-12 rounded-full border-2 transition-all duration-200 overflow-hidden
              ${avatar.id === currentAvatarId 
                ? 'border-purple-400 ring-2 ring-purple-400/50' 
                : 'border-gray-600 hover:border-purple-400'
              }
              ${(loading || selecting === avatar.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            style={{
              backgroundImage: `url(${avatar.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            title={avatar.name}
          >
            {selecting === avatar.id && (
              <div className="w-full h-full bg-black/50 flex items-center justify-center">
                <span className="text-white text-xs">⏳</span>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs text-center mb-2"
        >
          {error}
        </motion.div>
      )}

      {/* Instructions */}
      <div className="text-center">
        <p className="text-gray-400 text-xs">
          Choose your Web3.0 avatar
        </p>
        <p className="text-gray-500 text-xs mt-1">
          10 futuristic designs available
        </p>
      </div>
    </div>
  );
};