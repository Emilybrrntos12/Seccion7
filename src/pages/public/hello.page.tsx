import LogoutButton from "../../components/logout-button";

const HelloPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">Hello Word</h1>
      <LogoutButton />
    </div>
  );
};

export default HelloPage;
