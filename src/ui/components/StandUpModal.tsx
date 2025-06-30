import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { DailyParticipant } from '../../domain/participant/entities';
import type { ParticipantRepository } from '../../domain/participant/repository';
import type { DailySelectionUseCases } from '../../application/daily/useCases';
import { useParticipants } from '../../hooks/useParticipants';
import { useDailyParticipants } from '../../hooks/useDailyParticipants';
import { useAnimators } from '../../hooks/useAnimators';
import { getParticipantPhotoUrlWithTheme } from '../../utils/animalPhotos';
import { getTasksForParticipant } from '../../domain/task/entities';
import TasksList from './TasksList';

// Animations communes
const backgroundPulse = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

const particlesFloat = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-10px) rotate(1deg); }
  66% { transform: translateY(5px) rotate(-1deg); }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const breathe = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

const overlayFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const overlayFadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const modalSlideIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

const confirmModalSlideIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const modalSlideOut = keyframes`
  from {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
`;

const selectedPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0.1); }
`;

const shuffleAnimation = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-5px) scale(1.05); }
`;

const shuffleNamePulse = keyframes`
  0%, 100% { 
    transform: scale(1); 
    text-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
  }
  50% { 
    transform: scale(1.1); 
    text-shadow: 0 6px 30px rgba(59, 130, 246, 0.6);
  }
`;

const shuffleDots = keyframes`
  0%, 20% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
  80%, 100% { opacity: 0.3; transform: scale(1); }
`;

const slideInFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInFromLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const avatarFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
`;

const crownGlow = keyframes`
  0%, 100% { 
    filter: 
      drop-shadow(0 0 12px rgba(255, 215, 0, 0.8)) 
      drop-shadow(0 0 24px rgba(255, 215, 0, 0.4)) 
      brightness(1.2) 
      contrast(1.1); 
    transform: rotate(-12deg) scale(1);
  }
  25% { 
    filter: 
      drop-shadow(0 0 16px rgba(255, 215, 0, 1)) 
      drop-shadow(0 0 32px rgba(255, 215, 0, 0.6)) 
      brightness(1.4) 
      contrast(1.2); 
    transform: rotate(-8deg) scale(1.05);
  }
  50% { 
    filter: 
      drop-shadow(0 0 20px rgba(255, 215, 0, 1.2)) 
      drop-shadow(0 0 40px rgba(255, 215, 0, 0.8)) 
      brightness(1.5) 
      contrast(1.3); 
    transform: rotate(-10deg) scale(1.1);
  }
  75% { 
    filter: 
      drop-shadow(0 0 16px rgba(255, 215, 0, 1)) 
      drop-shadow(0 0 32px rgba(255, 215, 0, 0.6)) 
      brightness(1.4) 
      contrast(1.2); 
    transform: rotate(-6deg) scale(1.05);
  }
`;

const silverCrownGlow = keyframes`
  0%, 100% { 
    filter: 
      drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4)) 
      sepia(0) 
      saturate(0) 
      brightness(1.3) 
      drop-shadow(0 0 12px rgba(192, 192, 192, 0.8))
      drop-shadow(0 0 24px rgba(192, 192, 192, 0.4)); 
    transform: rotate(-12deg) scale(1);
  }
  25% { 
    filter: 
      drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4)) 
      sepia(0) 
      saturate(0) 
      brightness(1.5) 
      drop-shadow(0 0 16px rgba(192, 192, 192, 1))
      drop-shadow(0 0 32px rgba(192, 192, 192, 0.6)); 
    transform: rotate(-8deg) scale(1.05);
  }
  50% { 
    filter: 
      drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4)) 
      sepia(0) 
      saturate(0) 
      brightness(1.6) 
      drop-shadow(0 0 20px rgba(192, 192, 192, 1.2))
      drop-shadow(0 0 40px rgba(192, 192, 192, 0.8)); 
    transform: rotate(-10deg) scale(1.1);
  }
  75% { 
    filter: 
      drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4)) 
      sepia(0) 
      saturate(0) 
      brightness(1.5) 
      drop-shadow(0 0 16px rgba(192, 192, 192, 1))
      drop-shadow(0 0 32px rgba(192, 192, 192, 0.6)); 
    transform: rotate(-6deg) scale(1.05);
  }
`;

// Styled Components

const ModalOverlay = styled.div<{ $isClosing?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  z-index: 1000;
  animation: ${overlayFadeIn} 0.3s ease-out;
  backdrop-filter: blur(8px);

  ${props => props.$isClosing && css`
    animation: ${overlayFadeOut} 0.25s ease-out forwards;
  `}
`;

const ModalContainer = styled.div<{ $isClosing?: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--background-primary);
  border: 3px solid var(--accent-primary);
  border-radius: 32px;
  width: 90vw;
  max-width: 1600px;
  height: 90vh;
  overflow: hidden;
  box-shadow: 
    0 40px 100px rgba(0, 0, 0, 0.5),
    0 16px 40px var(--accent-primary-rgb, 59, 130, 246),
    0 0 0 1px rgba(var(--accent-primary-rgb, 59, 130, 246), 0.1),
    inset 0 2px 0 rgba(255, 255, 255, 0.15);
  animation: ${modalSlideIn} 0.3s ease-out;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(20px);
  
  // Effet de fond subtil avec particules
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(var(--accent-primary-rgb, 59, 130, 246), 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(var(--accent-primary-rgb, 59, 130, 246), 0.05) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(var(--accent-primary-rgb, 59, 130, 246), 0.03) 0%, transparent 50%);
    animation: ${backgroundPulse} 8s ease-in-out infinite;
    pointer-events: none;
    border-radius: 30px;
  }

  // Particules flottantes
  &::after {
    content: '✨ ⭐ 💫 🔥 ⚡ 🌟';
    position: absolute;
    inset: 0;
    font-size: 1.2rem;
    opacity: 0.06;
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-wrap: wrap;
    gap: 2rem;
    padding: 3rem;
    animation: ${particlesFloat} 6s ease-in-out infinite;
    pointer-events: none;
    z-index: 1;
  }

  ${props => props.$isClosing && css`
    animation: ${modalSlideOut} 0.25s ease-out forwards;
  `}

  @media (max-width: 768px) {
    width: 95vw;
    height: 95vh;
  }
