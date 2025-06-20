export default function AdminSpinner() {
  return (
    // Full-screen fixed overlay
    <div
      className="
        fixed inset-0 
        flex items-center justify-center 
        bg-white/30 backdrop-blur 
        z-50
      "
    >
      {/* Spinner */}
      <div className="flex justify-center items-center ">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#136A86]"></div>
      </div>
    </div>
  );
}
