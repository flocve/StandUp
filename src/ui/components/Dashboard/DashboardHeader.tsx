import React from 'react';
import styled from 'styled-components';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

const HeaderContainer = styled.header`
  text-align: center;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: var(--text-secondary);
  font-weight: 500;
  opacity: 0.8;
  margin: 0;
`;

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title = "Stand-up Assistant",
  subtitle = "Tableau de bord principal",
  className
}) => {
  return (
    <HeaderContainer className={className}>
      <Title>{title}</Title>
      <Subtitle>{subtitle}</Subtitle>
    </HeaderContainer>
  );
}; 