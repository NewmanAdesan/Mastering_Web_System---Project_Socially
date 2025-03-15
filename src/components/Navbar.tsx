import Link from 'next/link'
import React from 'react'
import DesktopNavbar from './DesktopNavbar'
import MobileNavbar from './MobileNavbar'

function Navbar() {
  return (
    <nav className='sticky top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50'>
    {/* Navbar Container: Sticks to the top, full width, with a semi-transparent background and blur effect */}

      {/* Inner Container: Centers content with a max width and horizontal padding */}
      <div className="max-w-7xl mx-auto px-4"> 

        {/* Flex Container: Aligns children horizontally, centers items, and sets height */}
        <div className="flex items-center justify-between h-16"> 

          {/* Brand Container: Holds the website logo/title */}
          <div className="flex items-center"> 

            {/* Brand Link: Styled website title */}
            <Link href="/" className="text-xl font-bold text-primary font-mono tracking-wider"> 
              Socially
            </Link>
          </div>

          {/* Desktop Navigation: Renders navigation links for larger screens */}
          <DesktopNavbar />

          {/* Mobile Navigation: Renders a responsive navigation menu */}
          <MobileNavbar /> 
        </div>
      </div>
    </nav>
  )
}

export default Navbar