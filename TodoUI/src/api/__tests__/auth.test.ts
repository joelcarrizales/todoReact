import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authApi, type AuthResponse } from '../auth';

// Mock fetch
global.fetch = vi.fn();

const mockFetch = global.fetch as any;

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('register', () => {
    it('should register a user with email and password', async () => {
      // Arrange
      const response: AuthResponse = { success: true };

      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: async () => response,
      });

      // Act
      const result = await authApi.register('test@example.com', 'Password123');

      // Assert
      expect(result).toEqual(response);
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com', password: 'Password123' }),
      });
    });

    it('should handle registration failure', async () => {
      // Arrange
      const response: AuthResponse = {
        success: false,
        errors: ['Email already in use'],
      };

      mockFetch.mockResolvedValueOnce({
        status: 400,
        json: async () => response,
      });

      // Act
      const result = await authApi.register('existing@example.com', 'Password123');

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Email already in use');
    });

    it('should handle network error', async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Act & Assert
      await expect(authApi.register('test@example.com', 'Password123')).rejects.toThrow('Network error');
    });
  });

  describe('login', () => {
    it('should login a user and return token', async () => {
      // Arrange
      const response: AuthResponse = {
        success: true,
        token: 'jwt-token-123',
      };

      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: async () => response,
      });

      // Act
      const result = await authApi.login('test@example.com', 'Password123');

      // Assert
      expect(result).toEqual(response);
      expect(result.token).toBe('jwt-token-123');
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com', password: 'Password123' }),
      });
    });

    it('should handle unauthorized login', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        status: 401,
        json: async () => ({ success: false, errors: ['Unauthorized'] }),
      });

      // Act
      const result = await authApi.login('test@example.com', 'WrongPassword');

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Unauthorized');
    });
  });

  describe('forgotPassword', () => {
    it('should request password reset', async () => {
      // Arrange
      const response: AuthResponse = { success: true };

      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: async () => response,
      });

      // Act
      const result = await authApi.forgotPassword('test@example.com');

      // Assert
      expect(result).toEqual(response);
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com' }),
      });
    });

    it('should return success even for non-existent email', async () => {
      // Arrange
      const response: AuthResponse = { success: true };

      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: async () => response,
      });

      // Act
      const result = await authApi.forgotPassword('nonexistent@example.com');

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      // Arrange
      const response: AuthResponse = { success: true };

      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: async () => response,
      });

      // Act
      const result = await authApi.resetPassword(
        'test@example.com',
        'reset-token-123',
        'NewPassword456'
      );

      // Assert
      expect(result).toEqual(response);
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          token: 'reset-token-123',
          newPassword: 'NewPassword456',
        }),
      });
    });

    it('should handle invalid token', async () => {
      // Arrange
      const response: AuthResponse = {
        success: false,
        errors: ['Invalid token'],
      };

      mockFetch.mockResolvedValueOnce({
        status: 400,
        json: async () => response,
      });

      // Act
      const result = await authApi.resetPassword(
        'test@example.com',
        'invalid-token',
        'NewPassword456'
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid token');
    });
  });

  describe('error handling', () => {
    it('should handle 401 responses with Unauthorized error', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        status: 401,
        json: async () => ({}),
      });

      // Act
      const result = await authApi.login('test@example.com', 'password');

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Unauthorized');
    });

    it('should handle JSON parsing errors gracefully', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      // Act & Assert
      await expect(authApi.register('test@example.com', 'password')).rejects.toThrow();
    });
  });
});
