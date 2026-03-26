export const RegistrationHero = () => (
  <div
    className="relative flex items-start pt-12 pb-56 m-4 overflow-hidden bg-center bg-cover min-h-50-screen rounded-xl"
    style={{
      backgroundImage: "url('/images/curved-images/curved14.jpg')",
    }}
  >
    <span className="absolute top-0 left-0 w-full h-full bg-center bg-cover bg-gradient-dark opacity-60" />
    <div className="container z-10">
      <div className="flex flex-wrap justify-center -mx-3">
        <div className="w-full max-w-full px-3 mx-auto mt-0 text-center lg:flex-0 shrink-0 lg:w-5/12">
          <h1 className="mt-12 mb-2 text-surface">Welcome!</h1>
          <p className="text-surface">
            Use these awesome forms to login or create new account in your
            project for free.
          </p>
        </div>
      </div>
    </div>
  </div>
);
