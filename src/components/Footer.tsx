import Link from 'next/link'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {

  return (
    <footer className="bg-white text-black border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-14 h-14 rounded-full overflow-hidden">
                <img 
                  src="/sabitumo1.png" 
                  alt="Sabitumo Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="ml-3 text-2xl font-bold text-black">Sabitumo</span>
            </div>
            <p className="text-black mb-4 max-w-md">
              Premium quality knives and tactical gear. 
              Serving customers in Georgia and worldwide with the highest standards of quality and reliability.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-black hover:text-gray-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-black hover:text-gray-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-black hover:text-gray-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shop" className="text-black hover:text-gray-600 transition-colors">
                  მაღაზია
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-black hover:text-gray-600 transition-colors">
                  კატეგორიები
                </Link>
              </li>
              <li>
                <Link href="/brands" className="text-black hover:text-gray-600 transition-colors">
                  ბრენდები
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-black hover:text-gray-600 transition-colors">
                  შესახებ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-black hover:text-gray-600 transition-colors">
                  კონტაქტი
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center text-black">
                <MapPin className="w-4 h-4 mr-2 text-gray-600" />
                <span>Tbilisi, Georgia</span>
              </div>
              <div className="flex items-center text-black">
                <Phone className="w-4 h-4 mr-2 text-gray-600" />
                <span>+995 599 42 00 23</span>
              </div>
              <div className="flex items-center text-black">
                <Mail className="w-4 h-4 mr-2 text-gray-600" />
                <span>info@sabitumo.ge</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-300 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-black text-sm">
              © 2024 Sabitumo. ყველა უფლება დაცულია.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-black hover:text-gray-600 text-sm transition-colors">
                კონფიდენციალურობის პოლიტიკა
              </Link>
              <Link href="/terms" className="text-black hover:text-gray-600 text-sm transition-colors">
                სამსახურის პირობები
              </Link>
              <Link href="/shipping" className="text-black hover:text-gray-600 text-sm transition-colors">
                მიწოდების ინფორმაცია
              </Link>
              <Link href="/returns" className="text-black hover:text-gray-600 text-sm transition-colors">
                დაბრუნების პოლიტიკა
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
