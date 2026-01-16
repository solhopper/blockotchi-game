const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-3 text-sm leading-6">
          <p>
            This Privacy Policy explains how Blockotchi (the "App") handles information when you use the App.
          </p>

          <h2 className="text-lg font-semibold">Information We Collect</h2>
          <p>
            The App may process your public wallet address to display your connected wallet and to create transactions
            you choose to approve. We do not ask for or store your private keys or seed phrase.
          </p>

          <h2 className="text-lg font-semibold">On-Chain Activity</h2>
          <p>
            When you send a transaction, the details are recorded on the Solana blockchain and may be publicly visible.
          </p>

          <h2 className="text-lg font-semibold">Third-Party Services</h2>
          <p>
            The App connects to Solana RPC providers to read blockchain data and submit transactions. Those providers
            may receive your IP address and request metadata as part of normal network operations.
          </p>

          <h2 className="text-lg font-semibold">Cookies / Local Storage</h2>
          <p>
            The App may use local storage to remember gameplay settings and session-related state on your device.
          </p>

          <h2 className="text-lg font-semibold">Contact</h2>
          <p>
            If you have questions about this Privacy Policy, contact the developer of the App.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