`;

const BlockHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 3rem;
  border-bottom: 3px solid var(--accent-primary);
  background: linear-gradient(135deg, 
    var(--accent-primary) 0%, 
    var(--accent-secondary) 100%);
  position: relative;
  z-index: 2;
  
  // Effet de brillance subtile
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.1) 0%, 
      transparent 50%, 
      rgba(255, 255, 255, 0.05) 100%);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 1.5rem 2rem;
  }
`;

const BlockHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
`;

const BlockEmoji = styled.div`
  font-size: 2.5rem;
  animation: ${particlesFloat} 3s ease-in-out infinite;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const BlockHeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const BlockTitle = styled.h2`
  color: white;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const BlockSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const CloseButton = styled.button`
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: scale(1.05);
  }
`;

const ModalContent = styled.div`
  flex: 1;
  padding: 3rem;
  overflow-y: auto;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const SelectionStep = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const StepHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const StepTitle = styled.h3`
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
`;

const StepDescription = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
`;

const ParticipantsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  flex: 1;
  align-content: start;
  justify-content: center;
  justify-items: center;
  width: 100%;
  max-width: 100%;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }
`;

const ParticipantCard = styled.div<{ $isSelected: boolean }>`
  background: linear-gradient(135deg, 
    rgba(var(--card-background-rgb, 51, 65, 85), 0.6) 0%, 
    rgba(var(--card-background-rgb, 30, 41, 59), 0.8) 100%);
  border: 2px solid ${props => props.$isSelected ? 'var(--accent-success)' : 'rgba(148, 163, 184, 0.2)'};
  border-radius: 20px;
  padding: 2rem 1.5rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 220px;
  margin: 0 auto;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, 
      ${props => props.$isSelected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)'} 0%, 
      transparent 100%);
    opacity: ${props => props.$isSelected ? 1 : 0};
    transition: opacity 0.4s ease;
    border-radius: 18px;
  }
  
  ${props => props.$isSelected && css`
    background: linear-gradient(135deg, 
      rgba(16, 185, 129, 0.2) 0%, 
      rgba(5, 150, 105, 0.3) 100%);
    border-color: var(--accent-success);
    box-shadow: 
      0 12px 40px rgba(16, 185, 129, 0.3),
      0 0 0 1px rgba(16, 185, 129, 0.2);
    transform: translateY(-2px);
    animation: ${selectedPulse} 2s infinite;
    
    &::after {
      content: '✓';
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 24px;
      height: 24px;
      background: var(--accent-success);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: bold;
      animation: ${fadeInUp} 0.3s ease-out;
    }
  `}
  
  ${props => !props.$isSelected && css`
    opacity: 0.7;
    transform: scale(0.95);
  `}
  
  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 
      0 16px 48px rgba(0, 0, 0, 0.3),
      0 0 0 2px var(--accent-primary);
    
    &::before {
      opacity: 0.6;
    }
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    max-width: 180px;
  }
  
  @media (max-width: 480px) {
    padding: 1rem 0.8rem;
    max-width: 160px;
  }
`;

const ParticipantAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 1rem;
  position: relative;
  border: 3px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    width: 70px;
    height: 70px;
  }
  
  @media (max-width: 480px) {
    width: 60px;
    height: 60px;
  }
`;

const ParticipantPhoto = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${ParticipantCard}:hover & {
    transform: scale(1.1);
  }
`;

const ParticipantFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: white;
`;

const ParticipantCrown = styled.div`
  position: absolute;
  top: -18px;
  right: 20px;
  font-size: 1.8rem;
  animation: ${crownGlow} 2s ease-in-out infinite;
  z-index: 3;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    top: -8px;
    right: -8px;
  }
`;

const ParticipantSilverCrown = styled.div`
  position: absolute;
  top: -18px;
  right: 20px;
  font-size: 1.8rem;
  animation: ${silverCrownGlow} 2s ease-in-out infinite;
  z-index: 3;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    top: -8px;
    right: -8px;
  }
`;

const ParticipantName = styled.div`
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 500;
  
  ${ParticipantCard}:hover & {
    color: var(--accent-primary);
  }
`;

const StepActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid rgba(var(--accent-primary-rgb, 59, 130, 246), 0.2);
`;

const SelectedCount = styled.div`
  color: var(--text-secondary);
  font-size: 1rem;
`;

const StartStandUpButton = styled.button`
  background: linear-gradient(135deg, var(--accent-success) 0%, #059669 100%);
  color: white;
  border: none;
  padding: 1.5rem 3rem;
  border-radius: 16px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 8px 20px rgba(16, 185, 129, 0.4),
    0 0 0 3px rgba(16, 185, 129, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: ${breathe} 3s ease-in-out infinite;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.1) 0%, 
      transparent 50%, 
      rgba(255, 255, 255, 0.05) 100%);
    pointer-events: none;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 
      0 12px 32px rgba(16, 185, 129, 0.5),
      0 0 0 4px rgba(16, 185, 129, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    animation: none;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
    animation: none;
  }
  
  @media (max-width: 768px) {
    padding: 1.2rem 2.5rem;
    font-size: 1.1rem;
  }
`;

// Styled Components pour les autres étapes

const ShuffleStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const ShuffleAnimation = styled.div`
  text-align: center;
  animation: ${breathe} 3s ease-in-out infinite;
`;

const ShuffleTitle = styled.div`
  margin-bottom: 3rem;
  
  h3 {
    color: var(--text-primary);
    font-size: 1.8rem;
    font-weight: 600;
    margin: 0;
    animation: ${shuffleAnimation} 1s ease-in-out infinite;
  }
`;

const ShuffleDisplay = styled.div`
  margin-bottom: 3rem;
`;

