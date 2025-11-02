export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-8 sm:mt-12 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="text-xl sm:text-2xl font-black tracking-tight">
              <span className="text-red-600">NEWS</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Stay informed. Simple.</p>
          </div>
          <nav aria-label="Footer navigation" className="w-full md:w-auto">
            <ul className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-gray-700">
              <li><a className="hover:text-red-600 px-2 py-2 rounded-md hover:bg-red-50 transition-colors touch-manipulation" href="/?cat=general">General</a></li>
              <li><a className="hover:text-red-600 px-2 py-2 rounded-md hover:bg-red-50 transition-colors touch-manipulation" href="/?cat=breaking">Breaking</a></li>
              <li><a className="hover:text-red-600 px-2 py-2 rounded-md hover:bg-red-50 transition-colors touch-manipulation" href="/?cat=technology">Technology</a></li>
              <li><a className="hover:text-red-600 px-2 py-2 rounded-md hover:bg-red-50 transition-colors touch-manipulation" href="/?cat=business">Business</a></li>
              <li><a className="hover:text-red-600 px-2 py-2 rounded-md hover:bg-red-50 transition-colors touch-manipulation" href="/?cat=science">Science</a></li>
              <li><a className="hover:text-red-600 px-2 py-2 rounded-md hover:bg-red-50 transition-colors touch-manipulation" href="/?cat=health">Health</a></li>
              <li><a className="hover:text-red-600 px-2 py-2 rounded-md hover:bg-red-50 transition-colors touch-manipulation" href="/?cat=sports">Sports</a></li>
              <li><a className="hover:text-red-600 px-2 py-2 rounded-md hover:bg-red-50 transition-colors touch-manipulation" href="/?cat=entertainment">Entertainment</a></li>
            </ul>
          </nav>
          <div className="text-xs sm:text-sm text-gray-500">
            © {year} NEWS. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
