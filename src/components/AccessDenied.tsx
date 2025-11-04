export const AccessDenied = ({ title, message }: { title: string; message: string }) => {
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };
  return (
    <>
      <h3 className="font-bold text-2xl">{title}</h3>
      <br />
      <div>{message}</div>
      <br />
      <button onClick={handleBack}>← Go Back</button>
    </>
  );
};
