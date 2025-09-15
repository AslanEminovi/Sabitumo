'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'
import { useState } from 'react'

export default function ContactPage() {
  const { t, locale } = useTranslation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement contact form submission
    console.log('Contact form submitted:', formData)
  }

  const contactInfo = [
    {
      icon: MapPin,
      title: locale === 'ka' ? 'მისამართი' : 'Address',
      content: 'Tbilisi, Georgia',
      color: 'text-blue-600'
    },
    {
      icon: Phone,
      title: locale === 'ka' ? 'ტელეფონი' : 'Phone',
      content: '+995 599 42 00 23',
      color: 'text-green-600'
    },
    {
      icon: Mail,
      title: locale === 'ka' ? 'ელ-ფოსტა' : 'Email',
      content: 'info@sabitumo.ge',
      color: 'text-purple-600'
    },
    {
      icon: Clock,
      title: locale === 'ka' ? 'სამუშაო საათები' : 'Working Hours',
      content: locale === 'ka' ? 'ორშაბათი - პარასკევი: 9:00 - 18:00' : 'Monday - Friday: 9:00 - 18:00',
      color: 'text-amber-600'
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
            {t('navigation', 'contact')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {locale === 'ka'
              ? 'დაგვიკავშირდით ნებისმიერი კითხვისთვის ან შეთავაზებისთვის'
              : 'Get in touch with us for any questions or inquiries'
            }
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {locale === 'ka' ? 'საკონტაქტო ინფორმაცია' : 'Contact Information'}
            </h2>
            
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-md border border-gray-200"
              >
                <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0`}>
                  <info.icon className={`w-5 h-5 ${info.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {info.title}
                  </h3>
                  <p className="text-gray-600">
                    {info.content}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Map Placeholder */}
            <motion.div
              variants={itemVariants}
              className="bg-gray-200 rounded-lg h-64 flex items-center justify-center"
            >
              <div className="text-center text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-2" />
                <p>{locale === 'ka' ? 'რუკა აქ დაემატება' : 'Map will be added here'}</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-200"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {locale === 'ka' ? 'გაგვიგზავნეთ შეტყობინება' : 'Send us a Message'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ka' ? 'სახელი' : 'Name'}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                  placeholder={locale === 'ka' ? 'თქვენი სახელი' : 'Your name'}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ka' ? 'ელ-ფოსტა' : 'Email'}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                  placeholder={locale === 'ka' ? 'თქვენი ელ-ფოსტა' : 'Your email'}
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ka' ? 'თემა' : 'Subject'}
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                  placeholder={locale === 'ka' ? 'შეტყობინების თემა' : 'Message subject'}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ka' ? 'შეტყობინება' : 'Message'}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 resize-none"
                  placeholder={locale === 'ka' ? 'თქვენი შეტყობინება' : 'Your message'}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
              >
                <Send className="w-5 h-5 mr-2" />
                {locale === 'ka' ? 'გაგზავნა' : 'Send Message'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