const ShuffleName = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: var(--accent-primary);
  animation: ${shuffleNamePulse} 0.5s ease-in-out infinite;
  min-height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-shadow: 0 4px 20px rgba(var(--accent-primary-rgb, 59, 130, 246), 0.3);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const ShuffleDots = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
  
  span {
    width: 12px;
    height: 12px;
    background: var(--accent-primary);
    border-radius: 50%;
    animation: ${shuffleDots} 1.5s ease-in-out infinite;
    
    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
`;

const ShuffleActions = styled.div`
  display: flex;
  justify-content: center;
`;

const ResetButton = styled.button`
  background: linear-gradient(135deg, var(--accent-warning) 0%, #d97706 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4);
  }
`;

const StandUpStepContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  animation: ${fadeInUp} 0.6s ease-out;
  position: relative;
`;

const StandUpMainContent = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 80px;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    min-height: 70px;
    margin-bottom: 0.25rem;
  }
`;

const CurrentParticipantDisplay = styled.div<{ isSliding?: boolean }>`
  opacity: ${props => props.isSliding ? 0 : 1};
  transition: ${props => props.isSliding ? 'opacity 0.2s ease-in-out' : 'none'};
  animation: ${avatarFadeIn} 0.4s ease-out;
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: linear-gradient(135deg, 
    var(--accent-primary) 0%, 
    var(--accent-secondary) 100%);
  border: 6px solid rgba(255, 255, 255, 0.9);
  box-shadow: 
    0 30px 60px rgba(0, 0, 0, 0.3),
    0 0 0 3px rgba(var(--accent-primary-rgb, 59, 130, 246), 0.3),
    0 0 40px rgba(var(--accent-primary-rgb, 59, 130, 246), 0.2);
  backdrop-filter: blur(20px);
  z-index: 1002;
  
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  
  @media (max-width: 768px) {
    width: 140px;
    height: 140px;
    top: 20px;
    border: 4px solid rgba(255, 255, 255, 0.9);
  }
  
  @media (max-width: 480px) {
    width: 120px;
    height: 120px;
    top: 30px;
  }
`;

const AvatarContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
  padding-bottom: 15px;
  
  @media (max-width: 768px) {
    padding-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    padding-bottom: 10px;
  }
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 0;
`;

const AvatarOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, 
    rgba(0, 0, 0, 0.1) 0%, 
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0.7) 100%);
  border-radius: 50%;
  z-index: 1;
`;

const AvatarName = styled.div`
  position: relative;
  z-index: 2;
  color: white;
  font-size: 1.6rem;
  font-weight: 700;
  text-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.8),
    0 0 20px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.5px;
  text-align: center;
  line-height: 1.2;
  max-width: 90%;
  word-wrap: break-word;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const AvatarFallback = styled.div`
  position: relative;
  z-index: 1;
  color: white;
  font-size: 4rem;
  font-weight: 700;
  text-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.8),
    0 0 20px rgba(0, 0, 0, 0.5);
  
  @media (max-width: 768px) {
    font-size: 3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2.5rem;
  }
`;

const CurrentParticipantCrown = styled.div`
  position: absolute;
  top: -69px;
  right: 68px;
  font-size: 5rem;
  animation: ${crownGlow} 2s ease-in-out infinite;
  z-index: 10001;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
    top: -10px;
    right: 15px;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
    top: -8px;
    right: 10px;
  }
`;

const CurrentParticipantSilverCrown = styled.div`
  position: absolute;
  top: -69px;
  right: 68px;
  font-size: 5rem;
  animation: ${silverCrownGlow} 2s ease-in-out infinite;
  z-index: 10001;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
    top: -10px;
    right: 15px;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
    top: -8px;
    right: 10px;
  }
`;

const ParticipantStatus = styled.div`
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  white-space: nowrap;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 10000;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
    bottom: -20px;
  }
`;

const TasksWrapper = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0.5rem 0;
  overflow: hidden;
  height: 100%;
`;

const NextParticipantPreview = styled.div`
  position: absolute;
  top: -2rem;
  right: 2rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, 
    rgba(var(--accent-secondary-rgb, 139, 92, 246), 0.12) 0%, 
    rgba(var(--accent-secondary-rgb, 139, 92, 246), 0.06) 100%);
  border: 2px solid rgba(var(--accent-secondary-rgb, 139, 92, 246), 0.2);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  text-align: center;
  transition: all 0.3s ease;
  z-index: 1;
  min-height: 120px;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
    background: linear-gradient(135deg, 
      rgba(var(--accent-secondary-rgb, 139, 92, 246), 0.18) 0%, 
      rgba(var(--accent-secondary-rgb, 139, 92, 246), 0.08) 100%);
    border-color: rgba(var(--accent-secondary-rgb, 139, 92, 246), 0.3);
  }
  
  @media (max-width: 1024px) {
    right: 1rem;
    padding: 1.2rem 1.6rem;
    min-height: 100px;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NextParticipantLabel = styled.div`
  color: var(--text-secondary);
  font-size: 1rem;
  margin-bottom: 0.8rem;
  font-weight: 500;
`;

const NextParticipantInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
`;

const NextParticipantAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  border: 2px solid rgba(var(--accent-primary-rgb, 59, 130, 246), 0.3);
`;

const NextParticipantPhoto = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const NextParticipantName = styled.div`
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
`;

const NextParticipantGoldCrown = styled.div`
  position: absolute;
  top: -44px;
  right: 36px;
  font-size: 1rem;
  animation: ${crownGlow} 2s ease-in-out infinite;
  z-index: 3;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    top: -6px;
    right: -6px;
  }
`;

const NextParticipantSilverCrown = styled.div`
  position: absolute;
  top: -44px;
  right: 36px;
  font-size: 1rem;
  animation: ${silverCrownGlow} 2s ease-in-out infinite;
  z-index: 3;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    top: -6px;
    right: -6px;
  }
`;

const ProgressIndicator = styled.div`
  width: 100%;
  margin: 0.5rem 0;
  flex-shrink: 0;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(var(--accent-primary-rgb, 59, 130, 246), 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const ProgressFill = styled.div<{ width: string }>`
  height: 100%;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
  width: ${props => props.width};
`;

const ProgressText = styled.div`
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
`;

const StandUpActions = styled.div`
  width: 100%;
  flex-shrink: 0;
`;

const StandUpActionButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;



const PreviousButton = styled.button`
  background: linear-gradient(135deg, var(--accent-warning) 0%, #d97706 100%);
  color: white;
  border: none;
  padding: 0.8rem 1.8rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 12px rgba(245, 158, 11, 0.3),
    0 0 0 1px rgba(245, 158, 11, 0.1);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 
      0 6px 16px rgba(245, 158, 11, 0.4),
      0 0 0 2px rgba(245, 158, 11, 0.15);
  }
  
  @media (max-width: 768px) {
    padding: 0.7rem 1.5rem;
    font-size: 0.9rem;
  }
`;

const NextParticipantButton = styled.button`
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: white;
  border: none;
  padding: 0.8rem 1.8rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 12px rgba(var(--accent-primary-rgb, 59, 130, 246), 0.3),
    0 0 0 1px rgba(var(--accent-primary-rgb, 59, 130, 246), 0.1);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 
      0 6px 16px rgba(var(--accent-primary-rgb, 59, 130, 246), 0.4),
      0 0 0 2px rgba(var(--accent-primary-rgb, 59, 130, 246), 0.15);
  }
  
  @media (max-width: 768px) {
    padding: 0.7rem 1.5rem;
    font-size: 0.9rem;
  }
