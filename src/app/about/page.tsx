'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { motion } from 'framer-motion'
import { Shield, Award, Users, Globe, Truck, Clock } from 'lucide-react'

export default function AboutPage() {
  const { t, locale } = useTranslation()

  const features = [
    {
      icon: Shield,
      title: locale === 'ka' ? 'ხარისხის გარანტია' : 'Quality Guarantee',
      description: locale === 'ka' 
        ? 'ყველა პროდუქტი გაიარა მკაცრი ხარისხის კონტროლს'
        : 'Every product undergoes strict quality control'
    },
    {
      icon: Award,
      title: locale === 'ka' ? 'პრემიუმ ბრენდები' : 'Premium Brands',
      description: locale === 'ka'
        ? 'ვმუშაობთ მსოფლიოს საუკეთესო მწარმოებლებთან'
        : 'We work with the world\'s best manufacturers'
    },
    {
      icon: Users,
      title: locale === 'ka' ? 'ექსპერტი მხარდაჭერა' : 'Expert Support',
      description: locale === 'ka'
        ? 'ჩვენი გუნდი ყოველთვის მზადაა დაგეხმაროთ'
        : 'Our team is always ready to help you'
    },
    {
      icon: Globe,
      title: locale === 'ka' ? 'მსოფლიო მიწოდება' : 'Worldwide Shipping',
      description: locale === 'ka'
        ? 'ვმიწოდებთ ყველა კონტინენტზე'
        : 'We ship to every continent'
    },
    {
      icon: Truck,
      title: locale === 'ka' ? 'სწრაფი მიწოდება' : 'Fast Delivery',
      description: locale === 'ka'
        ? 'საქართველოში 24 საათში, მსოფლიოში 3-5 დღეში'
        : '24 hours in Georgia, 3-5 days worldwide'
    },
    {
      icon: Clock,
      title: locale === 'ka' ? '24/7 მხარდაჭერა' : '24/7 Support',
      description: locale === 'ka'
        ? 'ჩვენი მხარდაჭერა ყოველთვის ხელმისაწვდომია'
        : 'Our support is always available'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            {t('navigation', 'about')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {locale === 'ka'
              ? 'Sabitumo არის საქართველოს წამყვანი კომპანია პრემიუმი დანების და ტაქტიკური აღჭურვილობის სფეროში'
              : 'Sabitumo is Georgia\'s leading company in premium knives and tactical equipment'
            }
          </p>
        </motion.div>

        {/* Company Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            {locale === 'ka' ? 'ჩვენი ისტორია' : 'Our Story'}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-600 mb-4">
                {locale === 'ka'
                  ? '2018 წელს დაარსებული, Sabitumo-მ დაიწყო მოგზაურობა პროფესიონალური აღჭურვილობის მიწოდების მიმართულებით. ჩვენი მისიაა უზრუნველყოთ ჩვენი კლიენტები უმაღლესი ხარისხის პროდუქტებით, რომლებიც აშენებულია პროფესიონალებისთვის.'
                  : 'Founded in 2018, Sabitumo began its journey towards providing professional equipment. Our mission is to supply our clients with the highest quality products built for professionals.'
                }
              </p>
              <p className="text-gray-600">
                {locale === 'ka'
                  ? 'დღეს ჩვენ ვმსახურობთ ათასობით კმაყოფილ კლიენტს საქართველოში და მთელ მსოფლიოში, ვთავაზობთ ფართო არჩევანს პრემიუმი ბრენდების პროდუქტებიდან.'
                  : 'Today we serve thousands of satisfied clients in Georgia and worldwide, offering a wide selection of premium brand products.'
                }
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg p-6 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🔪</div>
                <p className="text-amber-800 font-semibold">
                  {locale === 'ka' ? 'პროფესიონალური ხარისხი' : 'Professional Quality'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:border-amber-300 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
