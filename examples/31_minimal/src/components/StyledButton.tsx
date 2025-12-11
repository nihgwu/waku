'use client';

import styled from 'styled-components';

export const StyledButton = styled.button`
  background-color: #0070f3;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #0051cc;
  }

  &:active {
    transform: translateY(1px);
  }
`;

export const StyledCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 20px auto;
`;

export const StyledTitle = styled.h1`
  color: #333;
  font-size: 32px;
  font-weight: bold;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const StyledMessage = styled.p`
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
  padding: 12px 16px;
  border-radius: 6px;
  font-weight: 500;
  margin: 16px 0;
`;