`;

const FinishStandUpButton = styled.button`
  background: linear-gradient(135deg, var(--accent-success) 0%, #059669 100%);
  color: white;
  border: none;
  padding: 0.8rem 1.8rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 12px rgba(16, 185, 129, 0.3),
    0 0 0 1px rgba(16, 185, 129, 0.1);
  animation: ${breathe} 3s ease-in-out infinite;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.1) 0%, 
      transparent 50%, 
      rgba(255, 255, 255, 0.05) 100%);
    pointer-events: none;
  }
  
  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 
      0 6px 16px rgba(16, 185, 129, 0.4),
      0 0 0 2px rgba(16, 185, 129, 0.15);
    animation: none;
  }
  
  @media (max-width: 768px) {
    padding: 0.7rem 1.5rem;
    font-size: 0.9rem;
  }
`;

// Styled Components pour la modal de confirmation
const ConfirmModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${overlayFadeIn} 0.3s ease-out;
`;

const ConfirmModal = styled.div`
  background: var(--background-primary);
  border: 2px solid var(--accent-warning);
  border-radius: 20px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: ${confirmModalSlideIn} 0.3s ease-out;
  
  h3 {
    color: var(--text-primary);
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
  }
  
  p {
    color: var(--text-secondary);
    font-size: 1rem;
    margin: 0 0 2rem 0;
    line-height: 1.5;
  }
`;

const ConfirmActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

// Styled Components pour l'étape des liens
const LinksStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  animation: ${fadeInUp} 0.6s ease-out;
  text-align: center;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
    justify-content: flex-start;
    padding-top: 2rem;
  }
`;

const LinksTitle = styled.h2`
  color: var(--text-primary);
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
`;

const LinksDescription = styled.p`
  color: var(--text-secondary);
  font-size: 1.2rem;
  margin: 0 0 3rem 0;
  max-width: 600px;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const LinksContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 3rem;
  width: 100%;
  max-width: 800px;
  
  @media (max-width: 768px) {
    gap: 1rem;
    margin-bottom: 2rem;
  }
`;

const LinkCard = styled.a`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
  background: linear-gradient(135deg, 
    rgba(var(--accent-primary-rgb, 59, 130, 246), 0.1) 0%, 
    rgba(var(--accent-secondary-rgb, 139, 92, 246), 0.05) 100%);
  border: 2px solid rgba(var(--accent-primary-rgb, 59, 130, 246), 0.2);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  transition: all 0.3s ease;
  color: var(--text-primary);
  
  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 
      0 16px 48px rgba(0, 0, 0, 0.15),
      0 0 0 3px rgba(var(--accent-primary-rgb, 59, 130, 246), 0.3);
    background: linear-gradient(135deg, 
      rgba(var(--accent-primary-rgb, 59, 130, 246), 0.15) 0%, 
      rgba(var(--accent-secondary-rgb, 139, 92, 246), 0.08) 100%);
    border-color: rgba(var(--accent-primary-rgb, 59, 130, 246), 0.4);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
    padding: 1.5rem;
  }
`;

const LinkInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  flex: 1;
  
  @media (max-width: 768px) {
    align-items: center;
  }
`;

const LinkTitle = styled.h3`
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const LinkDescription = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const LinkIcon = styled.div`
  font-size: 2rem;
  opacity: 0.7;
  transition: all 0.3s ease;
  
  ${LinkCard}:hover & {
    opacity: 1;
    transform: scale(1.1);
  }
`;

const CloseLinksButton = styled.button`
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: white;
  border: none;
  padding: 1.2rem 3rem;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 8px 20px rgba(var(--accent-primary-rgb, 59, 130, 246), 0.3),
    0 0 0 2px rgba(var(--accent-primary-rgb, 59, 130, 246), 0.1);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.1) 0%, 
      transparent 50%, 
      rgba(255, 255, 255, 0.05) 100%);
    pointer-events: none;
  }
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 
      0 12px 32px rgba(var(--accent-primary-rgb, 59, 130, 246), 0.4),
      0 0 0 3px rgba(var(--accent-primary-rgb, 59, 130, 246), 0.15);
  }
  
  @media (max-width: 768px) {
    padding: 1rem 2.5rem;
    font-size: 1rem;
  }
`;

const CancelButton = styled.button`
  background: rgba(var(--accent-primary-rgb, 59, 130, 246), 0.1);
  color: var(--accent-primary);
  border: 2px solid var(--accent-primary);
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--accent-primary);
    color: white;
  }
