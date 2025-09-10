import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { AuthWrapper } from '../AuthWrapper';

// Mock meta tag queries
const mockMetaTag = {
  getAttribute: jest.fn(),
  setAttribute: jest.fn(),
};

const mockQuerySelector = jest.fn();

// Setup DOM mocks
beforeEach(() => {
  // Mock document.querySelector for meta tag
  document.querySelector = mockQuerySelector;
  mockQuerySelector.mockReturnValue(mockMetaTag);
  
  // Mock document.head.appendChild
  document.head.appendChild = jest.fn();
  
  // Reset document.documentElement
  document.documentElement.classList.remove('dark');
  document.documentElement.removeAttribute('data-theme');
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe('AuthWrapper', () => {
  it('should render children correctly', () => {
    const { getByText } = render(
      <AuthWrapper>
        <div>Test Content</div>
      </AuthWrapper>
    );
    
    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('should force light mode on mount', () => {
    // Set initial dark mode
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    
    render(
      <AuthWrapper>
        <div>Test Content</div>
      </AuthWrapper>
    );
    
    // Should remove dark class and set light theme
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should update meta theme-color to white', () => {
    mockMetaTag.getAttribute.mockReturnValue('#000000');
    
    render(
      <AuthWrapper>
        <div>Test Content</div>
      </AuthWrapper>
    );
    
    expect(mockMetaTag.setAttribute).toHaveBeenCalledWith('content', '#ffffff');
  });

  it('should restore original theme on unmount', () => {
    // Set initial dark mode
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    
    const { unmount } = render(
      <AuthWrapper>
        <div>Test Content</div>
      </AuthWrapper>
    );
    
    // Verify light mode is applied
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    
    // Unmount and check restoration
    unmount();
    
    // Should restore dark mode
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should create meta tag if it does not exist', () => {
    mockQuerySelector.mockReturnValue(null);
    const mockMeta = { name: '', content: '' };
    const mockCreateElement = jest.fn().mockReturnValue(mockMeta);
    document.createElement = mockCreateElement;
    
    render(
      <AuthWrapper>
        <div>Test Content</div>
      </AuthWrapper>
    );
    
    expect(mockCreateElement).toHaveBeenCalledWith('meta');
    expect(mockMeta.name).toBe('theme-color');
    expect(mockMeta.content).toBe('#ffffff');
    expect(document.head.appendChild).toHaveBeenCalledWith(mockMeta);
  });

  it('should handle missing original theme gracefully', () => {
    // No initial theme set
    document.documentElement.removeAttribute('data-theme');
    
    const { unmount } = render(
      <AuthWrapper>
        <div>Test Content</div>
      </AuthWrapper>
    );
    
    // Should apply light mode
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    
    // Unmount should not crash
    expect(() => unmount()).not.toThrow();
  });
});
