// layouts/HomeLayout.tsx
type HomeLayoutProps = {
  leftChild: React.ReactNode;
  rightChild: React.ReactNode;
};

const HomeLayout = ({ leftChild, rightChild }: HomeLayoutProps) => {
  return (
    <div className="min-h-screen">
      { /* Split begins here */}
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left section - 40% viewport width on desktop */}
        <div className="w-full md:w-[40vw] bg-slate-100 p-8">
          <div className="max-w-md mx-auto">{leftChild}</div>
        </div>

        {/* Right section - 60% viewport width on desktop */}
        <div className="w-full md:w-[60vw] bg-white p-8">
          <div className="max-w-2xl mx-auto">{rightChild}</div>
        </div>
      </div>
    </div>
  );
};

export default HomeLayout;
