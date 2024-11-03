import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

interface WalletInfo {
  name: string;
  enabled: boolean;
  api: any;
}

@customElement('cardano-wallet-button')
export class CardanoWalletButton extends LitElement {
  static properties = {
    wallets: { type: Array, state: true },
    hasCardanoObject: { type: Boolean, state: true },
    error: { type: String, state: true }
  };

  static styles = css`
    :host {
      display: block;
      font-family: system-ui, sans-serif;
    }
    .wallet-container {
      padding: 1rem;
      border-radius: 8px;
      background: #f4f4f4;
    }
    button {
      background: #7b3fe4;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.3s ease;
    }
    button:hover {
      background: #6032b0;
    }
    .wallet-list {
      margin-top: 1rem;
    }
    .wallet-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem;
      border: 1px solid #ddd;
      margin: 0.5rem 0;
      border-radius: 4px;
      cursor: pointer;
    }
    .wallet-item:hover {
      background: #eee;
    }
    .instructions {
      color: #666;
      line-height: 1.5;
    }
  `;

  wallets: WalletInfo[] = [];
  hasCardanoObject: boolean = false;
  error: string | null = null;

  connectedCallback() {
    super.connectedCallback();
    // Move window check to connectedCallback which only runs in the browser
    this.checkCardanoObject();
  }

  private checkCardanoObject() {
    if (typeof window !== 'undefined') {
      this.hasCardanoObject = typeof window.cardano !== 'undefined';
    }
  }

  private async checkAvailableWallets() {
    if (!this.hasCardanoObject) {
      this.error = 'Cardano object not found';
      return;
    }

    try {
      const walletProviders = ['nami', 'eternl', 'flint', 'yoroi', 'gero'];
      const wallets: WalletInfo[] = [];

      for (const provider of walletProviders) {
        if (window.cardano[provider]) {
          try {
            const isEnabled = await window.cardano[provider].isEnabled();
            wallets.push({
              name: provider,
              enabled: isEnabled,
              api: window.cardano[provider]
            });
          } catch (error) {
            console.warn(`Error checking ${provider} wallet:`, error);
          }
        }
      }

      this.wallets = wallets;
      this.error = wallets.length === 0 ? 'No wallets found' : null;
    } catch (error) {
      this.error = 'Error detecting wallets';
      console.error(error);
    }
  }

  private async connectWallet(wallet: WalletInfo) {
    try {
      if (!wallet.enabled) {
        await wallet.api.enable();
        // Refresh wallet list after connection
        await this.checkAvailableWallets();
      }
    } catch (error) {
      this.error = `Error connecting to ${wallet.name}`;
      console.error(error);
    }
  }

  private renderInstructions() {
    return html`
      <div class="instructions">
        <h3>To use this application, you need a Cardano wallet:</h3>
        <ol>
          <li>Install one of the following wallets:
            <ul>
              <li><a href="https://namiwallet.io/" target="_blank">Nami</a></li>
              <li><a href="https://eternl.io/" target="_blank">Eternl</a></li>
              <li><a href="https://flint-wallet.com/" target="_blank">Flint</a></li>
              <li><a href="https://yoroi-wallet.com/" target="_blank">Yoroi</a></li>
              <li><a href="https://gerowallet.io/" target="_blank">Gero</a></li>
            </ul>
          </li>
          <li>Create or restore a wallet</li>
          <li>Return to this page and click "Check Available Wallets"</li>
        </ol>
      </div>
    `;
  }

  private renderWalletList() {
    return html`
      <div class="wallet-list">
        ${this.wallets.map(wallet => html`
          <div class="wallet-item" @click=${() => this.connectWallet(wallet)}>
            <span>${wallet.name}</span>
            <span>${wallet.enabled ? '(Connected)' : '(Click to connect)'}</span>
          </div>
        `)}
      </div>
    `;
  }

  render() {
    return html`
      <div class="wallet-container">
        <button @click=${() => this.checkAvailableWallets()}>
          Check Available Wallets
        </button>
        
        ${this.error ? html`<p style="color: red">${this.error}</p>` : ''}
        
        ${!this.hasCardanoObject ? 
          this.renderInstructions() :
          this.wallets.length > 0 ? 
            this.renderWalletList() :
            ''
        }
      </div>
    `;
  }
}

declare global {
  interface Window {
    cardano: {
      [key: string]: {
        isEnabled: () => Promise<boolean>;
        enable: () => Promise<void>;
        [key: string]: any;
      };
    }
  }
  
  interface HTMLElementTagNameMap {
    'cardano-wallet-button': CardanoWalletButton;
  }
}