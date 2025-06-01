import React, { useState } from 'react';
import { Participant, DailyParticipant } from '../../../domain/participant/entities';
import { generateCuteAnimalPhoto } from '../../../utils/animalPhotos';
import './styles.css';

interface PhotoManagerProps {
  participants: (Participant | DailyParticipant)[];
  onUpdatePhoto: (participantId: string, photoUrl: string) => void;
}

export const PhotoManager: React.FC<PhotoManagerProps> = ({
  participants,
  onUpdatePhoto
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const handleStartEdit = (participant: Participant | DailyParticipant) => {
    setEditingId(participant.id.value);
    setNewPhotoUrl(participant.getPhotoUrl() || '');
  };

  const handleSavePhoto = () => {
    if (editingId && newPhotoUrl.trim()) {
      onUpdatePhoto(editingId, newPhotoUrl.trim());
      setEditingId(null);
      setNewPhotoUrl('');
    }
  };

  const handleGenerateAnimal = (name: string) => {
    const animalUrl = generateCuteAnimalPhoto(name);
    setNewPhotoUrl(animalUrl);
  };

  const handleCancel = () => {
    setEditingId(null);
    setNewPhotoUrl('');
  };

  return (
    <div className="photo-manager">
      <h3>📸 Gestion des Photos</h3>
      <div className="participants-photo-list">
        {participants.map((participant) => (
          <div key={participant.id.value} className="participant-photo-item">
            <div className="photo-preview">
              {participant.getPhotoUrl() ? (
                <img 
                  src={participant.getPhotoUrl()} 
                  alt={participant.name.value}
                  className="preview-image"
                />
              ) : (
                <div className="preview-placeholder">
                  {participant.name.value.charAt(0)}
                </div>
              )}
            </div>
            
            <div className="participant-info">
              <span className="participant-name">{participant.name.value}</span>
              
              {editingId === participant.id.value ? (
                <div className="edit-photo-form">
                  <input
                    type="url"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="URL de la photo"
                    className="photo-url-input"
                  />
                  <div className="form-actions">
                    <button
                      onClick={() => handleGenerateAnimal(participant.name.value)}
                      className="btn-generate"
                      title="Générer un animal mignon"
                    >
                      🐾 Animal
                    </button>
                    <button
                      onClick={handleSavePhoto}
                      className="btn-save"
                    >
                      ✅ Sauver
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn-cancel"
                    >
                      ❌ Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleStartEdit(participant)}
                  className="btn-edit-photo"
                >
                  📝 Modifier photo
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 