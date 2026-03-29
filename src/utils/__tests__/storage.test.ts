// Tests for Storage utility (resolves to native implementation using AsyncStorage)

import { Storage } from '../storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage is already mocked in jest.setup.ts

describe('Storage (native via AsyncStorage)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getItem', () => {
    it('returns null for non-existent key', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      const result = await Storage.getItem('nonexistent');
      expect(result).toBeNull();
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('nonexistent');
    });

    it('returns stored value', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('test_value');
      const result = await Storage.getItem('test_key');
      expect(result).toBe('test_value');
    });

    it('handles AsyncStorage errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await Storage.getItem('test_key');
      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe('setItem', () => {
    it('stores a value', async () => {
      await Storage.setItem('test_key', 'test_value');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('test_key', 'test_value');
    });

    it('stores JSON data', async () => {
      const data = { name: 'test', value: 42 };
      await Storage.setItem('json_key', JSON.stringify(data));
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('json_key', JSON.stringify(data));
    });

    it('handles AsyncStorage errors gracefully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('QuotaExceeded'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Should not throw
      await Storage.setItem('test_key', 'test_value');

      consoleSpy.mockRestore();
    });
  });

  describe('removeItem', () => {
    it('removes a stored value', async () => {
      await Storage.removeItem('test_key');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('test_key');
    });

    it('handles removing non-existent key', async () => {
      // Should not throw
      await Storage.removeItem('nonexistent');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('nonexistent');
    });

    it('handles AsyncStorage errors gracefully', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(new Error('SecurityError'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await Storage.removeItem('test_key');

      consoleSpy.mockRestore();
    });
  });

  describe('clear', () => {
    it('clears all storage', async () => {
      await Storage.clear();
      expect(AsyncStorage.clear).toHaveBeenCalled();
    });

    it('handles AsyncStorage errors gracefully', async () => {
      (AsyncStorage.clear as jest.Mock).mockRejectedValueOnce(new Error('SecurityError'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await Storage.clear();

      consoleSpy.mockRestore();
    });
  });
});
