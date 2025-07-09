import React from 'react';
import type { ScreenProps } from '../../types';
import { MobileLayout } from '../layout/MobileLayout';
import { useLanguage } from '../../hooks/useLanguage';

export const TermsOfServiceScreen: React.FC<ScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();

  return (
    <MobileLayout centered maxWidth="md">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <button 
          onClick={onBack} 
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center mb-2">
          {t('legal.termsTitle', 'Terms of Service')}
        </h1>
        <p className="text-center text-sm text-gray-400">
          {t('legal.lastUpdated', 'Last updated: January 2025')}
        </p>
      </div>

      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 space-y-6 text-sm text-gray-300">
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">1. {t('legal.acceptance', 'Acceptance of Terms')}</h2>
          <p className="mb-2">By accessing, using, or registering for VonVault ("Platform"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms") and our Privacy Policy.</p>
          <p>If you do not agree to these Terms, you must not use our Platform or services.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">2. {t('legal.services', 'Description of Services')}</h2>
          <p className="mb-2">VonVault is a decentralized finance (DeFi) investment platform that provides:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Automated crypto-to-fiat investment processing</li>
            <li>Multi-tier membership programs (Basic, Club, Premium, VIP, Elite)</li>
            <li>Multi-wallet portfolio management and tracking</li>
            <li>Smart contract-based investment automation</li>
            <li>Real-time investment monitoring and analytics</li>
            <li>Secure cryptocurrency wallet integration</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">3. {t('legal.eligibility', 'User Eligibility and Requirements')}</h2>
          <p className="mb-2">To use VonVault, you must:</p>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Be at least 18 years of age or the age of majority in your jurisdiction</li>
            <li>Have legal capacity to enter into binding agreements</li>
            <li>Take personal responsibility for compliance with your local laws and regulations</li>
            <li>Complete our Know Your Customer (KYC) verification process</li>
            <li>Understand that you are solely responsible for any tax obligations or legal declarations in your jurisdiction</li>
          </ul>
          
          <div className="bg-orange-900/20 border border-orange-700 p-4 rounded mb-3">
            <p className="font-semibold text-orange-400 mb-2">Accredited Investor Requirement:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Possess sufficient financial understanding and experience to evaluate investment risks and merits</li>
              <li>Have the financial resources to bear the economic risk of loss of their entire investment</li>
              <li>Can make informed investment decisions independently without relying on VonVault for investment advice</li>
              <li>Meet the accredited investor criteria in their jurisdiction (where applicable)</li>
            </ul>
            <p className="mt-2 text-yellow-400 font-semibold">By using VonVault, you represent and warrant that you meet these accredited investor requirements.</p>
          </div>

          <p className="font-semibold text-yellow-400">Restricted Jurisdictions:</p>
          <p>Our services are not available to residents of Cuba, Iran, North Korea, or Syria due to international sanctions. All other jurisdictions are welcome, with users taking full responsibility for compliance with their local laws.</p>
          <p className="mt-2 text-blue-300 italic">VonVault operates as a decentralized platform with enhanced Web3.0 encryption for user privacy and autonomy.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">4. {t('legal.fees', 'Fee Structure and Payment Terms')}</h2>
          <p className="mb-2">VonVault charges the following fees for our services:</p>
          <div className="bg-gray-800/50 p-4 rounded border border-gray-600 mb-3">
            <p className="font-semibold text-green-400 mb-2">Automated Fee Structure:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Smart Contract Fee:</strong> 0.75% (automatically deducted from crypto deposits)</li>
              <li><strong>Conversion Fee:</strong> 2.75% (deducted during crypto-to-fiat conversion)</li>
              <li><strong>Total Combined Fee:</strong> 3.5% on all investments</li>
            </ul>
          </div>
          <p className="mb-2">All fees are:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Automatically calculated and deducted</li>
            <li>Non-refundable once processed</li>
            <li>Clearly displayed before transaction confirmation</li>
            <li>Subject to change with 30 days advance notice</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">5. {t('legal.investment', 'Investment Terms and Conditions')}</h2>
          <p className="mb-3"><strong className="text-red-400">Investment Risk Disclosure:</strong></p>
          <div className="bg-red-900/20 border border-red-700 p-4 rounded mb-3">
            <ul className="list-disc pl-6 space-y-1">
              <li>All investments carry risk of partial or total loss</li>
              <li>Cryptocurrency markets are highly volatile and unpredictable</li>
              <li>Past performance does not guarantee future results</li>
              <li>You may lose more than your initial investment</li>
              <li>Investment returns are not guaranteed</li>
              <li><strong>These investments are suitable only for accredited investors who can afford to lose their entire investment</strong></li>
            </ul>
          </div>
          
          <div className="bg-blue-900/20 border border-blue-700 p-4 rounded mb-3">
            <p className="font-semibold text-blue-400 mb-2">Accredited Investor Acknowledgment:</p>
            <p className="mb-2">By proceeding with any investment, you confirm that you:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Have independently evaluated the investment opportunity</li>
              <li>Are not relying on VonVault for investment advice or recommendations</li>
              <li>Have sufficient financial resources to bear the risk of loss</li>
              <li>Possess the financial sophistication to understand the risks involved</li>
            </ul>
          </div>
          
          <p className="mb-2"><strong>Investment Process:</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Minimum investment amounts vary by membership tier</li>
            <li>Investments are processed through smart contracts</li>
            <li>Lock-up periods apply and vary by investment plan</li>
            <li>Early withdrawal may incur penalties</li>
            <li>All investments are final once confirmed</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">6. {t('legal.smartContract', 'Smart Contract Terms')}</h2>
          <p className="mb-2">By using VonVault, you acknowledge and agree that:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Smart contracts are deployed on Ethereum, Polygon, and BSC networks</li>
            <li>Smart contract code is immutable once deployed</li>
            <li>You are responsible for understanding smart contract functionality</li>
            <li>Network gas fees are separate from our service fees</li>
            <li>Blockchain transactions are irreversible</li>
            <li>Smart contract vulnerabilities may exist despite security audits</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">7. {t('legal.wallet', 'Wallet Responsibilities and Security')}</h2>
          <p className="mb-2">You are solely responsible for:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Maintaining the security of your connected wallets</li>
            <li>Protecting your private keys and seed phrases</li>
            <li>Ensuring wallet compatibility with supported networks</li>
            <li>Verifying transaction details before confirmation</li>
            <li>Understanding the risks of multi-wallet management</li>
            <li>Reporting any unauthorized access immediately</li>
          </ul>
          <p className="mt-3 text-yellow-400 font-semibold">VonVault does not store your private keys or have access to your funds.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">8. {t('legal.compliance', 'Regulatory Compliance and User Responsibility')}</h2>
          <p className="mb-2">VonVault operates as a decentralized platform with the following approach:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Users are solely responsible for compliance with their local laws and regulations</li>
            <li>Enhanced Web3.0 encryption provides user privacy and anonymity</li>
            <li>Platform operates in a decentralized manner respecting user autonomy</li>
            <li>Users must make their own determinations regarding tax obligations</li>
            <li>KYC verification is for platform security, not regulatory reporting</li>
            <li>Users are responsible for any required legal declarations in their jurisdiction</li>
          </ul>
          <p className="mt-3 text-blue-300 font-semibold">VonVault respects user privacy and operates with minimal data collection consistent with security requirements.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">9. {t('legal.prohibited', 'Prohibited Activities')}</h2>
          <p className="mb-2">You may not use VonVault for:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Money laundering or terrorist financing</li>
            <li>Market manipulation or fraudulent trading</li>
            <li>Circumventing our security measures</li>
            <li>Creating multiple accounts to evade restrictions</li>
            <li>Using our platform for illegal activities</li>
            <li>Violating any applicable laws or regulations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">10. {t('legal.liability', 'Limitation of Liability')}</h2>
          <div className="bg-gray-800/50 p-4 rounded border border-gray-600">
            <p className="font-semibold mb-2">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>VonVault's liability is limited to the fees you have paid in the last 12 months</li>
              <li>We are not liable for indirect, incidental, or consequential damages</li>
              <li>We do not guarantee uninterrupted service availability</li>
              <li>Smart contract risks and blockchain network issues are excluded</li>
              <li>Market losses and investment performance are your responsibility</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">11. {t('legal.termination', 'Account Termination')}</h2>
          <p className="mb-2">We may suspend or terminate your account if:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>You violate these Terms or our policies</li>
            <li>Your account shows suspicious activity</li>
            <li>You fail to complete required verification</li>
            <li>Legal or regulatory requirements demand it</li>
          </ul>
          <p className="mt-3">Upon termination, you may withdraw available funds subject to applicable restrictions and fees.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">12. {t('legal.ip', 'Intellectual Property')}</h2>
          <p className="mb-2">VonVault and its content are protected by intellectual property laws. You may not:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Copy, reproduce, or distribute our content without permission</li>
            <li>Reverse engineer our platform or smart contracts</li>
            <li>Use our trademarks or branding without authorization</li>
            <li>Create derivative works based on our platform</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">13. {t('legal.dispute', 'Dispute Resolution')}</h2>
          <p className="mb-2">Any disputes arising from these Terms will be resolved through:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Good faith negotiation as the first step</li>
            <li>Binding arbitration if negotiation fails</li>
            <li>Arbitration conducted under applicable arbitration rules</li>
            <li>Individual basis only - no class action lawsuits</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">14. {t('legal.changes', 'Changes to Terms')}</h2>
          <p className="mb-2">We may update these Terms at any time. Changes will be:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Posted on our platform with the effective date</li>
            <li>Communicated via email for material changes</li>
            <li>Effective 30 days after posting unless otherwise stated</li>
          </ul>
          <p className="mt-2">Continued use of VonVault after changes constitutes acceptance of updated Terms.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">15. {t('legal.contact', 'Contact Information')}</h2>
          <div className="bg-blue-900/20 border border-blue-700 p-4 rounded">
            <p className="font-semibold mb-2">For questions about these Terms:</p>
            <p><strong>Legal Department:</strong> legal@vonartis.com</p>
            <p><strong>General Support:</strong> support@vonartis.com</p>
            <p><strong>Business Address:</strong> [TO BE ADDED]</p>
          </div>
        </section>
      </div>
    </MobileLayout>
  );
};