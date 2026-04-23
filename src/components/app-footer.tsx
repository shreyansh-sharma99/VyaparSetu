export function AppFooter() {
  return (
    <footer className="w-full border-t bg-muted/20 py-6 px-4 md:px-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {import.meta.env.VITE_PLATFORM_NAME}. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Documentation</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Support</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
