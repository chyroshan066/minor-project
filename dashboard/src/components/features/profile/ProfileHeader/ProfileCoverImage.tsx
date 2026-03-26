export const ProfileCoverImage = () => (
  <div
    className="relative flex items-center p-0 mt-6 overflow-hidden bg-center bg-cover min-h-75 rounded-2xl"
    style={{
      backgroundImage: "url('/images/curved-images/curved0.jpg')",
      backgroundPositionY: "50%",
    }}
  >
    <span className="absolute inset-y-0 w-full h-full bg-center bg-cover bg-gradient-brand opacity-60" />
  </div>
);
