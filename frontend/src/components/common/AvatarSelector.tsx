import React, { useState, useEffect } from 'react';
// REMOVED: framer-motion dependency
import { apiService } from '../../services/api';
import { secureStorage } from '../../utils/secureStorage';

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
  const [showGrid, setShowGrid] = useState(false);

  // Load available avatars on mount
  useEffect(() => {
    loadAvatars();
  }, []);

  const loadAvatars = async () => {
    try {
      const data = await apiService.getAvailableAvatars();
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
      console.log('Attempting to select avatar:', avatarId);
      console.log('Auth token exists:', !!secureStorage.getToken());
      
      await onAvatarSelect(avatarId);
      setShowGrid(false); // Close grid after selection
      console.log('Avatar selection successful');
    } catch (error) {
      console.error('Avatar selection failed:', error);
      console.error('Error details:', error.message || error);
      setError(`Failed to select avatar: ${error.message || 'Unknown error'}`);
    } finally {
      setSelecting(null);
    }
  };

  const getCurrentAvatarUrl = () => {
    if (!currentAvatarId) return null;
    const currentAvatar = avatars.find(avatar => avatar.id === currentAvatarId);
    return currentAvatar?.url;
  };

  const toggleGrid = () => {
    if (!loading && !loadingAvatars) {
      setShowGrid(!showGrid);
    }
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
      {/* Main Avatar Circle - Click to toggle grid */}
      <div
        onClick={toggleGrid}
        className={`
          w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer relative overflow-hidden 
          border-2 transition-all duration-200
          ${showGrid ? 'border-purple-400 ring-2 ring-purple-400/50' : 'border-purple-500 hover:border-purple-400'}
          ${(loading || selecting) ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        style={{
          backgroundImage: getCurrentAvatarUrl() ? `url(${getCurrentAvatarUrl()})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!getCurrentAvatarUrl() && (
          <span className="text-3xl">
            {(loading || selecting) ? '⏳' : '👤'}
          </span>
        )}
        
        {/* Click indicator */}
        {!showGrid && (
          <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-medium">Choose</span>
          </div>
        )}
      </div>

      {/* Avatar Selection Grid - Show only when clicked */}
      
        {showGrid && (
          <div
            className="mb-4"
          >
            <div className="grid grid-cols-5 gap-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
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
                </button>
              ))}
            </div>
            
            {/* Close button */}
            <button
              onClick={() => setShowGrid(false)}
              className="text-gray-400 hover:text-white text-xs mt-2 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      

      {/* Error Message */}
      {error && (
        <div
          className="text-red-400 text-xs text-center mb-2"
        >
          {error}
        </div>
      )}

      {/* Instructions */}
      {!showGrid && (
        <div className="text-center">
          <p className="text-gray-400 text-xs">
            {getCurrentAvatarUrl() ? 'Click to change avatar' : 'Click to choose avatar'}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            9 Web3.0 designs available
          </p>
        </div>
      )}
    </div>
  );
};