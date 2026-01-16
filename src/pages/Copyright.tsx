const Copyright = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold">Copyright</h1>
        <div className="space-y-3 text-sm leading-6">
          <p>
            © {new Date().getFullYear()} Blockotchi. All rights reserved.
          </p>
          <p>
            Blockotchi and related names, logos, and artwork are the property of their respective owners.
          </p>
          <p>
            If you believe any content in this App infringes your rights, please contact the developer with details and
            a link to the relevant content.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Copyright;