`;

const ConfirmModalButton = styled.button`
  background: linear-gradient(135deg, var(--accent-error) 0%, #dc2626 100%);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  }
`;

interface StandUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: any[];
  allParticipants?: DailyParticipant[];
  allWeeklyParticipants?: any[];
  onSelect: (participant: any) => void;
  onReset: () => void;
  repository: ParticipantRepository;
  dailyUseCases: DailySelectionUseCases;
  currentAnimator?: any;
  theme?: string;
}

// Étapes de la modale
type StandUpStep = 'selection' | 'shuffle' | 'standUp' | 'links';

// Fonction pour générer une couleur d'avatar basée sur le nom
const getAvatarColor = (name: string) => {
  const colors = [
    { bg: '#4f7cff', text: '#ffffff' },
    { bg: '#7c3aed', text: '#ffffff' },
    { bg: '#06b6d4', text: '#ffffff' },
    { bg: '#10b981', text: '#ffffff' },
    { bg: '#f59e0b', text: '#ffffff' },
    { bg: '#ef4444', text: '#ffffff' },
    { bg: '#8b5cf6', text: '#ffffff' },
    { bg: '#14b8a6', text: '#ffffff' },
  ];
  
  const hash = name.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
};

// Fonction helper pour obtenir l'URL de photo avec support du thème
const getPhotoUrl = (participant: any, theme?: string) => {
  const participantName = String(participant?.name?.value || participant?.name || 'Participant');
  const customPhotoUrl = participant?.getPhotoUrl?.();
  return getParticipantPhotoUrlWithTheme(participantName, customPhotoUrl, theme);
};

export const StandUpModal: React.FC<StandUpModalProps> = ({
  isOpen,
  onClose,
  participants,
  allParticipants,
  allWeeklyParticipants,
  onSelect,
  onReset,
  repository,
  dailyUseCases,
  currentAnimator,
  theme
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [currentStep, setCurrentStep] = useState<StandUpStep>('selection');
  const [selectedParticipants, setSelectedParticipants] = useState<any[]>([]);
  const [shuffledOrder, setShuffledOrder] = useState<any[]>([]);
  const [currentParticipantIndex, setCurrentParticipantIndex] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [currentShuffleIndex, setCurrentShuffleIndex] = useState(0);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [navigationDirection, setNavigationDirection] = useState<'forward' | 'backward'>('forward');

  // Hook pour gérer l'animateur courant
  const {
    getCurrentWeekAnimator,
    getNextWeekAnimator
  } = useAnimators(
    allWeeklyParticipants || [], 
    repository as any
  );

  // Utilitaire pour obtenir le nom sous forme de string
  const getNameString = (participantOrName: any) => {
    if (!participantOrName) return '';
    if (typeof participantOrName === 'string') return participantOrName;
    if (typeof participantOrName.name === 'object' && 'value' in participantOrName.name) return participantOrName.name.value;
    if (typeof participantOrName.value === 'string') return participantOrName.value;
    if (typeof participantOrName.name === 'string') return participantOrName.name;
    return '';
  };

  // Fonction pour déterminer si un participant est l'animateur actuel ou suivant
  const getAnimatorStatus = (participant: any) => {
    const participantName = getNameString(participant);
    const currentWeekEntry = getCurrentWeekAnimator();
    const nextWeekEntry = getNextWeekAnimator();
    
    const isCurrentAnimator = currentWeekEntry && currentWeekEntry.participant && 
      getNameString(currentWeekEntry.participant) === participantName;
    const isNextAnimator = nextWeekEntry && nextWeekEntry.participant && 
      getNameString(nextWeekEntry.participant) === participantName;
    
    return { isCurrentAnimator, isNextAnimator };
  };

  // Initialiser les participants sélectionnés avec tous les participants disponibles
  useEffect(() => {
    if (isOpen && allParticipants) {
      const availableParticipants = allParticipants.filter(p => 
        typeof p.hasSpoken === 'function' ? !p.hasSpoken() : !p.hasSpoken
      );
      setSelectedParticipants(availableParticipants);
      setCurrentStep('selection');
      setCurrentParticipantIndex(0);
      setShuffledOrder([]);
    }
  }, [isOpen, allParticipants]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Gestion des touches clavier
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (event.key === 'Escape') {
        // Si la confirmation est déjà affichée, l'annuler au lieu de fermer
        if (showConfirmClose) {
          setShowConfirmClose(false);
        } else {
          handleClose();
        }
      } else if (currentStep === 'selection') {
        // Lancer le stand-up avec la touche Entrée
        if (event.key === 'Enter') {
          event.preventDefault();
          if (selectedParticipants.length > 0) {
            handleStartStandUp();
          }
        }
      } else if (currentStep === 'standUp') {
        // Navigation avec les flèches uniquement pendant le stand-up
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          handlePreviousParticipant();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          handleNextParticipant();
        } else if (event.key === 'Enter') {
          event.preventDefault();
          // Si on est sur le dernier participant, terminer le stand-up
          if (currentParticipantIndex === shuffledOrder.length - 1) {
            handleFinishStandUp();
          } else {
            // Sinon, passer au suivant
            handleNextParticipant();
          }
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentStep, currentParticipantIndex, shuffledOrder.length, isSliding, isEntering, selectedParticipants.length, showConfirmClose]);

  const handleClose = () => {
    // Si on est dans un stand-up en cours, demander confirmation
    if (currentStep === 'standUp') {
      setShowConfirmClose(true);
      return;
    }
    
    // Vérifier s'il y a des participants qui ont parlé
    const participantsWhoSpoke = allParticipants?.filter(p => 
      typeof p.hasSpoken === 'function' ? p.hasSpoken() : p.hasSpoken
    ) || [];
    
    const allParticipantsSpoke = allParticipants?.every(p => 
      typeof p.hasSpoken === 'function' ? p.hasSpoken() : p.hasSpoken
    ) || false;
    
    // Si certains participants ont parlé (mais pas tous), demander confirmation
    if (participantsWhoSpoke.length > 0 && !allParticipantsSpoke) {
      setShowConfirmClose(true);
      return;
    }
    
    // Sinon, fermer directement
    performClose();
  };

  const performClose = () => {
    // Fermer immédiatement la modal
    setIsClosing(true);
    setShowConfirmClose(false);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setCurrentStep('selection');
      setCurrentParticipantIndex(0);
      setShuffledOrder([]);
    }, 250);
    
    // Faire les opérations de reset en arrière-plan
    const resetParticipantsInBackground = async () => {
      try {
        if (allParticipants) {
          for (const participant of allParticipants) {
            if (participant.reset && typeof participant.reset === 'function') {
              participant.reset();
              await dailyUseCases.updateParticipant(participant);
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du reset des participants:', error);
      }
    };
    
    // Lancer le reset en arrière-plan sans attendre
    resetParticipantsInBackground();
  };

  const handleCancelClose = () => {
    setShowConfirmClose(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !showConfirmClose) {
      handleClose();
    }
  };

  // Gérer la sélection/désélection d'un participant
  const toggleParticipantSelection = (participant: any) => {
    setSelectedParticipants(prev => {
      const isSelected = prev.some(p => (p.id?.value || p.id) === (participant.id?.value || participant.id));
      if (isSelected) {
        return prev.filter(p => (p.id?.value || p.id) !== (participant.id?.value || participant.id));
      } else {
        return [...prev, participant];
      }
    });
  };

  // Lancer le stand-up avec animation shuffle
  const handleStartStandUp = () => {
    if (selectedParticipants.length === 0) return;
    
    setCurrentStep('shuffle');
    setIsShuffling(true);
    
    // Animation de shuffle améliorée et plus courte
    const participantNames = selectedParticipants.map(p => 
      String(p.name?.value || p.name || 'Participant')
    );
    
    let shuffleIndex = 0;
    let shuffleSpeed = 60;
    const maxShuffle = 20; // Réduit de 30 à 20
    let shuffleCount = 0;
    
    const shuffleAnimation = () => {
      if (shuffleCount < maxShuffle) {
        setCurrentShuffleIndex(shuffleIndex % participantNames.length);
        shuffleIndex++;
        shuffleCount++;
        
        // Ralentir progressivement mais plus rapidement
        if (shuffleCount > 12) {
          shuffleSpeed += 30;
        } else if (shuffleCount > 8) {
          shuffleSpeed += 15;
        }
        
        setTimeout(shuffleAnimation, shuffleSpeed);
      } else {
        // Générer l'ordre final aléatoire avec un meilleur algorithme
        const shuffled = [...selectedParticipants];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setShuffledOrder(shuffled);
        setIsShuffling(false);
        setCurrentStep('standUp');
        setCurrentParticipantIndex(0);
      }
    };
    
    shuffleAnimation();
  };

  // Passer au participant suivant
  const handleNextParticipant = async () => {
    // Empêcher la navigation si une animation est en cours
    if (isSliding || currentParticipantIndex >= shuffledOrder.length - 1) {
      return;
    }
    
    setIsSliding(true);
    
    setTimeout(() => {
      setCurrentParticipantIndex(prev => prev + 1);
      setIsSliding(false);
    }, 200);
  };

  // Revenir au participant précédent
  const handlePreviousParticipant = async () => {
    // Empêcher la navigation si une animation est en cours
    if (isSliding || currentParticipantIndex <= 0) {
      return;
    }
    
    try {
      setIsSliding(true);
      
      // Remettre le participant actuel à hasSpoken = false
      const currentParticipant = shuffledOrder[currentParticipantIndex];
      if (currentParticipant && currentParticipant.reset && typeof currentParticipant.reset === 'function') {
        currentParticipant.reset();
        await dailyUseCases.updateParticipant(currentParticipant);
      }
      
      setTimeout(() => {
        setCurrentParticipantIndex(prev => prev - 1);
        setIsSliding(false);
      }, 200);
    } catch (error) {
      console.error('Erreur lors du retour au participant précédent:', error);
      setIsSliding(false);
    }
  };

  // Terminer le stand-up
  const handleFinishStandUp = () => {
    // Passer à l'étape des liens
    setCurrentStep('links');
    
    // Faire les opérations de reset en arrière-plan
    const resetStandUpParticipants = async () => {
      try {
        // Remettre tous les participants à hasSpoken = false (ils peuvent reparler)
        for (const participant of shuffledOrder) {
          if (participant.reset && typeof participant.reset === 'function') {
            participant.reset();
          } else if (participant.hasSpoken && typeof participant.hasSpoken === 'function') {
            // Si pas de reset, essayer de remettre manuellement le flag
            participant.hasSpokenFlag = false;
          }
          await dailyUseCases.updateParticipant(participant);
        }
      } catch (error) {
        console.error('Erreur lors de la finalisation du stand-up:', error);
      }
    };
    
    // Lancer le reset en arrière-plan sans attendre
    resetStandUpParticipants();
  };

  // Fermer la modale depuis l'étape des liens
  const handleCloseFromLinks = () => {
    performClose();
  };

  // Reset pour revenir à l'étape de sélection
  const handleResetToSelection = () => {
    setCurrentStep('selection');
    setCurrentParticipantIndex(0);
    setShuffledOrder([]);
    setIsShuffling(false);
    // Réinitialiser les participants sélectionnés avec tous les participants disponibles
    if (allParticipants) {
      const availableParticipants = allParticipants.filter(p => 
        typeof p.hasSpoken === 'function' ? !p.hasSpoken() : !p.hasSpoken
      );
      setSelectedParticipants(availableParticipants);
    }
  };

  if (!isOpen) return null;

  const currentParticipant = shuffledOrder[currentParticipantIndex];
  const isLastParticipant = currentParticipantIndex === shuffledOrder.length - 1;

  return (
    <ModalOverlay $isClosing={isClosing} onClick={handleBackdropClick}>
      {showConfirmClose && (
        <ConfirmModalOverlay onClick={(e) => e.stopPropagation()}>
          <ConfirmModal>
            <h3>
              {currentStep === 'standUp' ? 'Stand-up en cours' : 'Confirmer la fermeture'}
            </h3>
            <p>
              {currentStep === 'standUp' 
                ? 'Vous êtes actuellement en plein stand-up. Êtes-vous sûr de vouloir fermer et interrompre la session ?'
                : 'Certains participants ont déjà parlé. Fermer la modale va remettre tous les participants à l\'état "non parlé". Voulez-vous continuer ?'
              }
            </p>
            <ConfirmActions>
              <CancelButton onClick={handleCancelClose}>
                {currentStep === 'standUp' ? 'Continuer le stand-up' : 'Annuler'}
              </CancelButton>
              <ConfirmModalButton onClick={performClose}>
                {currentStep === 'standUp' ? 'Oui, interrompre' : 'Oui, fermer'}
              </ConfirmModalButton>
            </ConfirmActions>
          </ConfirmModal>
        </ConfirmModalOverlay>
      )}

      {/* Avatar du participant actuel - en dehors de ModalContainer pour éviter l'animation */}
      {currentStep === 'standUp' && currentParticipant && (
        <CurrentParticipantDisplay 
          isSliding={isSliding}
        >
          {(() => {
            const { isCurrentAnimator, isNextAnimator } = getAnimatorStatus(currentParticipant);
            return (
              <>
                {isCurrentAnimator && <CurrentParticipantCrown>👑</CurrentParticipantCrown>}
                {isNextAnimator && !isCurrentAnimator && <CurrentParticipantSilverCrown>👑</CurrentParticipantSilverCrown>}
              </>
            );
          })()}
          <AvatarContent>
            <AvatarImage 
              src={getPhotoUrl(currentParticipant, theme)}
              alt={String(currentParticipant.name?.value || currentParticipant.name || 'Participant')}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <AvatarOverlay />
            <AvatarName>
              {String(currentParticipant.name?.value || currentParticipant.name || 'Participant')}
            </AvatarName>
          </AvatarContent>
          
          <ParticipantStatus>
            C'est à ton tour de parler !
          </ParticipantStatus>
        </CurrentParticipantDisplay>
      )}
      
      <ModalContainer $isClosing={isClosing}>
        {/* Header */}
        <BlockHeader>
          <BlockHeaderLeft>
            <BlockEmoji>🎯</BlockEmoji>
            <BlockHeaderText>
              <BlockTitle>Session Stand-up</BlockTitle>
              <BlockSubtitle>
                {currentStep === 'selection' && 'Sélectionnez les participants'}
                {currentStep === 'shuffle' && 'Génération de l\'ordre...'}
                {currentStep === 'standUp' && `Participant ${currentParticipantIndex + 1}/${shuffledOrder.length}`}
                {currentStep === 'links' && 'Stand-up terminé ! Accédez aux ressources'}
              </BlockSubtitle>
            </BlockHeaderText>
          </BlockHeaderLeft>
          
          <CloseButton onClick={handleClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </CloseButton>
        </BlockHeader>

        {/* Contenu selon l'étape */}
        <ModalContent>
          {currentStep === 'selection' && (
            <SelectionStep>
              <StepHeader>
                <StepTitle>Qui participe au stand-up aujourd'hui ?</StepTitle>
                <StepDescription>Tous les participants sont sélectionnés par défaut. Désélectionnez ceux qui ne participent pas.</StepDescription>
              </StepHeader>
              
              <ParticipantsGrid>
                {allParticipants?.filter(p => 
                  typeof p.hasSpoken === 'function' ? !p.hasSpoken() : !p.hasSpoken
                ).map((participant) => {
                  const participantName = String(participant.name?.value || participant.name || 'Participant');
                  const avatarColor = getAvatarColor(participantName);
                  const isSelected = selectedParticipants.some(p => 
                    (p.id?.value || p.id) === (participant.id?.value || participant.id)
                  );
                  
                  const { isCurrentAnimator, isNextAnimator } = getAnimatorStatus(participant);
                  
                  return (
                    <ParticipantCard 
                      key={String(participant.id?.value || participant.id)}
                      $isSelected={isSelected}
                      onClick={() => toggleParticipantSelection(participant)}
                    >
                      <ParticipantAvatar style={{ position: 'relative' }}>
                        {isCurrentAnimator && <ParticipantCrown>👑</ParticipantCrown>}
                        {isNextAnimator && !isCurrentAnimator && <ParticipantSilverCrown>👑</ParticipantSilverCrown>}
                        <ParticipantPhoto 
                          src={getPhotoUrl(participant, theme)}
                          alt={participantName}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const parent = target.parentElement;
                            if (parent) {
                              target.style.display = 'none';
                              parent.style.background = `linear-gradient(135deg, ${avatarColor.bg}, ${avatarColor.bg}dd)`;
                              parent.innerHTML = `<div style="color: ${avatarColor.text}; font-size: 2rem; font-weight: bold; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">${participantName.charAt(0).toUpperCase()}</div>`;
                            }
                          }}
                        />
                      </ParticipantAvatar>
                      <ParticipantName>{participantName}</ParticipantName>
                    </ParticipantCard>
                  );
                })}
              </ParticipantsGrid>
              
              <StepActions>
                <SelectedCount>
                  {selectedParticipants.length} participant{selectedParticipants.length > 1 ? 's' : ''} sélectionné{selectedParticipants.length > 1 ? 's' : ''}
                </SelectedCount>
                <StartStandUpButton 
                  onClick={handleStartStandUp}
                  disabled={selectedParticipants.length === 0}
                >
                  🚀 Lancer le stand-up
                </StartStandUpButton>
              </StepActions>
            </SelectionStep>
          )}

          {currentStep === 'shuffle' && (
            <ShuffleStep>
              <ShuffleAnimation>
                <ShuffleTitle>
                  <h3>🎲 Génération de l'ordre de passage...</h3>
                </ShuffleTitle>
                
                <ShuffleDisplay>
                  <ShuffleName>
                    {isShuffling ? 
                      selectedParticipants[currentShuffleIndex]?.name?.value || 
                      selectedParticipants[currentShuffleIndex]?.name || 
                      'Participant'
                      : 'Prêt !'
                    }
                  </ShuffleName>
                </ShuffleDisplay>
                
                <ShuffleDots>
                  <span></span>
                  <span></span>
                  <span></span>
                </ShuffleDots>
                
                {!isShuffling && (
                  <ShuffleActions>
                    <ResetButton 
                      onClick={handleResetToSelection}
                      title="Revenir à la sélection des participants"
                    >
                      🔄 Revenir à la sélection
                    </ResetButton>
                  </ShuffleActions>
                )}
              </ShuffleAnimation>
            </ShuffleStep>
          )}

          {currentStep === 'standUp' && currentParticipant && (
            <StandUpStepContainer>
              <StandUpMainContent>

                {/* Aperçu du participant suivant à droite */}
                {currentParticipantIndex < shuffledOrder.length - 1 && (
                  <NextParticipantPreview>
                    <NextParticipantLabel>Suivant</NextParticipantLabel>
                    <NextParticipantInfo>
                      <NextParticipantAvatar style={{ position: 'relative' }}>
                        {(() => {
                          const nextParticipant = shuffledOrder[currentParticipantIndex + 1];
                          const { isCurrentAnimator, isNextAnimator } = getAnimatorStatus(nextParticipant);
                          return (
                            <>
                              {isCurrentAnimator && <NextParticipantGoldCrown>👑</NextParticipantGoldCrown>}
                              {isNextAnimator && !isCurrentAnimator && <NextParticipantSilverCrown>👑</NextParticipantSilverCrown>}
                            </>
                          );
                        })()}
                        <NextParticipantPhoto 
                          src={getPhotoUrl(shuffledOrder[currentParticipantIndex + 1], theme)}
                          alt={String(shuffledOrder[currentParticipantIndex + 1]?.name?.value || shuffledOrder[currentParticipantIndex + 1]?.name || 'Participant')}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const parent = target.parentElement;
                            if (parent) {
                              const nextParticipant = shuffledOrder[currentParticipantIndex + 1];
                              const participantName = String(nextParticipant?.name?.value || nextParticipant?.name || 'Participant');
                              const avatarColor = getAvatarColor(participantName);
                              target.style.display = 'none';
                              parent.style.background = `linear-gradient(135deg, ${avatarColor.bg}, ${avatarColor.bg}dd)`;
                              parent.innerHTML = `<div style="color: ${avatarColor.text}; font-size: 1.2rem; font-weight: bold; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">${participantName.charAt(0).toUpperCase()}</div>`;
                            }
                          }}
                        />
                      </NextParticipantAvatar>
                      <NextParticipantName>
                        {String(shuffledOrder[currentParticipantIndex + 1]?.name?.value || shuffledOrder[currentParticipantIndex + 1]?.name || 'Participant')}
                      </NextParticipantName>
                    </NextParticipantInfo>
                  </NextParticipantPreview>
                )}
              </StandUpMainContent>

              {/* Affichage des tâches du participant actuel - Prend 2/3 de l'espace */}
              <TasksWrapper>
                <TasksList 
                  tasks={getTasksForParticipant(String(currentParticipant.name?.value || currentParticipant.name || 'Participant'))}
                  participantName={String(currentParticipant.name?.value || currentParticipant.name || 'Participant')}
                  useAzureDevOps={(() => {
                    const participantName = String(currentParticipant.name?.value || currentParticipant.name || '');
                    const normalizedName = participantName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
                    return ['florian', 'simon', 'kevin', 'lewis', 'gregory', 'luciano', 'rachid'].includes(normalizedName);
                  })()}
                  allParticipants={allParticipants || allWeeklyParticipants}
                />
              </TasksWrapper>
              
              <ProgressIndicator>
                <ProgressBar>
                  <ProgressFill width={`${((currentParticipantIndex + 1) / shuffledOrder.length) * 100}%`} />
                </ProgressBar>
                <ProgressText>
                  {currentParticipantIndex + 1} / {shuffledOrder.length}
                </ProgressText>
              </ProgressIndicator>
              
              <StandUpActions>
                <StandUpActionButtons>
                    {currentParticipantIndex > 0 && (
                    <PreviousButton 
                        onClick={handlePreviousParticipant}
                        title="Revenir au participant précédent"
                      >
                        ← Précédent
                    </PreviousButton>
                  )}
                  
                  {!isLastParticipant ? (
                    <NextParticipantButton 
                        onClick={handleNextParticipant}
                      >
                        Suivant →
                    </NextParticipantButton>
                  ) : (
                    <FinishStandUpButton 
                        onClick={handleFinishStandUp}
                      >
                        🎉 Terminer le stand-up !!
                    </FinishStandUpButton>
                  )}
                </StandUpActionButtons>
              </StandUpActions>
            </StandUpStepContainer>
          )}

          {currentStep === 'links' && (
            <LinksStep>
              <LinksTitle>🎉 Terminé !</LinksTitle>
              <LinksDescription>
                Félicitations ! Votre session stand-up est maintenant terminée. 
                Accédez aux ressources Azure DevOps pour continuer votre travail.
              </LinksDescription>
              
              <LinksContainer>
                <LinkCard 
                  href="https://dev.azure.com/bazimo-app/bazimo-app/_dashboards/dashboard/94002b13-ea84-4455-9eb1-71bc99101095"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LinkInfo>
                    <LinkTitle>📊 Dashboard</LinkTitle>
                    <LinkDescription>
                      Consultons les métriques et indicateurs de l'équipe
                    </LinkDescription>
                  </LinkInfo>
                  <LinkIcon>📈</LinkIcon>
                </LinkCard>
                
                <LinkCard 
                  href="https://dev.azure.com/bazimo-app/bazimo-app/_boards/board/t/Development%20Team/Stories%20and%20Bugs"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LinkInfo>
                    <LinkTitle>📋 Stories & Bugs</LinkTitle>
                    <LinkDescription>
                      Alons voir le Board de l'équipe
                    </LinkDescription>
                  </LinkInfo>
                  <LinkIcon>🎯</LinkIcon>
                </LinkCard>
              </LinksContainer>
              
              <CloseLinksButton onClick={handleCloseFromLinks}>
                ✅ Fermer
              </CloseLinksButton>
            </LinksStep>
          )}
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
}; 