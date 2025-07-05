import React from 'react';
import type { ScreenProps } from '../../types';
import { MobileLayoutWithTabs } from '../layout/MobileLayoutWithTabs';
import { useLanguage } from '../../hooks/useLanguage';

export const PrivacyPolicyScreen: React.FC<ScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();

  return (
    <MobileLayoutWithTabs showTabs={false}>
      <div className="absolute top-4 left-4">
        <button 
          onClick={onBack}
          className="p-2 text-white hover:bg-gray-800 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Go back"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
        </button>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center mb-2">
          {t('legal.privacyTitle', 'Privacy Policy')}
        </h1>
        <p className="text-center text-sm text-gray-400">
          {t('legal.lastUpdated', 'Last updated: January 2025')}
        </p>
      </div>

      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 space-y-6 text-sm text-gray-300">
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">1. {t('privacy.overview', 'Privacy Overview and Philosophy')}</h2>
          <div className="bg-blue-900/20 border border-blue-700 p-4 rounded mb-3">
            <p className="font-semibold text-blue-400 mb-2">VonVault Privacy-First Approach:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Minimal data collection - only what's essential for platform security and functionality</li>
              <li>Enhanced Web3.0 encryption for user privacy and anonymity</li>
              <li>Decentralized architecture respecting user sovereignty</li>
              <li>No unnecessary data retention or sharing</li>
              <li>User control over personal information</li>
            </ul>
          </div>
          <p>This Privacy Policy explains how VonVault collects, uses, and protects your information when you use our decentralized DeFi investment platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">2. {t('privacy.collection', 'Information We Collect')}</h2>
          <p className="mb-3"><strong>We collect minimal information necessary for platform operation:</strong></p>
          
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-yellow-400">Account Information:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Email address (for account creation and security notifications)</li>
                <li>Name (for KYC verification and account identification)</li>
                <li>Phone number (for SMS verification, if enabled)</li>
                <li>Profile preferences and settings</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-yellow-400">Cryptocurrency and Wallet Data:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Connected wallet addresses (for portfolio tracking and transactions)</li>
                <li>Transaction hashes (for investment processing and verification)</li>
                <li>Investment amounts and histories (for portfolio management)</li>
                <li>Network preferences (Ethereum, Polygon, BSC)</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-yellow-400">Technical Information:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Device information and browser type (for security and compatibility)</li>
                <li>IP address (for fraud prevention and geographic compliance)</li>
                <li>Usage analytics (for platform improvement)</li>
                <li>Session data (for authentication and security)</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-yellow-400">Authentication Data:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Two-factor authentication setup (if enabled)</li>
                <li>Biometric data (stored locally on your device, if you enable biometric 2FA)</li>
                <li>Security verification codes (temporary, for account protection)</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">3. {t('privacy.usage', 'How We Use Your Information')}</h2>
          <p className="mb-2">Your information is used exclusively for:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Platform Operations:</strong> Account management, authentication, and investment processing</li>
            <li><strong>Security:</strong> Fraud prevention, account protection, and compliance verification</li>
            <li><strong>Communication:</strong> Important notifications about your account and investments</li>
            <li><strong>Technical Support:</strong> Resolving issues and improving platform functionality</li>
            <li><strong>Legal Compliance:</strong> Meeting minimal regulatory requirements while maintaining privacy</li>
            <li><strong>Platform Improvement:</strong> Anonymous analytics to enhance user experience</li>
          </ul>
          <p className="mt-3 text-green-400 font-semibold">We do NOT use your data for marketing, advertising, or selling to third parties.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">4. {t('privacy.blockchain', 'Blockchain and Smart Contract Data')}</h2>
          <div className="bg-purple-900/20 border border-purple-700 p-4 rounded mb-3">
            <p className="font-semibold text-purple-400 mb-2">Important Blockchain Privacy Considerations:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Blockchain transactions are publicly visible and permanent</li>
              <li>Wallet addresses may be linked to your identity through platform usage</li>
              <li>Smart contract interactions are recorded on public blockchains</li>
              <li>Transaction amounts and timing are visible on blockchain explorers</li>
            </ul>
          </div>
          <p className="mb-2">VonVault's approach to blockchain privacy:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>We do not publish or link your personal information to blockchain transactions</li>
            <li>Wallet connections are encrypted and stored securely</li>
            <li>You maintain full control over your wallet privacy settings</li>
            <li>We support privacy-enhancing technologies where available</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">5. {t('privacy.sharing', 'Information Sharing and Disclosure')}</h2>
          <div className="bg-red-900/20 border border-red-700 p-4 rounded mb-3">
            <p className="font-semibold text-red-400 mb-2">We do NOT sell, rent, or trade your personal information.</p>
          </div>
          <p className="mb-2">Limited sharing occurs only in these specific circumstances:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Service Providers:</strong> Encrypted data shared with essential service providers (hosting, security)</li>
            <li><strong>Legal Requirements:</strong> When required by law or court order (with user notification when legally permitted)</li>
            <li><strong>Security Threats:</strong> To prevent fraud, abuse, or protect user safety</li>
            <li><strong>Business Transfers:</strong> In case of merger or acquisition (with privacy policy continuity)</li>
            <li><strong>User Consent:</strong> When you explicitly authorize specific sharing</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">6. {t('privacy.security', 'Data Security and Encryption')}</h2>
          <p className="mb-2">VonVault implements industry-leading security measures:</p>
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-green-400">Encryption:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>AES-256 encryption for data at rest</li>
                <li>TLS 1.3 for data in transit</li>
                <li>End-to-end encryption for sensitive communications</li>
                <li>Web3.0 encryption protocols for enhanced privacy</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-green-400">Access Controls:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Multi-factor authentication for all accounts</li>
                <li>Role-based access controls for internal systems</li>
                <li>Regular security audits and penetration testing</li>
                <li>Zero-knowledge architecture where possible</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-green-400">Infrastructure:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Distributed, decentralized data storage</li>
                <li>Regular security updates and monitoring</li>
                <li>Incident response and breach notification procedures</li>
                <li>Data backup and recovery systems</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">7. {t('privacy.retention', 'Data Retention and Deletion')}</h2>
          <p className="mb-2">We retain your information only as long as necessary:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Active Accounts:</strong> Data retained while account is active and for legitimate business purposes</li>
            <li><strong>Closed Accounts:</strong> Most data deleted within 90 days of account closure</li>
            <li><strong>Legal Requirements:</strong> Some data retained longer for regulatory compliance (typically 7 years for financial records)</li>
            <li><strong>Security Logs:</strong> Retained for 12 months for fraud prevention</li>
            <li><strong>Blockchain Data:</strong> Cannot be deleted due to blockchain immutability</li>
          </ul>
          <p className="mt-3 text-blue-300">You can request account deletion at any time, subject to legal retention requirements.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">8. {t('privacy.rights', 'Your Privacy Rights')}</h2>
          <p className="mb-2">Depending on your jurisdiction, you have the following rights:</p>
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-yellow-400">Universal Rights (All Users):</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Update your preferences and settings</li>
                <li>Request account deletion</li>
                <li>Opt out of non-essential communications</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-yellow-400">Enhanced Rights (EU/GDPR, California/CCPA):</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Data portability (export your information)</li>
                <li>Restriction of processing</li>
                <li>Object to processing for legitimate interests</li>
                <li>Right to be forgotten (with limitations for blockchain data)</li>
                <li>Detailed information about data processing</li>
              </ul>
            </div>
          </div>
          <p className="mt-3">To exercise your rights, contact us at privacy@vonartis.com with your request.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">9. {t('privacy.cookies', 'Cookies and Tracking Technologies')}</h2>
          <p className="mb-2">VonVault uses minimal tracking technologies:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Essential Cookies:</strong> Required for platform functionality and security</li>
            <li><strong>Authentication Tokens:</strong> For secure session management</li>
            <li><strong>Preference Cookies:</strong> To remember your settings and choices</li>
            <li><strong>Analytics:</strong> Anonymous usage data to improve platform performance</li>
          </ul>
          <p className="mt-2">You can manage cookie preferences in your browser settings. Disabling essential cookies may limit platform functionality.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">10. {t('privacy.international', 'International Data Transfers')}</h2>
          <p className="mb-2">As a decentralized platform, your data may be processed across multiple jurisdictions:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Data is encrypted and protected regardless of location</li>
            <li>We use appropriate safeguards for international transfers</li>
            <li>EU users: Data transfers comply with GDPR adequacy requirements</li>
            <li>Users maintain the same privacy rights regardless of data location</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">11. {t('privacy.children', 'Children\'s Privacy')}</h2>
          <div className="bg-orange-900/20 border border-orange-700 p-4 rounded">
            <p className="font-semibold text-orange-400 mb-2">Age Restriction:</p>
            <p>VonVault is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If we discover that a child has provided personal information, we will promptly delete such information.</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">12. {t('privacy.thirdParty', 'Third-Party Services and Integrations')}</h2>
          <p className="mb-2">VonVault integrates with selected third-party services:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Wallet Providers:</strong> MetaMask, WalletConnect, etc. (governed by their privacy policies)</li>
            <li><strong>Blockchain Networks:</strong> Ethereum, Polygon, BSC (public blockchain data)</li>
            <li><strong>Communication Services:</strong> SMS and email providers (encrypted data only)</li>
            <li><strong>Security Services:</strong> Fraud prevention and authentication (minimal data sharing)</li>
          </ul>
          <p className="mt-2">We carefully vet all third-party services and ensure they meet our privacy standards.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">13. {t('privacy.updates', 'Privacy Policy Updates')}</h2>
          <p className="mb-2">We may update this Privacy Policy to reflect:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Changes in our data practices</li>
            <li>New privacy-enhancing technologies</li>
            <li>Legal or regulatory requirements</li>
            <li>Platform feature updates</li>
          </ul>
          <p className="mt-2">Material changes will be communicated via email and platform notifications 30 days in advance.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">14. {t('privacy.compliance', 'Regulatory Compliance')}</h2>
          <p className="mb-2">VonVault maintains compliance with applicable privacy laws:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>GDPR:</strong> EU General Data Protection Regulation compliance</li>
            <li><strong>CCPA:</strong> California Consumer Privacy Act compliance</li>
            <li><strong>Other Jurisdictions:</strong> Local privacy laws as applicable</li>
          </ul>
          <p className="mt-2">Our decentralized approach ensures privacy protection regardless of jurisdiction.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">15. {t('privacy.contact', 'Contact Us About Privacy')}</h2>
          <div className="bg-blue-900/20 border border-blue-700 p-4 rounded">
            <p className="font-semibold mb-2">For privacy-related questions, concerns, or requests:</p>
            <p><strong>Privacy Officer:</strong> privacy@vonartis.com</p>
            <p><strong>Data Protection:</strong> support@vonartis.com</p>
            <p><strong>General Inquiries:</strong> info@vonartis.com</p>
            <p><strong>Response Time:</strong> We respond to privacy requests within 72 hours</p>
            <p className="mt-2 text-blue-300 italic">We respect your privacy and will address all concerns promptly and thoroughly.</p>
          </div>
        </section>
      </div>
    </MobileLayoutWithTabs>
  );
};