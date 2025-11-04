export const AccessDenied = () => {
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };
  return (
    <>
      <div>access denied</div>
      <button onClick={handleBack}>← Go Back</button>
    </>
  );
};
