import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('AuthProvider', () => {
    it('should provide auth context to children', () => {
      // Arrange
      const TestComponent = () => {
        const { token, isAuthenticated } = useAuth();
        return (
          <div>
            <div data-testid="token">{token || 'no-token'}</div>
            <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
          </div>
        );
      };

      // Act
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Assert
      expect(screen.getByTestId('token')).toHaveTextContent('no-token');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });

    it('should initialize with token from localStorage', () => {
      // Arrange
      localStorage.setItem('token', 'existing-token');

      const TestComponent = () => {
        const { token, isAuthenticated } = useAuth();
        return (
          <div>
            <div data-testid="token">{token}</div>
            <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
          </div>
        );
      };

      // Act
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Assert
      expect(screen.getByTestId('token')).toHaveTextContent('existing-token');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });
  });

  describe('useAuth hook', () => {
    it('should login by storing token', async () => {
      // Arrange
      const user = userEvent.setup();
      const TestComponent = () => {
        const { login, token, isAuthenticated } = useAuth();

        return (
          <div>
            <button onClick={() => login('new-token')}>Login</button>
            <div data-testid="token">{token || 'no-token'}</div>
            <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
          </div>
        );
      };

      // Act
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByText('Login');
      await user.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('token')).toHaveTextContent('new-token');
      });
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(localStorage.getItem('token')).toBe('new-token');
    });

    it('should logout by removing token', async () => {
      // Arrange
      const user = userEvent.setup();
      localStorage.setItem('token', 'existing-token');

      const TestComponent = () => {
        const { logout, token, isAuthenticated } = useAuth();

        return (
          <div>
            <button onClick={logout}>Logout</button>
            <div data-testid="token">{token || 'no-token'}</div>
            <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
          </div>
        );
      };

      // Act
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const logoutButton = screen.getByText('Logout');
      await user.click(logoutButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('token')).toHaveTextContent('no-token');
      });
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should throw error when used outside AuthProvider', () => {
      // Arrange
      const TestComponent = () => {
        try {
          useAuth();
          return <div>Test</div>;
        } catch (error) {
          return <div>Error: {(error as Error).message}</div>;
        }
      };

      // Act
      const { container } = render(<TestComponent />);

      // Assert
      expect(container.textContent).toContain('useAuth must be used within an AuthProvider');
    });

    it('should update isAuthenticated based on token', async () => {
      // Arrange
      const user = userEvent.setup();
      const TestComponent = () => {
        const { login, logout, isAuthenticated } = useAuth();

        return (
          <div>
            <button onClick={() => login('token')}>Login</button>
            <button onClick={logout}>Logout</button>
            <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
          </div>
        );
      };

      // Act & Assert
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');

      await user.click(screen.getByText('Login'));
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      });

      await user.click(screen.getByText('Logout'));
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      });
    });
  });

  describe('token management', () => {
    it('should persist multiple login calls', async () => {
      // Arrange
      const user = userEvent.setup();
      const TestComponent = () => {
        const { login, token } = useAuth();

        return (
          <div>
            <button onClick={() => login('token1')}>Login 1</button>
            <button onClick={() => login('token2')}>Login 2</button>
            <div data-testid="token">{token}</div>
          </div>
        );
      };

      // Act
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await user.click(screen.getByText('Login 1'));
      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('token1');
      });

      await user.click(screen.getByText('Login 2'));

      // Assert
      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('token2');
        expect(screen.getByTestId('token')).toHaveTextContent('token2');
      });
    });

    it('should handle empty token string', async () => {
      // Arrange
      const user = userEvent.setup();
      const TestComponent = () => {
        const { login, isAuthenticated } = useAuth();

        return (
          <div>
            <button onClick={() => login('')}>Login Empty</button>
            <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
          </div>
        );
      };

      // Act
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await user.click(screen.getByText('Login Empty'));

      // Assert - Empty string should not be considered authenticated
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      });
    });
  });
});
