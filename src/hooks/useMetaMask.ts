import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, formatEther, parseEther, type TransactionResponse } from 'ethers';

interface MetaMaskState {
  account: string | null;
  balance: string | null;
  chainId: string | null;
  isConnecting: boolean;
  error: string | null;
}

interface SendTransactionParams {
  to: string;
  value: string; // Amount in ETH as string
}

export function useMetaMask() {
  const [state, setState] = useState<MetaMaskState>({
    account: null,
    balance: null,
    chainId: null,
    isConnecting: false,
    error: null,
  });

  const hasMetaMask = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';

  // Connect to MetaMask
  const connect = useCallback(async () => {
    if (!hasMetaMask || !window.ethereum) {
      setState(prev => ({ ...prev, error: 'MetaMask is not installed' }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const provider = new BrowserProvider(window.ethereum!);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();
      const signer = await provider.getSigner();
      const balance = await provider.getBalance(accounts[0]);

      setState({
        account: accounts[0],
        balance: formatEther(balance),
        chainId: network.chainId.toString(),
        isConnecting: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to connect',
      }));
    }
  }, [hasMetaMask]);

  // Disconnect
  const disconnect = useCallback(() => {
    setState({
      account: null,
      balance: null,
      chainId: null,
      isConnecting: false,
      error: null,
    });
  }, []);

  // Send transaction
  const sendTransaction = useCallback(async ({ to, value }: SendTransactionParams): Promise<TransactionResponse | null> => {
    if (!hasMetaMask || !window.ethereum || !state.account) {
      throw new Error('MetaMask is not connected');
    }

    try {
      const provider = new BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to,
        value: parseEther(value),
      });

      return tx;
    } catch (error) {
      throw error;
    }
  }, [hasMetaMask, state.account]);

  // Get current balance
  const refreshBalance = useCallback(async () => {
    if (!hasMetaMask || !window.ethereum || !state.account) return;

    try {
      const provider = new BrowserProvider(window.ethereum!);
      const balance = await provider.getBalance(state.account);
      setState(prev => ({ ...prev, balance: formatEther(balance) }));
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  }, [hasMetaMask, state.account]);

  // Listen for account changes
  useEffect(() => {
    if (!hasMetaMask || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== state.account) {
        setState(prev => ({ ...prev, account: accounts[0] }));
        refreshBalance();
      }
    };

    const handleChainChanged = (chainId: string) => {
      setState(prev => ({ ...prev, chainId }));
    };

    const ethereum = window.ethereum;
    if (ethereum.on) {
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (ethereum?.removeListener) {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [hasMetaMask, state.account, disconnect, refreshBalance]);

  return {
    ...state,
    hasMetaMask,
    isConnected: !!state.account,
    connect,
    disconnect,
    sendTransaction,
    refreshBalance,
  };
}
