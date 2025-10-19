'use client';
import { useState } from 'react';
import useThemeStore from '@/stores/themeStore';
import { ChevronRightIcon, CodeBracketIcon, AcademicCapIcon, UserGroupIcon, SparklesIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const LandingPage = ({ onGetStarted }) => {
  const { theme, toggleTheme } = useThemeStore();

  const features = [
    {
      icon: <CodeBracketIcon className="h-8 w-8" />,
      title: "Build Projects 📈",
      description: "Create real-world projects with our powerful IDE and learn by doing"
    },
    {
      icon: <AcademicCapIcon className="h-8 w-8" />,
      title: "Free Certificate 🎓",
      description: "Earn industry-recognized certificates upon course completion"
    },
    {
      icon: <SparklesIcon className="h-8 w-8" />,
      title: "No Sign-up needed ✅",
      description: "Start coding immediately without any barriers"
    },
    {
      icon: <UserGroupIcon className="h-8 w-8" />,
      title: "Personalized Learning 👩🏻‍💻",
      description: "AI-powered learning experience tailored to your needs"
    }
  ];

  const testimonials = [
    {
      name: "Ansh Bargoti",
      role: "Application Engineer II @ Flipkart",
      content: "Everything was perfect, I've gained so much knowledge in one week and all the concepts are crystal clear now!"
    },
    {
      name: "Tushar Bhardwaj", 
      role: "SDE Intern @ Microsoft",
      content: "I'm incredibly grateful to CipherSchools for helping me build a solid foundation in DSA and C++."
    },
    {
      name: "Shivam Pansy",
      role: "Site reliability Engg 1 @ Phonepe", 
      content: "I got into cipher school's program during the end of my second semester. It was a part of university collaboration."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-4 bg-black/10 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CS</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            CipherStudio
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <MoonIcon className="h-5 w-5 text-slate-700" />
            )}
          </button>
          <button
            onClick={onGetStarted}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Learn & Grow
            </span>
            <br />
            <span className="text-white">Together for FREE!</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            The ultimate destination for Students and Content Creators who crave an 
            exhilarating online learning experience with our powerful IDE.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
            >
              <span>Start Coding Now</span>
              <ChevronRightIcon className="h-5 w-5" />
            </button>
            
            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-lg transition-all backdrop-blur-sm border border-white/20">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">
            Why Choose CipherStudio?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-all duration-300 transform hover:scale-105 hover:bg-white/10">
                  <div className="text-indigo-400 mb-4 group-hover:text-indigo-300 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">
            We Love to Read Them
          </h2>
          <p className="text-xl text-gray-300 text-center mb-12">
            What our alumni say about us - Alumni Success Stories
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group">
                <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-semibold text-white">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-300 italic">
                    "{testimonial.content}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 text-center bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of developers who are already building amazing projects with CipherStudio
          </p>
          <button
            onClick={onGetStarted}
            className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold text-xl transition-all duration-200 transform hover:scale-105"
          >
            Start Learning Now →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-black/30 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded">
            </div>
            <span className="text-xl font-bold text-white">CipherStudio</span>
          </div>
          <p className="text-gray-400">
            © 2025 CipherStudio • All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;