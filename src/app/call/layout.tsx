interface Props {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Props) {
  return <div className="bg-background h-screen">{children}</div>;
}