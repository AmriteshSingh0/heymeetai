interface Props {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: Props) => {
  return (
    
    <div className="relative min-h-svh w-full">
      <div
        className="absolute inset-0 bg-cover bg-center"
          style={{
          backgroundImage: `url('https://images.hdqwalls.com/wallpapers/blue-milky-way-galaxy-4k-7y.jpg')`,
        }}
      ></div>
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-3xl">{children}</div>
      </div>
    </div>
  );
};
export default AuthLayout;