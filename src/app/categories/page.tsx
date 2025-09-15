'use client'

import { useTranslation } from '@/hooks/useTranslation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function CategoriesPage() {
  const { t, locale } = useTranslation()

  const categories = [
    {
      name: t('categories', 'knives'),
      nameKa: 'დანები',
      slug: 'knives',
      description: 'High-quality knives for various purposes',
      icon: '🔪'
    },
    {
      name: t('categories', 'tacticalGear'),
      nameKa: 'ტაქტიკური აღჭურვილობა',
      slug: 'tactical-gear',
      description: 'Tactical equipment and accessories',
      icon: '🎯'
    },
    {
      name: t('categories', 'keychains'),
      nameKa: 'გასაღების ჯაჭვები',
      slug: 'keychains',
      description: 'Decorative and functional keychains',
      icon: '🔑'
    },
    {
      name: t('categories', 'lighters'),
      nameKa: 'აანთებლები',
      slug: 'lighters',
      description: 'High-quality lighters and fire starters',
      icon: '🔥'
    },
    {
      name: t('categories', 'survivalTools'),
      nameKa: 'საშუამშვიდობო ხელსაწყოები',
      slug: 'survival-tools',
      description: 'Essential tools for survival situations',
      icon: '🛠️'
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
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('navigation', 'categories')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {locale === 'ka'
              ? 'გამოიკვლიეთ ჩვენი ყოვლისმომცველი პროფესიონალური აღჭურვილობის სპექტრი'
              : 'Explore our comprehensive range of professional equipment'
            }
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.slug}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <Link href={`/category/${category.slug}`} className="block">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden group-hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-amber-300">
                  <div className="h-48 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                    <div className="text-6xl">{category.icon}</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors">
                      {locale === 'ka' ? category.nameKa : category.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {category.description}
                    </p>
                    <div className="flex items-center text-amber-600 group-hover:text-amber-700 transition-colors">
                      <span className="text-sm font-medium">
                        {locale === 'ka' ? 'ნახვა' : 'View Products'}
                      </span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
