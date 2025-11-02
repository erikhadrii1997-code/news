export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-2xl font-black tracking-tight">
              <span className="text-red-600">NEWS</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Stay informed. Simple.</p>
          </div>
          <nav aria-label="Footer navigation" className="w-full md:w-auto">
            <ul className="flex flex-wrap gap-3 text-sm font-semibold text-gray-700">
              <li><a className="hover:text-red-600" href="/?cat=general">General</a></li>
              <li><a className="hover:text-red-600" href="/?cat=breaking">Breaking</a></li>
              <li><a className="hover:text-red-600" href="/?cat=technology">Technology</a></li>
              <li><a className="hover:text-red-600" href="/?cat=business">Business</a></li>
              <li><a className="hover:text-red-600" href="/?cat=science">Science</a></li>
              <li><a className="hover:text-red-600" href="/?cat=health">Health</a></li>
              <li><a className="hover:text-red-600" href="/?cat=sports">Sports</a></li>
              <li><a className="hover:text-red-600" href="/?cat=entertainment">Entertainment</a></li>
            </ul>
          </nav>
          <div className="text-sm text-gray-500">
            © {year} NEWS. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
