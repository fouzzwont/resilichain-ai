import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-sm text-center">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">ParcelDesk</p>
        <h1 className="mt-2 text-4xl font-bold text-foreground">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          That page is not part of the demo workspace. The exception desk is still open.
        </p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          Back to exception desk
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
